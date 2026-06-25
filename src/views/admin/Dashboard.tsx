import { useEffect, useState } from "react";
import {
  getAdminDashboard,
  getAdminDonationSummary,
  getAdminProjectSummary,
  getAdminReportSummary,
  listMyAdminProjects,
  resetDemoDonations,
  type AdminDashboardDTO,
  type AdminDonationSummaryDTO,
} from "../../util/crowdfundingApi";
import { calculateProjectDonationMetrics } from "../../util/donationMetrics";
import { useAuth } from "../../providers/AuthProvider";

const emptyDashboard: AdminDashboardDTO = {
  activity: [],
  featuredProjects: [],
};

export default function Dashboard() {
  const { hasRole } = useAuth();
  const isSuperadmin = hasRole("SUPERADMIN");
  const [summary, setSummary] = useState({
    totalXlm: 0,
    projectXlm: 0,
    feeXlm: 0,
    totalProjects: 0,
    pendingProjects: 0,
    uniqueDonors: 0,
  });
  const [dashboard, setDashboard] = useState<AdminDashboardDTO>(emptyDashboard);
  const [donationSummary, setDonationSummary] =
    useState<AdminDonationSummaryDTO | null>(null);
  const [myProjectsCount, setMyProjectsCount] = useState(0);
  const [myPendingCount, setMyPendingCount] = useState(0);
  const [myApprovedCount, setMyApprovedCount] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const loadSuperadminDashboard = async () => {
    setLoadError(false);
    const [
      summaryResponse,
      projectSummaryResponse,
      dashboardResponse,
      donationSummaryResponse,
    ] = await Promise.all([
      getAdminReportSummary(),
      getAdminProjectSummary(),
      getAdminDashboard(),
      getAdminDonationSummary(),
    ]);
    setSummary({
      ...summaryResponse,
      pendingProjects: projectSummaryResponse.pending,
    });
    setDashboard(dashboardResponse);
    setDonationSummary(donationSummaryResponse);
  };

  useEffect(() => {
    if (isSuperadmin) {
      void loadSuperadminDashboard().catch(() => setLoadError(true));
      return;
    }
    void listMyAdminProjects()
      .then((projects) => {
        setMyProjectsCount(projects.length);
        setMyPendingCount(
          projects.filter((project) => project.status === "PENDING").length,
        );
        setMyApprovedCount(
          projects.filter((project) => project.status === "APPROVED").length,
        );
      })
      .catch(() => setLoadError(true));
  }, [isSuperadmin]);

  const handleResetDemoDonations = async () => {
    if (resetConfirm !== "ZERAR_DOACOES_TESTE") {
      setResetFeedback("Digite ZERAR_DOACOES_TESTE para confirmar.");
      return;
    }

    setIsResetting(true);
    setResetFeedback(null);

    try {
      const response = await resetDemoDonations("ZERAR_DOACOES_TESTE");

      if (!response.ok) {
        throw new Error(response.error ?? "Reset nao autorizado.");
      }

      clearDonationLocalStorage(response.localStorageKeysToClear);
      setResetFeedback(
        response.message ??
          `Reset concluido. Registros zerados/removidos: ${
            response.recordsRemovedOrZeroed ?? 0
          }.`,
      );
      setResetConfirm("");
      setShowResetConfirm(false);
      await loadSuperadminDashboard();
    } catch (error) {
      setResetFeedback(
        error instanceof Error ? error.message : "Falha ao resetar doacoes.",
      );
    } finally {
      setIsResetting(false);
    }
  };

  if (!isSuperadmin) {
    return (
      <div className="animate-fade-in space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Painel do Administrador de Projeto
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Projetos enviados"
            value={myProjectsCount.toLocaleString("pt-BR")}
            subtitle="Solicitações criadas pela sua conta"
          />
          <MetricCard
            title="Pendentes"
            value={myPendingCount.toLocaleString("pt-BR")}
            subtitle="Aguardando avaliação do superadmin"
          />
          <MetricCard
            title="Aprovados"
            value={myApprovedCount.toLocaleString("pt-BR")}
            subtitle="Projetos habilitados para repasses"
          />
        </div>
        {loadError ? (
          <p className="text-sm font-bold text-red-600">
            Não foi possível carregar dados do painel.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Visao Geral do Admin
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Acompanhe o desempenho da plataforma e metricas principais.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Arrecadado"
          value={`${summary.totalXlm.toLocaleString("pt-BR")} XLM`}
          subtitle={`Líquido projetos: ${summary.projectXlm.toLocaleString("pt-BR")} XLM`}
        />
        <MetricCard
          title="Doadores Ativos"
          value={summary.uniqueDonors.toLocaleString("pt-BR")}
          subtitle="No ultimo mes"
        />
        <MetricCard
          title="Projetos em Analise"
          value={summary.pendingProjects.toLocaleString("pt-BR")}
          subtitle="Aguardando aprovacao"
        />
      </div>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Gestao de Doacoes
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Numeros calculados pela fonte unica de metricas de doacao.
            </p>
            <p className="mt-2 text-xs font-bold text-emerald-700">
              Dados de arrecadacao demo zerados.
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
            Base: {donationSummary?.environmentStatus ?? "indisponivel"}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <DonationMetric
            title="Total arrecadado"
            value={`${(donationSummary?.totalRaised ?? summary.totalXlm).toLocaleString("pt-BR")} XLM`}
          />
          <DonationMetric
            title="Doacoes por projeto"
            value={(donationSummary?.projects.length ?? 0).toLocaleString(
              "pt-BR",
            )}
          />
          <DonationMetric
            title="Doacoes de teste"
            value={(donationSummary?.demoDonationCount ?? 0).toLocaleString(
              "pt-BR",
            )}
          />
          <DonationMetric
            title="Ultima atualizacao"
            value={
              donationSummary?.lastUpdated
                ? new Date(donationSummary.lastUpdated).toLocaleString("pt-BR")
                : "-"
            }
          />
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-4 py-3">Projeto</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Doacoes</th>
                <th className="px-4 py-3">Progresso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(donationSummary?.projects ?? []).map((project) => (
                <tr key={project.projectId}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {project.title}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {project.totalRaised.toLocaleString("pt-BR")}{" "}
                    {project.currency}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {project.donationCount.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {Math.min(100, project.progressPercent)}%
                  </td>
                </tr>
              ))}
              {donationSummary?.projects.length === 0 ||
              donationSummary === null ? (
                <tr>
                  <td className="px-4 py-3 text-slate-500" colSpan={4}>
                    Sem metricas de doacao disponiveis.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-4 py-3">Doacao confirmada</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Rede</th>
                <th className="px-4 py-3">Hash</th>
                <th className="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(donationSummary?.recentDonations ?? []).map((donation) => (
                <tr key={`${donation.id}-${donation.txHash ?? "sem-hash"}`}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {donation.projectName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {donation.amount.toLocaleString("pt-BR")} {donation.asset}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {donation.network}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#002B99]">
                    {donation.txHash ? shortHash(donation.txHash) : "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(donation.createdAt).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
              {(donationSummary?.recentDonations?.length ?? 0) === 0 ? (
                <tr>
                  <td className="px-4 py-3 text-slate-500" colSpan={5}>
                    Ainda nao ha doacoes confirmadas registradas.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Resetar doacoes de teste
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {donationSummary?.resetMessage ??
                  "Reset administrativo disponivel apenas em ambiente autorizado."}
              </p>
            </div>

            <button
              type="button"
              disabled={!donationSummary?.resetEnabled || isResetting}
              onClick={() => setShowResetConfirm((value) => !value)}
              className="rounded-xl bg-[#002B99] px-4 py-3 text-xs font-black uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Resetar doacoes de teste
            </button>
          </div>

          {showResetConfirm ? (
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                value={resetConfirm}
                onChange={(event) => setResetConfirm(event.target.value)}
                placeholder="Digite ZERAR_DOACOES_TESTE"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
              />
              <button
                type="button"
                disabled={isResetting}
                onClick={() => void handleResetDemoDonations()}
                className="rounded-xl border border-red-300 px-4 py-3 text-xs font-black uppercase tracking-wider text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {isResetting ? "Resetando..." : "Confirmar reset"}
              </button>
            </div>
          ) : null}

          {resetFeedback ? (
            <p className="mt-3 text-xs font-bold text-slate-600 break-all">
              {resetFeedback}
            </p>
          ) : null}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Arrecadacao Mensal
          </h3>
          <p className="text-sm text-slate-500 mb-6">Comparativo XLM vs BRL</p>
          <div className="flex-1 border-b-2 border-l-2 border-slate-100 relative min-h-[200px] flex items-end">
            <svg
              className="w-full h-full absolute inset-0"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <path
                d="M0,80 Q25,75 50,60 T100,20 L100,100 L0,100 Z"
                fill="rgba(0,43,153,0.05)"
              />
              <path
                d="M0,80 Q25,75 50,60 T100,20"
                fill="none"
                stroke="#002B99"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">
            Atividade Recente
          </h3>
          <div className="space-y-5">
            {dashboard.activity.map((item) => (
              <div
                key={`${item.title}-${item.occurredAt}`}
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                  <span className="material-icons text-[16px]">
                    {item.icon}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formatRelativeTime(item.occurredAt)}
                  </p>
                </div>
              </div>
            ))}
            {dashboard.activity.length === 0 ? (
              <p className="text-sm text-slate-500">Sem atividade recente.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            Projetos em Destaque
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Nome do Projeto</th>
                <th className="px-6 py-4">ONG</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Captação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboard.featuredProjects.map((project) => (
                <FeaturedProjectRow key={project.projectId} project={project} />
              ))}
              {dashboard.featuredProjects.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-500" colSpan={4}>
                    Sem projetos para destacar.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(isoDate: string) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `há ${diffHour} h`;
  const diffDay = Math.floor(diffHour / 24);
  return `há ${diffDay} dia(s)`;
}

function shortHash(hash: string) {
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
}

function MetricCard(props: { title: string; value: string; subtitle: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-slate-500 text-sm font-medium mb-1">{props.title}</p>
      <h2 className="text-3xl font-black text-slate-900">{props.value}</h2>
      <p className="text-slate-400 text-xs mt-1">{props.subtitle}</p>
    </div>
  );
}

function DonationMetric(props: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {props.title}
      </p>
      <p className="mt-2 text-lg font-black text-slate-900">{props.value}</p>
    </div>
  );
}

function FeaturedProjectRow(props: {
  project: AdminDashboardDTO["featuredProjects"][number];
}) {
  const metrics = calculateProjectDonationMetrics({
    id: props.project.projectId,
    title: props.project.title,
    ngoName: props.project.ngoName,
    status: props.project.status,
    raisedXlm: props.project.raisedXlm,
    targetXlm: props.project.targetXlm,
  });

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4 font-medium text-slate-900">
        {props.project.title}
      </td>
      <td className="px-6 py-4 text-slate-500">{props.project.ngoName}</td>
      <td className="px-6 py-4">
        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">
          {props.project.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-[#002B99] font-bold text-xs">
          {metrics.totalRaised.toLocaleString("pt-BR")} /{" "}
          {metrics.targetAmount.toLocaleString("pt-BR")} XLM
        </span>
      </td>
    </tr>
  );
}

function clearDonationLocalStorage(keysToClear?: string[]) {
  if (typeof window === "undefined") return;

  const matchers = keysToClear?.length
    ? keysToClear
    : ["donation", "donations", "doacao"];

  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index);

    if (
      key &&
      matchers.some((matcher) => key.toLowerCase().includes(matcher))
    ) {
      window.localStorage.removeItem(key);
    }
  }
}
