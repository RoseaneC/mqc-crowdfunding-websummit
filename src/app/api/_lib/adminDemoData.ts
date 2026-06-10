import { demoProjects } from "./demoProjects";

export type AdminDemoProjectStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "INACTIVE";

type AdminDemoProject = {
  id: number;
  ngoName: string;
  title: string;
  taxCategory: string;
  targetXlm: number;
  raisedXlm: number;
  status: AdminDemoProjectStatus;
  createdAt: string;
  documents: Array<{
    name: string;
    type: string;
    status: "Recebido" | "Em análise" | "Aprovado";
    href: string;
  }>;
};

const demoDocumentHref = "#documento-demo";

export const adminDemoProjects: AdminDemoProject[] = [
  {
    ...demoProjects[0],
    status: "PENDING",
    documents: [
      {
        name: "Estatuto social",
        type: "PDF",
        status: "Recebido",
        href: demoDocumentHref,
      },
      {
        name: "Plano de execução",
        type: "PDF",
        status: "Em análise",
        href: demoDocumentHref,
      },
    ],
  },
  {
    ...demoProjects[1],
    status: "APPROVED",
    documents: [
      {
        name: "Comprovante institucional",
        type: "PDF",
        status: "Aprovado",
        href: demoDocumentHref,
      },
    ],
  },
  {
    ...demoProjects[2],
    status: "PENDING",
    documents: [
      {
        name: "Orçamento do projeto",
        type: "Planilha",
        status: "Recebido",
        href: demoDocumentHref,
      },
    ],
  },
  {
    ...demoProjects[3],
    status: "REJECTED",
    documents: [
      {
        name: "Declaração de impacto",
        type: "PDF",
        status: "Em análise",
        href: demoDocumentHref,
      },
    ],
  },
  {
    id: 101,
    ngoName: "Coletivo Alimenta Tech",
    title: "Hortas Digitais Comunitárias",
    taxCategory: "Segurança alimentar",
    targetXlm: 6800,
    raisedXlm: 0,
    status: "PENDING",
    createdAt: "2026-06-02T13:00:00.000Z",
    documents: [
      {
        name: "CNPJ e ata da organização",
        type: "PDF",
        status: "Recebido",
        href: demoDocumentHref,
      },
      {
        name: "Metodologia de acompanhamento",
        type: "PDF",
        status: "Recebido",
        href: demoDocumentHref,
      },
    ],
  },
];

export const adminDemoNotice =
  "Ambiente de demonstração: ações administrativas simuladas até conexão com banco de dados de produção.";

export function getAdminDemoSummary() {
  const pending = adminDemoProjects.filter(
    (project) => project.status === "PENDING",
  ).length;
  const approved = adminDemoProjects.filter(
    (project) => project.status === "APPROVED",
  ).length;
  const rejected = adminDemoProjects.filter(
    (project) => project.status === "REJECTED",
  ).length;

  return {
    pending,
    approved,
    rejected,
    totalProjects: adminDemoProjects.length,
    total_projects: adminDemoProjects.length,
    contactsReceived: 12,
    newsletterSubscribers: 38,
    totalRaisedDemo: adminDemoProjects.reduce(
      (total, project) => total + project.raisedXlm,
      0,
    ),
  };
}

export function getAdminDashboardDemo() {
  return {
    demo: true,
    message: adminDemoNotice,
    activity: [
      {
        icon: "task_alt",
        title: "Projeto aprovado",
        description: "Elo.me liberado para captação na demonstração.",
        tone: "green",
        occurredAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
      },
      {
        icon: "mark_email_read",
        title: "Novo contato recebido",
        description: "Mensagem registrada pelo formulário público.",
        tone: "blue",
        occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        icon: "pending_actions",
        title: "Documento aguardando revisão",
        description: "Plano de execução anexado ao projeto MQC.",
        tone: "orange",
        occurredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
    ],
    featuredProjects: adminDemoProjects.map((project, index) => ({
      projectId: project.id,
      title: project.title,
      ngoName: project.ngoName,
      status: project.status,
      raisedXlm: project.raisedXlm,
      targetXlm: project.targetXlm,
      donors: 18 + index * 7,
      createdAt: project.createdAt,
    })),
  };
}

export function getAdminProjectsDemo() {
  return {
    demo: true,
    message: adminDemoNotice,
    summary: getAdminDemoSummary(),
    projects: adminDemoProjects,
  };
}

export function getAdminPendingProjectsDemo() {
  return adminDemoProjects
    .filter((project) => project.status === "PENDING")
    .map((project) => ({
      id: project.id,
      ngoName: project.ngoName,
      title: project.title,
      taxCategory: project.taxCategory,
      targetXlm: project.targetXlm,
      raisedXlm: project.raisedXlm,
      status: project.status,
      createdAt: project.createdAt,
    }));
}

export function getAdminReportsDemo() {
  const summary = getAdminDemoSummary();

  return {
    kpis: {
      totalCollectedXlm: summary.totalRaisedDemo,
      activeDonors: 86,
      fundedProjects: summary.approved,
      avgTicketXlm: 142,
    },
    distribution: [
      {
        label: "Educação de qualidade",
        percent: 42,
        totalProjectXlm: 4200,
      },
      {
        label: "Equidade de gênero",
        percent: 28,
        totalProjectXlm: 2100,
      },
      {
        label: "Inclusão produtiva",
        percent: 30,
        totalProjectXlm: 3600,
      },
    ],
    topProjects: adminDemoProjects.slice(0, 3).map((project, index) => ({
      rank: index + 1,
      projectId: project.id,
      name: project.title,
      incentive: project.taxCategory,
      totalProjectXlm: project.raisedXlm,
    })),
    recentDonations: [],
    demo: true,
    message: adminDemoNotice,
  };
}

export function getAdminMroscDemo() {
  return {
    summary: {
      pending: 2,
      inReview: 1,
      approved: 3,
      rejected: 0,
      totalResults: 6,
      activeOrgs: 4,
    },
    reports: adminDemoProjects.slice(0, 3).map((project, index) => ({
      id: index + 1,
      projectId: project.id,
      projectTitle: project.title,
      ngoName: project.ngoName,
      ngoWallet: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      submittedAt: project.createdAt,
      status: index === 0 ? "PENDING" : index === 1 ? "IN_REVIEW" : "APPROVED",
      periodStart: "2026-05-01",
      periodEnd: "2026-05-31",
      financialTotalXlm: project.raisedXlm,
      beneficiariesCount: 40 + index * 18,
      submittedByName: "Equipe MQC Demo",
      reviewedAt: null,
      reviewNotes: null,
    })),
    demo: true,
    message: adminDemoNotice,
  };
}
