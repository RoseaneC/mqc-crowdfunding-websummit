import { useEffect, useState } from "react";
import {
  getAdminDashboard,
  getAdminProjects,
  getAdminProjectSummary,
  getAdminReportSummary,
  listMyAdminProjects,
  type AdminDashboardDTO,
  type AdminProjectsDTO,
} from "../../util/crowdfundingApi";
import { useAuth } from "../../providers/AuthProvider";

const emptyDashboard: AdminDashboardDTO = {
  activity: [],
  featuredProjects: [],
};

type AdminDemoProject = NonNullable<AdminProjectsDTO["projects"]>[number];

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const isSuperadmin = !user || hasRole("SUPERADMIN");
  const [summary, setSummary] = useState({
    totalXlm: 0,
    projectXlm: 0,
    feeXlm: 0,
    totalProjects: 0,
    pendingProjects: 0,
    uniqueDonors: 0,
  });
  const [adminProjectSummary, setAdminProjectSummary] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalProjects: 0,
    contactsReceived: 0,
    newsletterSubscribers: 0,
    totalRaisedDemo: 0,
  });
  const [dashboard, setDashboard] = useState<AdminDashboardDTO>(emptyDashboard);
  const [adminProjects, setAdminProjects] = useState<AdminDemoProject[]>([]);
  const [selectedAdminProjectId, setSelectedAdminProjectId] = useState<
    number | null
  >(null);
  const [myProjectsCount, setMyProjectsCount] = useState(0);
  const [myPendingCount, setMyPendingCount] = useState(0);
  const [myApprovedCount, setMyApprovedCount] = useState(0);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (isSuperadmin) {
      void Promise.all([
        getAdminReportSummary(),
        getAdminProjectSummary(),
        getAdminDashboard(),
        getAdminProjects(),
      ])
        .then(
          ([
            summaryResponse,
            projectSummaryResponse,
            dashboardResponse,
            projectsResponse,
          ]) => {
            setSummary({
              ...summaryResponse,
              pendingProjects: projectSummaryResponse.pending,
            });
            setAdminProjectSummary({
              pending: projectsResponse.summary.pending,
              approved: projectsResponse.summary.approved,
              rejected: projectsResponse.summary.rejected,
              totalProjects:
                projectsResponse.summary.totalProjects ??
                projectsResponse.summary.total_projects ??
                0,
              contactsReceived: projectsResponse.summary.contactsReceived ?? 0,
              newsletterSubscribers:
                projectsResponse.summary.newsletterSubscribers ?? 0,
              totalRaisedDemo:
                projectsResponse.summary.totalRaisedDemo ??
                summaryResponse.totalXlm,
            });
            setAdminProjects(projectsResponse.projects ?? []);
            setSelectedAdminProjectId(
              projectsResponse.projects?.[0]?.id ?? null,
            );
            setDashboard(dashboardResponse);
          },
        )
        .catch(() => setLoadError(true));
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

  const selectedAdminProject =
    adminProjects.find((project) => project.id === selectedAdminProjectId) ??
    adminProjects[0] ??
    null;

  const visibleAdminSummary = {
    pending: adminProjects.length
      ? adminProjects.filter((project) => project.status === "PENDING").length
      : adminProjectSummary.pending,
    approved: adminProjects.length
      ? adminProjects.filter((project) => project.status === "APPROVED").length
      : adminProjectSummary.approved,
    rejected: adminProjects.length
      ? adminProjects.filter((project) => project.status === "REJECTED").length
      : adminProjectSummary.rejected,
    totalProjects: adminProjects.length || adminProjectSummary.totalProjects,
    totalRaisedDemo: adminProjects.length
      ? adminProjects.reduce((total, project) => total + project.raisedXlm, 0)
      : adminProjectSummary.totalRaisedDemo,
  };

  const handleDemoStatusChange = (
    projectId: number,
    status: "APPROVED" | "REJECTED",
  ) => {
    setAdminProjects((current) =>
      current.map((project) =>
        project.id === projectId ? { ...project, status } : project,
      ),
    );
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
            Visão Geral do Admin
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Acompanhe aprovações, documentos e métricas principais da
            plataforma.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <MetricCard
          title="Projetos pendentes"
          value={visibleAdminSummary.pending.toLocaleString("pt-BR")}
          subtitle="Aguardando análise administrativa"
        />
        <MetricCard
          title="Projetos aprovados"
          value={visibleAdminSummary.approved.toLocaleString("pt-BR")}
          subtitle="Habilitados na demonstração"
        />
        <MetricCard
          title="Total arrecadado demo"
          value={`${visibleAdminSummary.totalRaisedDemo.toLocaleString(
            "pt-BR",
          )} XLM`}
          subtitle={`Líquido projetos: ${summary.projectXlm.toLocaleString(
            "pt-BR",
          )} XLM`}
        />
        <MetricCard
          title="Contatos recebidos"
          value={adminProjectSummary.contactsReceived.toLocaleString("pt-BR")}
          subtitle="Formulário público e parceiros"
        />
        <MetricCard
          title="Cadastros newsletter"
          value={adminProjectSummary.newsletterSubscribers.toLocaleString(
            "pt-BR",
          )}
          subtitle="Inscrições capturadas na demo"
        />
      </div>

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

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Aprovação de projetos
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Ações visuais simuladas para demonstração administrativa.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Projeto</th>
                  <th className="px-6 py-4">Eixo</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Meta</th>
                  <th className="px-6 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminProjects.map((project) => (
                  <tr className="hover:bg-slate-50" key={project.id}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">
                        {project.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {project.ngoName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {project.taxCategory}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${statusBadgeClass(
                          project.status,
                        )}`}
                      >
                        {statusLabel(project.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {project.targetXlm.toLocaleString("pt-BR")} XLM
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAdminProjectId(project.id)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Ver detalhes
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDemoStatusChange(project.id, "APPROVED")
                          }
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          Aprovar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDemoStatusChange(project.id, "REJECTED")
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
                        >
                          Reprovar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {adminProjects.length === 0 ? (
                  <tr>
                    <td
                      className="px-6 py-4 text-sm text-slate-500"
                      colSpan={5}
                    >
                      Sem projetos para análise no momento.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900">
            Documentos do projeto
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Metadados simulados para validação documental.
          </p>

          {selectedAdminProject ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Selecionado
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {selectedAdminProject.title}
                </p>
              </div>

              {(selectedAdminProject.documents ?? []).map((document) => (
                <div
                  key={`${selectedAdminProject.id}-${document.name}`}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {document.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {document.type} • {document.status}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        window.alert(
                          "Documento demonstrativo. O arquivo real será aberto quando o armazenamento de produção estiver conectado.",
                        )
                      }
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-[#002B99] hover:bg-blue-50"
                    >
                      Ver documento
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">
              Selecione um projeto para ver documentos.
            </p>
          )}
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
                <tr className="hover:bg-slate-50" key={project.projectId}>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {project.title}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {project.ngoName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[#002B99] font-bold text-xs">
                      {project.raisedXlm.toLocaleString("pt-BR")} /{" "}
                      {project.targetXlm.toLocaleString("pt-BR")} XLM
                    </span>
                  </td>
                </tr>
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

function statusLabel(status: "PENDING" | "APPROVED" | "REJECTED" | "INACTIVE") {
  if (status === "APPROVED") return "aprovado";
  if (status === "REJECTED") return "recusado";
  if (status === "INACTIVE") return "inativo";
  return "pendente";
}

function statusBadgeClass(
  status: "PENDING" | "APPROVED" | "REJECTED" | "INACTIVE",
) {
  if (status === "APPROVED") return "bg-emerald-100 text-emerald-700";
  if (status === "REJECTED") return "bg-red-100 text-red-700";
  if (status === "INACTIVE") return "bg-slate-200 text-slate-700";
  return "bg-orange-100 text-orange-700";
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

function MetricCard(props: { title: string; value: string; subtitle: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-slate-500 text-sm font-medium mb-1">{props.title}</p>
      <h2 className="text-3xl font-black text-slate-900">{props.value}</h2>
      <p className="text-slate-400 text-xs mt-1">{props.subtitle}</p>
    </div>
  );
}
