import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import {
  createProject,
  createTaxTransfer,
  getAdminProjectSummary,
  getTaxTransferBudget,
  listAdminPendingProjects,
  listMyAdminProjects,
  listTaxTransfers,
  type AdminProjectPendingDTO,
  type AdminTransferDTO,
  updateProjectStatus,
} from "../../util/crowdfundingApi";
import {
  buildTransactionExplorerUrl,
  getExplorerLabel,
} from "../../util/explorerLinks";

export default function Projects() {
  const { hasRole, user } = useAuth();
  const isSuperadmin = hasRole("SUPERADMIN");

  const [projects, setProjects] = useState<AdminProjectPendingDTO[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [summary, setSummary] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalProjects: 0,
  });
  const [myProjects, setMyProjects] = useState<
    Array<{
      id: number;
      title: string;
      status: "PENDING" | "APPROVED" | "REJECTED" | "INACTIVE";
      targetXlm: number;
      raisedXlm: number;
      createdAt: string;
    }>
  >([]);
  const [budget, setBudget] = useState<number>(0);
  const [transfers, setTransfers] = useState<AdminTransferDTO[]>([]);
  const [toWallet, setToWallet] = useState("");
  const [amountXlm, setAmountXlm] = useState("");
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [projectFeedback, setProjectFeedback] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    ngoName: "",
    ngoWallet: user?.walletAddress ?? "",
    title: "",
    description: "",
    taxCategory: "EDUCACAO",
    targetXlm: "",
    metadataUri: "ipfs://",
  });
  const explorerLabel = getExplorerLabel();

  const selected = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? projects[0],
    [projects, selectedId],
  );

  const loadSuperadmin = async () => {
    const [data, summaryData] = await Promise.all([
      listAdminPendingProjects(),
      getAdminProjectSummary(),
    ]);
    setProjects(data);
    setSummary({
      pending: summaryData.pending,
      approved: summaryData.approved,
      rejected: summaryData.rejected,
      totalProjects: summaryData.total_projects,
    });
    if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
  };

  const loadProjectOwner = async () => {
    const data = await listMyAdminProjects();
    setMyProjects(data);
  };

  const loadTransfers = async () => {
    if (!isSuperadmin) {
      setBudget(0);
      setTransfers([]);
      return;
    }

    const [budgetData, transferData] = await Promise.all([
      getTaxTransferBudget(),
      listTaxTransfers(),
    ]);
    setBudget(Number(budgetData.availableXlm));
    setTransfers(transferData);
  };

  useEffect(() => {
    if (isSuperadmin) {
      void loadSuperadmin().catch(() => {});
      return;
    }
    void loadProjectOwner().catch(() => {});
  }, [isSuperadmin]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void loadTransfers().catch(() => {});
  }, [isSuperadmin]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user?.walletAddress) {
      setProjectForm((prev) => ({ ...prev, ngoWallet: prev.ngoWallet || user.walletAddress || "" }));
    }
  }, [user?.walletAddress]);

  const handleStatusChange = async (status: "APPROVED" | "REJECTED") => {
    if (!selected) return;
    await updateProjectStatus(selected.id, { status });
    await loadSuperadmin();
  };

  const handleCreateProject = async () => {
    const targetXlm = Number(projectForm.targetXlm);
    if (
      !projectForm.ngoName ||
      !projectForm.ngoWallet ||
      !projectForm.title ||
      !projectForm.description ||
      !projectForm.taxCategory ||
      !projectForm.metadataUri ||
      !(targetXlm > 0)
    ) {
      setProjectFeedback("Preencha todos os campos obrigatórios do projeto.");
      return;
    }

    setProjectFeedback(null);
    setIsSubmittingProject(true);
    try {
      await createProject({
        ngoName: projectForm.ngoName,
        ngoWallet: projectForm.ngoWallet,
        title: projectForm.title,
        description: projectForm.description,
        taxCategory: projectForm.taxCategory,
        targetXlm,
        metadataUri: projectForm.metadataUri,
      });
      setProjectForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        targetXlm: "",
      }));
      await loadProjectOwner();
      setProjectFeedback("Projeto enviado para aprovação com sucesso.");
    } catch (error) {
      setProjectFeedback(error instanceof Error ? error.message : "Falha ao enviar projeto.");
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const handleCreateTransfer = async () => {
    if (!toWallet || Number(amountXlm) <= 0) return;
    setFeedback(null);
    setIsSubmittingTransfer(true);
    try {
      const result = await createTaxTransfer({
        toWallet,
        amountXlm: Number(amountXlm),
      });
      if (result.error) throw new Error(result.error);
      setToWallet("");
      setAmountXlm("");
      await loadTransfers();
      setFeedback("Transferência criada com sucesso.");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Falha ao criar transferência.",
      );
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Gestão de Projetos
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          {isSuperadmin
            ? "Aprove projetos e execute transferências de taxa."
            : "Envie seus projetos para aprovação e acompanhe o status."}
        </p>
      </div>

      {isSuperadmin ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <SummaryCard title="Pendentes" value={summary.pending} />
            <SummaryCard title="Aprovados" value={summary.approved} />
            <SummaryCard title="Rejeitados" value={summary.rejected} />
            <SummaryCard title="Total Projetos" value={summary.totalProjects} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 space-y-3">
              <h3 className="font-bold text-slate-900">Solicitações Pendentes</h3>
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedId(project.id)}
                  className={`w-full text-left bg-white p-4 rounded-xl border transition ${
                    selected?.id === project.id
                      ? "border-2 border-[#002B99]"
                      : "border-slate-200"
                  }`}
                >
                  <h4 className="font-bold text-slate-900 text-sm">{project.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">ONG: {project.ngoName}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-[10px] font-bold">
                      {project.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              {selected ? (
                <>
                  <h2 className="text-xl font-black text-slate-900">{selected.title}</h2>
                  <p className="text-sm text-slate-500">{selected.ngoName}</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="rounded-lg border border-red-300 text-red-700 px-4 py-2 text-sm font-bold hover:bg-red-50"
                      onClick={() => void handleStatusChange("REJECTED")}
                    >
                      Rejeitar
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-bold hover:bg-green-700"
                      onClick={() => void handleStatusChange("APPROVED")}
                    >
                      Aprovar Projeto
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm font-bold text-slate-500">
                  Nenhum projeto pendente para análise.
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Criar Novo Projeto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={projectForm.ngoName}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, ngoName: e.target.value }))}
                placeholder="Nome da ONG"
                className="rounded-xl border border-slate-300 px-4 py-3"
              />
              <input
                value={projectForm.ngoWallet}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, ngoWallet: e.target.value }))}
                placeholder="Wallet da ONG (G...)"
                className="rounded-xl border border-slate-300 px-4 py-3"
              />
              <input
                value={projectForm.title}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Título do projeto"
                className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2"
              />
              <textarea
                value={projectForm.description}
                onChange={(e) =>
                  setProjectForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Descrição"
                className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2 min-h-28"
              />
              <input
                value={projectForm.taxCategory}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, taxCategory: e.target.value }))}
                placeholder="Categoria fiscal"
                className="rounded-xl border border-slate-300 px-4 py-3"
              />
              <input
                type="number"
                min="0"
                step="0.0000001"
                value={projectForm.targetXlm}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, targetXlm: e.target.value }))}
                placeholder="Meta (XLM)"
                className="rounded-xl border border-slate-300 px-4 py-3"
              />
              <input
                value={projectForm.metadataUri}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, metadataUri: e.target.value }))}
                placeholder="Metadata URI (ipfs://...)"
                className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2"
              />
            </div>
            <button
              type="button"
              disabled={isSubmittingProject}
              onClick={() => void handleCreateProject()}
              className="rounded-xl bg-[#002B99] text-white px-5 py-3 text-sm font-black uppercase tracking-wider disabled:opacity-60"
            >
              {isSubmittingProject ? "Enviando..." : "Enviar para aprovação"}
            </button>
            {projectFeedback ? (
              <p className="text-xs font-bold text-slate-600 break-all">{projectFeedback}</p>
            ) : null}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-black text-slate-900 mb-3">Meus Projetos Enviados</h3>
            <div className="space-y-3">
              {myProjects.map((project) => (
                <div
                  key={project.id}
                  className="border border-slate-200 rounded-xl p-4 space-y-2"
                >
                  <div className="flex justify-between gap-3">
                    <p className="font-bold text-slate-900">{project.title}</p>
                    <span className={`text-[10px] font-black px-2 py-1 rounded ${badgeClass(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Meta: {Number(project.targetXlm).toLocaleString("pt-BR")} XLM
                  </p>
                  <p className="text-xs text-slate-500">
                    Captado: {Number(project.raisedXlm).toLocaleString("pt-BR")} XLM
                  </p>
                </div>
              ))}
              {myProjects.length === 0 ? (
                <p className="text-xs text-slate-500">Você ainda não enviou projetos.</p>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {isSuperadmin ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <h3 className="text-lg font-black text-slate-900">Transferência de Taxas</h3>

          <p className="text-sm text-slate-500">
            Saldo disponível:{" "}
            <span className="font-black text-[#002B99]">
              {budget.toLocaleString("pt-BR")} XLM
            </span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={toWallet}
              onChange={(e) => setToWallet(e.target.value)}
              placeholder="Wallet destino (G...)"
              className="rounded-xl border border-slate-300 px-4 py-3"
            />
            <input
              value={amountXlm}
              onChange={(e) => setAmountXlm(e.target.value)}
              type="number"
              min="0"
              step="0.0000001"
              placeholder="Valor em XLM"
              className="rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>
          <button
            type="button"
            disabled={isSubmittingTransfer}
            onClick={() => void handleCreateTransfer()}
            className="rounded-xl bg-[#002B99] text-white px-5 py-3 text-sm font-black uppercase tracking-wider disabled:opacity-60"
          >
            {isSubmittingTransfer ? "Processando..." : "Executar Transferência"}
          </button>
          {feedback ? (
            <p className="text-xs font-bold text-slate-600 break-all">{feedback}</p>
          ) : null}

          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider">
              Histórico
            </h4>
            {transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="border border-slate-200 rounded-xl p-3 text-xs"
              >
                <p>
                  <span className="font-bold">Destino:</span> {transfer.toWallet}
                </p>
                <p>
                  <span className="font-bold">Valor:</span>{" "}
                  {Number(transfer.amountXlm).toLocaleString("pt-BR")} XLM
                </p>
                <p>
                  <span className="font-bold">Status:</span> {transfer.status}
                </p>
                {transfer.txHash ? (
                  <p className="break-all">
                    <span className="font-bold">Tx:</span>{" "}
                    {buildTransactionExplorerUrl(transfer.txHash) ? (
                      <a
                        href={buildTransactionExplorerUrl(transfer.txHash) ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#002B99] hover:underline inline-flex items-center gap-1"
                        title={`Abrir transacao no ${explorerLabel}`}
                      >
                        {transfer.txHash}
                        <span className="material-icons text-sm">open_in_new</span>
                      </a>
                    ) : (
                      transfer.txHash
                    )}
                  </p>
                ) : null}
                {transfer.failureReason ? (
                  <p className="text-red-600 break-all">{transfer.failureReason}</p>
                ) : null}
              </div>
            ))}
            {transfers.length === 0 ? (
              <p className="text-xs text-slate-500">Sem transferências ainda.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function badgeClass(status: "PENDING" | "APPROVED" | "REJECTED" | "INACTIVE") {
  if (status === "APPROVED") return "bg-emerald-100 text-emerald-700";
  if (status === "REJECTED") return "bg-rose-100 text-rose-700";
  if (status === "INACTIVE") return "bg-slate-200 text-slate-700";
  return "bg-orange-100 text-orange-700";
}

function SummaryCard(props: { title: string; value: number }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
      <p className="text-slate-500 text-sm font-medium">{props.title}</p>
      <h2 className="text-3xl font-black text-slate-900">
        {props.value.toLocaleString("pt-BR")}
      </h2>
    </div>
  );
}
