import { useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useAuth } from "../../providers/AuthProvider";
import {
  approveAdminProject,
  createProject,
  featureAdminProject,
  getAdminProjects,
  listMyAdminProjects,
  rejectAdminProject,
  type AdminProjectPendingDTO,
  type ImpactAxis,
} from "../../util/crowdfundingApi";
import {
  calculateProjectDonationMetrics,
  formatDonationAmount,
} from "../../util/donationMetrics";

type ProjectStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "INACTIVE"
  | "SUSPENDED";

const axisOptions: Array<{ value: ImpactAxis; label: string }> = [
  { value: "AMBIENTAL", label: "Impacto Ambiental" },
  { value: "CULTURAL", label: "Impacto Cultural" },
  { value: "SOCIAL", label: "Impacto Social" },
];

export default function Projects() {
  const { hasRole, user } = useAuth();
  const isSuperadmin = hasRole("SUPERADMIN");

  const [projects, setProjects] = useState<AdminProjectPendingDTO[]>([]);
  const [myProjects, setMyProjects] = useState<
    Array<{
      id: number | string;
      title: string;
      status: ProjectStatus;
      targetXlm: number;
      raisedXlm: number;
      createdAt: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [projectFeedback, setProjectFeedback] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    ngoName: "",
    ngoWallet: user?.walletAddress ?? "",
    title: "",
    description: "",
    taxCategory: "IMPACTO",
    targetXlm: "",
    metadataUri: "impact-project-onboarding",
    responsibleName: "",
    responsibleEmail: "",
    pixKey: "",
    pixQrCodeUrl: "",
    axes: [] as ImpactAxis[],
  });

  const adminSummary = useMemo(() => {
    return projects.reduce(
      (summary, project) => {
        const status = project.status;
        const metrics = calculateProjectDonationMetrics(project);

        return {
          totalProjects: summary.totalProjects + 1,
          pending: summary.pending + (status === "PENDING" ? 1 : 0),
          approved: summary.approved + (status === "APPROVED" ? 1 : 0),
          rejected: summary.rejected + (status === "REJECTED" ? 1 : 0),
          totalRaised: summary.totalRaised + metrics.totalRaised,
          confirmedDonations:
            summary.confirmedDonations + metrics.donationCount,
        };
      },
      {
        totalProjects: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalRaised: 0,
        confirmedDonations: 0,
      },
    );
  }, [projects]);

  const loadSuperadmin = async () => {
    setLoading(true);
    try {
      const response = await getAdminProjects();
      setProjects(response.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectOwner = async () => {
    setLoading(true);
    try {
      const data = await listMyAdminProjects();
      setMyProjects(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperadmin) {
      void loadSuperadmin().catch(() => {
        setFeedback("Erro ao carregar projetos.");
        setLoading(false);
      });
      return;
    }

    void loadProjectOwner().catch(() => {
      setProjectFeedback("Erro ao carregar seus projetos.");
      setLoading(false);
    });
  }, [isSuperadmin]);

  useEffect(() => {
    if (user?.walletAddress) {
      setProjectForm((prev) => ({
        ...prev,
        ngoWallet: prev.ngoWallet || user.walletAddress || "",
      }));
    }
  }, [user?.walletAddress]);

  const handleProjectAction = async (
    project: AdminProjectPendingDTO,
    action: "approve" | "reject" | "feature",
  ) => {
    setFeedback(null);
    setActionPendingId(`${project.id}:${action}`);

    try {
      if (action === "approve") {
        await approveAdminProject(project.id);
        setFeedback("Projeto aprovado.");
      } else if (action === "reject") {
        await rejectAdminProject(project.id, "Reprovado no painel admin.");
        setFeedback("Projeto reprovado.");
      } else {
        await featureAdminProject(project.id, !project.featured);
        setFeedback(
          project.featured
            ? "Projeto removido dos destaques."
            : "Projeto destacado.",
        );
      }

      await loadSuperadmin();
    } catch {
      setFeedback("Erro ao atualizar projeto.");
    } finally {
      setActionPendingId(null);
    }
  };

  const handleCreateProject = async () => {
    const targetXlm = Number(projectForm.targetXlm);

    if (projectForm.axes.length === 0) {
      setProjectFeedback(
        "Selecione pelo menos um eixo de impacto para cadastrar o projeto.",
      );
      return;
    }

    if (
      !projectForm.ngoName ||
      !projectForm.ngoWallet ||
      !projectForm.title ||
      !projectForm.description ||
      !projectForm.responsibleEmail ||
      !(targetXlm > 0)
    ) {
      setProjectFeedback("Preencha todos os campos obrigatorios do projeto.");
      return;
    }

    setProjectFeedback(null);
    setIsSubmittingProject(true);
    try {
      await createProject({
        ngoName: projectForm.ngoName,
        ngoWallet: projectForm.ngoWallet,
        title: projectForm.title,
        name: projectForm.title,
        description: projectForm.description,
        organization: projectForm.ngoName,
        responsibleName: projectForm.responsibleName || projectForm.ngoName,
        responsibleEmail: projectForm.responsibleEmail,
        walletAddress: projectForm.ngoWallet,
        pixKey: projectForm.pixKey,
        pixQrCodeUrl: projectForm.pixQrCodeUrl,
        axes: projectForm.axes,
        goalAmount: targetXlm,
        goalAsset: "USDGLO",
        taxCategory: projectForm.axes.join(", "),
        targetXlm,
        metadataUri: projectForm.metadataUri,
      });
      setProjectForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        targetXlm: "",
        axes: [],
      }));
      await loadProjectOwner();
      setProjectFeedback("Projeto enviado para aprovacao com sucesso.");
    } catch (error) {
      setProjectFeedback(
        error instanceof Error ? error.message : "Falha ao enviar projeto.",
      );
    } finally {
      setIsSubmittingProject(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 text-[var(--color-text)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">
          Area interna Ponteia
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-[var(--color-text)] sm:text-3xl">
          Gestao de Projetos
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-muted)]">
          {isSuperadmin
            ? "Painel interno para revisar projetos, acompanhar configuracao de PIX e wallet EVM, aprovar publicacao e destacar iniciativas."
            : "Envie seus projetos para aprovacao e acompanhe o status."}
        </p>
      </div>

      {isSuperadmin ? (
        <>
          {feedback ? (
            <div className="rounded-sm border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)]">
              {feedback}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
            <SummaryCard title="Total" value={adminSummary.totalProjects} />
            <SummaryCard title="Pendentes" value={adminSummary.pending} />
            <SummaryCard title="Aprovados" value={adminSummary.approved} />
            <SummaryCard title="Reprovados" value={adminSummary.rejected} />
            <SummaryCard
              title="Arrecadado"
              value={`${formatDonationAmount(adminSummary.totalRaised)} USDGLO`}
            />
            <SummaryCard
              title="Doacoes confirmadas"
              value={adminSummary.confirmedDonations}
            />
          </div>

          <section className="overflow-hidden rounded-sm border border-[var(--color-border)] bg-[var(--color-white)] shadow-[0_18px_44px_rgba(28,26,23,0.05)]">
            <div className="border-b border-[var(--color-border)] px-5 py-4">
              <h2 className="font-[var(--font-heading)] text-lg font-semibold">
                Projetos cadastrados
              </h2>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Modo demonstrativo sem autenticacao administrativa complexa
                nesta etapa. O guard existente foi preservado.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full text-left text-sm">
                <thead className="bg-[var(--color-surface)] text-xs uppercase tracking-[0.12em] text-[var(--color-text-soft)]">
                  <tr>
                    <Th>Projeto</Th>
                    <Th>Organizacao</Th>
                    <Th>Eixos</Th>
                    <Th>Status</Th>
                    <Th>Meta</Th>
                    <Th>Arrecadado</Th>
                    <Th>Wallet EVM</Th>
                    <Th>PIX</Th>
                    <Th>Criado em</Th>
                    <Th>Acoes</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-5 py-8 text-center text-[var(--color-text-muted)]"
                      >
                        Carregando projetos...
                      </td>
                    </tr>
                  ) : projects.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-5 py-8 text-center text-[var(--color-text-muted)]"
                      >
                        Nenhum projeto encontrado.
                      </td>
                    </tr>
                  ) : (
                    projects.map((project) => {
                      const metrics = calculateProjectDonationMetrics(project);
                      const walletAddress =
                        project.walletAddress || "nao informada";
                      const pixConfigured = Boolean(
                        project.pixKey || project.pixQrCodeUrl,
                      );

                      return (
                        <tr
                          key={project.id}
                          className="align-top transition hover:bg-[var(--color-surface)]/70"
                        >
                          <Td>
                            <div className="max-w-[220px]">
                              <p className="font-semibold text-[var(--color-text)]">
                                {project.title}
                              </p>
                              {project.featured ? (
                                <span className="mt-2 inline-flex rounded-full bg-[var(--color-accent-light)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-accent-dark)]">
                                  Destaque
                                </span>
                              ) : null}
                            </div>
                          </Td>
                          <Td>{project.organization ?? project.ngoName}</Td>
                          <Td>
                            <div className="flex max-w-[220px] flex-wrap gap-1.5">
                              {(project.axes ?? []).map((axis) => (
                                <AxisBadge key={axis} axis={axis} />
                              ))}
                              {(project.axes ?? []).length === 0 ? (
                                <span className="text-xs text-[var(--color-text-soft)]">
                                  sem eixo
                                </span>
                              ) : null}
                            </div>
                          </Td>
                          <Td>
                            <StatusBadge status={project.status} />
                          </Td>
                          <Td>
                            {formatDonationAmount(project.targetXlm)}{" "}
                            {project.goalAsset ?? "USDGLO"}
                          </Td>
                          <Td>
                            <span className="font-semibold">
                              {formatDonationAmount(metrics.totalRaised)}{" "}
                              {metrics.currency}
                            </span>
                            <span className="mt-1 block text-xs text-[var(--color-text-soft)]">
                              {metrics.donationCount} confirmada
                              {metrics.donationCount === 1 ? "" : "s"}
                            </span>
                          </Td>
                          <Td>
                            <span className="block max-w-[190px] truncate font-mono text-xs">
                              {walletAddress}
                            </span>
                          </Td>
                          <Td>
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                                pixConfigured
                                  ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                                  : "bg-[var(--color-surface-alt)] text-[var(--color-text-soft)]"
                              }`}
                            >
                              {pixConfigured
                                ? "Configurado"
                                : "Nao configurado"}
                            </span>
                          </Td>
                          <Td>
                            {new Date(project.createdAt).toLocaleDateString(
                              "pt-BR",
                            )}
                          </Td>
                          <Td>
                            <div className="flex flex-wrap gap-2">
                              <ActionButton
                                disabled={
                                  actionPendingId === `${project.id}:approve`
                                }
                                onClick={() =>
                                  void handleProjectAction(project, "approve")
                                }
                              >
                                Aprovar
                              </ActionButton>
                              <ActionButton
                                tone="danger"
                                disabled={
                                  actionPendingId === `${project.id}:reject`
                                }
                                onClick={() =>
                                  void handleProjectAction(project, "reject")
                                }
                              >
                                Reprovar
                              </ActionButton>
                              <ActionButton
                                tone="secondary"
                                disabled={
                                  actionPendingId === `${project.id}:feature`
                                }
                                onClick={() =>
                                  void handleProjectAction(project, "feature")
                                }
                              >
                                {project.featured
                                  ? "Remover destaque"
                                  : "Destacar"}
                              </ActionButton>
                            </div>
                          </Td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <ProjectOwnerView
          projectForm={projectForm}
          setProjectForm={setProjectForm}
          isSubmittingProject={isSubmittingProject}
          projectFeedback={projectFeedback}
          myProjects={myProjects}
          loading={loading}
          onSubmit={() => void handleCreateProject()}
        />
      )}
    </div>
  );
}

function ProjectOwnerView(props: {
  projectForm: {
    ngoName: string;
    ngoWallet: string;
    title: string;
    description: string;
    taxCategory: string;
    targetXlm: string;
    metadataUri: string;
    responsibleName: string;
    responsibleEmail: string;
    pixKey: string;
    pixQrCodeUrl: string;
    axes: ImpactAxis[];
  };
  setProjectForm: Dispatch<
    SetStateAction<{
      ngoName: string;
      ngoWallet: string;
      title: string;
      description: string;
      taxCategory: string;
      targetXlm: string;
      metadataUri: string;
      responsibleName: string;
      responsibleEmail: string;
      pixKey: string;
      pixQrCodeUrl: string;
      axes: ImpactAxis[];
    }>
  >;
  isSubmittingProject: boolean;
  projectFeedback: string | null;
  myProjects: Array<{
    id: number | string;
    title: string;
    status: ProjectStatus;
    targetXlm: number;
    raisedXlm: number;
    createdAt: string;
  }>;
  loading: boolean;
  onSubmit: () => void;
}) {
  const { projectForm, setProjectForm } = props;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="space-y-4 rounded-sm border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <h3 className="text-lg font-black text-[var(--color-text)]">
          Criar Novo Projeto
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminInput
            value={projectForm.ngoName}
            onChange={(value) =>
              setProjectForm((prev) => ({ ...prev, ngoName: value }))
            }
            placeholder="Nome da organizacao"
          />
          <AdminInput
            value={projectForm.ngoWallet}
            onChange={(value) =>
              setProjectForm((prev) => ({ ...prev, ngoWallet: value }))
            }
            placeholder="Wallet EVM da organizacao (0x...)"
          />
          <AdminInput
            value={projectForm.responsibleName}
            onChange={(value) =>
              setProjectForm((prev) => ({ ...prev, responsibleName: value }))
            }
            placeholder="Responsavel pelo projeto"
          />
          <AdminInput
            value={projectForm.responsibleEmail}
            onChange={(value) =>
              setProjectForm((prev) => ({ ...prev, responsibleEmail: value }))
            }
            placeholder="E-mail do responsavel"
          />
          <AdminInput
            value={projectForm.title}
            onChange={(value) =>
              setProjectForm((prev) => ({ ...prev, title: value }))
            }
            placeholder="Titulo do projeto"
            className="md:col-span-2"
          />
          <textarea
            value={projectForm.description}
            onChange={(event) =>
              setProjectForm((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
            placeholder="Descricao"
            className="min-h-28 rounded-sm border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-soft)] focus:border-[var(--color-primary)] md:col-span-2"
          />
          <AdminInput
            value={projectForm.pixKey}
            onChange={(value) =>
              setProjectForm((prev) => ({ ...prev, pixKey: value }))
            }
            placeholder="Chave PIX"
          />
          <AdminInput
            value={projectForm.pixQrCodeUrl}
            onChange={(value) =>
              setProjectForm((prev) => ({ ...prev, pixQrCodeUrl: value }))
            }
            placeholder="URL do QR Code PIX"
          />
          <AdminInput
            type="number"
            value={projectForm.targetXlm}
            onChange={(value) =>
              setProjectForm((prev) => ({ ...prev, targetXlm: value }))
            }
            placeholder="Meta (USDGLO)"
          />
          <AdminInput
            value={projectForm.metadataUri}
            onChange={(value) =>
              setProjectForm((prev) => ({ ...prev, metadataUri: value }))
            }
            placeholder="Metadata URI"
          />
          <div className="grid gap-3 rounded-sm border border-[var(--color-border)] p-4 md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-text-soft)]">
              Eixos obrigatorios
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {axisOptions.map((axis) => (
                <label
                  key={axis.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 text-sm ${
                    projectForm.axes.includes(axis.value)
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={projectForm.axes.includes(axis.value)}
                    onChange={(event) =>
                      setProjectForm((prev) => ({
                        ...prev,
                        axes: event.target.checked
                          ? [...new Set([...prev.axes, axis.value])]
                          : prev.axes.filter((item) => item !== axis.value),
                      }))
                    }
                    className="accent-[var(--color-primary)]"
                  />
                  {axis.label}
                </label>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          disabled={props.isSubmittingProject}
          onClick={props.onSubmit}
          className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {props.isSubmittingProject ? "Enviando..." : "Enviar para aprovacao"}
        </button>
        {props.projectFeedback ? (
          <p className="break-all text-xs font-bold text-[var(--color-text-muted)]">
            {props.projectFeedback}
          </p>
        ) : null}
      </div>

      <div className="rounded-sm border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <h3 className="mb-3 text-lg font-black text-[var(--color-text)]">
          Meus Projetos Enviados
        </h3>
        <div className="space-y-3">
          {props.loading ? (
            <p className="text-xs text-[var(--color-text-muted)]">
              Carregando projetos...
            </p>
          ) : null}
          {props.myProjects.map((project) => (
            <MyProjectCard key={project.id} project={project} />
          ))}
          {!props.loading && props.myProjects.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">
              Voce ainda nao enviou projetos.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Th(props: { children: ReactNode }) {
  return <th className="px-5 py-3 font-bold">{props.children}</th>;
}

function Td(props: { children: ReactNode }) {
  return (
    <td className="px-5 py-4 text-[var(--color-text-muted)]">
      {props.children}
    </td>
  );
}

function AdminInput(props: {
  value: string;
  type?: string;
  placeholder: string;
  className?: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type={props.type ?? "text"}
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
      placeholder={props.placeholder}
      className={`rounded-sm border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-soft)] focus:border-[var(--color-primary)] ${
        props.className ?? ""
      }`}
    />
  );
}

function AxisBadge(props: { axis: ImpactAxis }) {
  const labelByAxis: Record<ImpactAxis, string> = {
    AMBIENTAL: "Ambiental",
    CULTURAL: "Cultural",
    SOCIAL: "Social",
  };

  return (
    <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-primary)]">
      {labelByAxis[props.axis]}
    </span>
  );
}

function StatusBadge(props: { status: ProjectStatus }) {
  const labelByStatus: Record<ProjectStatus, string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovado",
    REJECTED: "Reprovado",
    INACTIVE: "Inativo",
    SUSPENDED: "Suspenso",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${badgeClass(props.status)}`}
    >
      {labelByStatus[props.status]}
    </span>
  );
}

function ActionButton(props: {
  children: ReactNode;
  tone?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  onClick: () => void;
}) {
  const tone = props.tone ?? "primary";
  const classes = {
    primary:
      "border-[var(--color-primary)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]",
    secondary:
      "border-[var(--color-border-strong)] bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]",
    danger: "border-rose-300 bg-transparent text-rose-700 hover:bg-rose-50",
  };

  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      className={`rounded-full border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${classes[tone]}`}
    >
      {props.children}
    </button>
  );
}

function badgeClass(status: ProjectStatus) {
  if (status === "APPROVED") {
    return "bg-[var(--color-primary-light)] text-[var(--color-primary)]";
  }
  if (status === "REJECTED") return "bg-rose-100 text-rose-700";
  if (status === "INACTIVE" || status === "SUSPENDED") {
    return "bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]";
  }
  return "bg-[var(--color-accent-light)] text-[var(--color-accent-dark)]";
}

function SummaryCard(props: { title: string; value: number | string }) {
  const value =
    typeof props.value === "number"
      ? props.value.toLocaleString("pt-BR")
      : props.value;

  return (
    <div className="rounded-sm border border-[var(--color-border)] bg-[var(--color-white)] p-5 shadow-[0_14px_38px_rgba(28,26,23,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-soft)]">
        {props.title}
      </p>
      <h2 className="mt-2 text-2xl font-black text-[var(--color-text)]">
        {value}
      </h2>
    </div>
  );
}

function MyProjectCard(props: {
  project: {
    id: number | string;
    title: string;
    status: ProjectStatus;
    targetXlm: number;
    raisedXlm: number;
    createdAt: string;
  };
}) {
  const metrics = calculateProjectDonationMetrics(props.project);

  return (
    <div className="space-y-2 rounded-sm border border-[var(--color-border)] p-4">
      <div className="flex justify-between gap-3">
        <p className="font-bold text-[var(--color-text)]">
          {props.project.title}
        </p>
        <StatusBadge status={props.project.status} />
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">
        Meta: {formatDonationAmount(metrics.targetAmount)} USDGLO
      </p>
      <p className="text-xs text-[var(--color-text-muted)]">
        Captado: {formatDonationAmount(metrics.totalRaised)} USDGLO
      </p>
    </div>
  );
}
