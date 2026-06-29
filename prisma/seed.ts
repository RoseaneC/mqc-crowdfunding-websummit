import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = process.env.DATABASE_URL?.trim();
const PONTEIA_EVM_WALLET = "0x228cbC1d913A463a9dC4D353AC9b5FdcfC1c71Cb";
const PONTEIA_PIX_KEY = "62.977.919/0001-97";

type ProjectAxisValue = "AMBIENTAL" | "CULTURAL" | "SOCIAL";

type SeedProject = {
  name: string;
  slug: string;
  description: string;
  organization: string;
  responsibleName: string;
  responsibleEmail: string;
  goalAmount: string;
  axes: ProjectAxisValue[];
  featured: boolean;
};

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL precisa estar configurada para rodar o seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
});

const projects: SeedProject[] = [
  {
    name: "Mulheres Que Codam - Formacao em Tecnologia",
    slug: "mulheres-que-codam-formacao-em-tecnologia",
    description:
      "Formacao em programacao, letramento digital e qualificacao profissional para mulheres que desejam iniciar ou fortalecer sua trajetoria na tecnologia.",
    organization: "Mulheres Que Codam",
    responsibleName: "Mulheres Que Codam",
    responsibleEmail: "demo@ponteia.org",
    goalAmount: "8000",
    axes: ["SOCIAL", "CULTURAL"],
    featured: true,
  },
  {
    name: "Elo.me - Rede de Protecao e Mentoria",
    slug: "elo-me-rede-de-protecao-e-mentoria",
    description:
      "Rede de apoio para conectar mulheres em inicio de carreira a mentoras, trilhas de empregabilidade, protecao social e autonomia economica.",
    organization: "Elo.me",
    responsibleName: "Elo.me",
    responsibleEmail: "demo@ponteia.org",
    goalAmount: "6500",
    axes: ["SOCIAL"],
    featured: false,
  },
  {
    name: "Trilhas de Inclusao Produtiva",
    slug: "trilhas-de-inclusao-produtiva",
    description:
      "Capacitacao em financas digitais, inovacao e empreendedorismo para ampliar renda, empregabilidade e participacao de mulheres na economia digital.",
    organization: "Ponte Produtiva",
    responsibleName: "Ponte Produtiva",
    responsibleEmail: "demo@ponteia.org",
    goalAmount: "7200",
    axes: ["SOCIAL", "CULTURAL"],
    featured: false,
  },
  {
    name: "Karn - Energia Comunitaria",
    slug: "karn-energia-comunitaria",
    description:
      "Ferramenta para apoiar comunidades perifericas no planejamento de energia limpa, acesso energetico e indicadores de sustentabilidade territorial.",
    organization: "Karn",
    responsibleName: "Karn",
    responsibleEmail: "demo@ponteia.org",
    goalAmount: "9000",
    axes: ["AMBIENTAL", "SOCIAL"],
    featured: false,
  },
  {
    name: "Vizinhanca Cuidadora - Seguranca Alimentar",
    slug: "vizinhanca-cuidadora-seguranca-alimentar",
    description:
      "Iniciativa comunitaria que usa tecnologia para mapear necessidades locais, combater a fome e ampliar o acesso a alimentos de qualidade.",
    organization: "Vizinhanca Cuidadora",
    responsibleName: "Vizinhanca Cuidadora",
    responsibleEmail: "demo@ponteia.org",
    goalAmount: "7800",
    axes: ["SOCIAL", "AMBIENTAL"],
    featured: false,
  },
  {
    name: "Web3 Lideranca para Mulheres",
    slug: "web3-lideranca-para-mulheres",
    description:
      "Programa de lideranca para mulheres que querem criar, gerir e comunicar projetos de impacto com autonomia economica e combate a desigualdade.",
    organization: "Mulheres Que Codam",
    responsibleName: "Mulheres Que Codam",
    responsibleEmail: "demo@ponteia.org",
    goalAmount: "8500",
    axes: ["SOCIAL", "CULTURAL"],
    featured: true,
  },
  {
    name: "Formacao Mulheres em Tecnologia",
    slug: "formacao-mulheres-em-tecnologia",
    description:
      "Ciclo de educacao de qualidade com aulas praticas, acompanhamento pedagogico e suporte para mulheres em transicao de carreira.",
    organization: "Mulheres Que Codam",
    responsibleName: "Mulheres Que Codam",
    responsibleEmail: "demo@ponteia.org",
    goalAmount: "10000",
    axes: ["SOCIAL", "CULTURAL"],
    featured: true,
  },
];

async function main() {
  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        name: project.name,
        description: project.description,
        organization: project.organization,
        responsibleName: project.responsibleName,
        responsibleEmail: project.responsibleEmail,
        walletAddress: PONTEIA_EVM_WALLET,
        pixKey: PONTEIA_PIX_KEY,
        pixQrCodeUrl: null,
        goalAmount: project.goalAmount,
        goalAsset: "USDGLO",
        status: "APPROVED",
        featured: project.featured,
        axes: project.axes,
      },
      create: {
        name: project.name,
        slug: project.slug,
        description: project.description,
        organization: project.organization,
        responsibleName: project.responsibleName,
        responsibleEmail: project.responsibleEmail,
        walletAddress: PONTEIA_EVM_WALLET,
        pixKey: PONTEIA_PIX_KEY,
        pixQrCodeUrl: null,
        goalAmount: project.goalAmount,
        goalAsset: "USDGLO",
        status: "APPROVED",
        featured: project.featured,
        axes: project.axes,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
