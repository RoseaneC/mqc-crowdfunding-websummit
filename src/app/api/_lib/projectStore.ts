import { demoProjects } from "./demoProjects";
import {
  addDonation,
  listDonations,
  toDonationMetricRecord,
} from "./donationStore";
import type { Prisma } from "@prisma/client";
import { getPrisma, hasDatabaseUrl } from "../../../lib/prisma";
import {
  calculateProjectDonationMetrics,
  type DonationMetricRecord,
} from "../../../util/donationMetrics";

export type ImpactProjectAxis = "AMBIENTAL" | "CULTURAL" | "SOCIAL";
export type ImpactProjectStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";
export type ImpactDonationAsset = "USDGLO" | "XLM" | "USDC" | "BRZ" | "PIX";
export type ImpactDonationStatus = "PENDING" | "CONFIRMED" | "FAILED";
export type EvidenceType =
  | "REPORT"
  | "INVOICE_PHOTO"
  | "CLASS_PHOTO"
  | "TESTIMONIAL"
  | "IMPACT_REPORT"
  | "OTHER";
export type EvidenceStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ImpactProject = {
  id: string;
  name: string;
  slug: string;
  description: string;
  organization: string;
  responsibleName: string;
  responsibleEmail: string;
  walletAddress: string | null;
  pixKey: string | null;
  pixQrCodeUrl: string | null;
  goalAmount: number;
  goalAsset: ImpactDonationAsset;
  status: ImpactProjectStatus;
  featured: boolean;
  axes: ImpactProjectAxis[];
  payoutProvider: string | null;
  payoutStatus: string;
  bankAccountLast4: string | null;
  payoutReference: string | null;
  offRampEligible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EvidenceRecord = {
  id: string;
  projectId: string;
  userId: string | null;
  title: string;
  description: string;
  type: EvidenceType;
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  status: EvidenceStatus;
  createdAt: string;
};

type ProjectStoreState = {
  projects: ImpactProject[];
  evidences: EvidenceRecord[];
  nextProjectId: number;
  nextEvidenceId: number;
};

type CreateProjectInput = {
  name: string;
  description: string;
  organization: string;
  responsibleName: string;
  responsibleEmail: string;
  walletAddress?: string | null;
  pixKey?: string | null;
  pixQrCodeUrl?: string | null;
  goalAmount: number;
  goalAsset?: ImpactDonationAsset;
  axes: ImpactProjectAxis[];
};

type UpdateProjectInput = Partial<
  Pick<
    ImpactProject,
    | "name"
    | "description"
    | "organization"
    | "responsibleName"
    | "responsibleEmail"
    | "walletAddress"
    | "pixKey"
    | "pixQrCodeUrl"
    | "goalAmount"
    | "goalAsset"
    | "featured"
    | "axes"
    | "status"
  >
>;

type CreateEvidenceInput = {
  projectId: string;
  userId?: string | null;
  title: string;
  description: string;
  type: EvidenceType;
  fileUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
};

type CreateConfirmedDonationInput = {
  projectId: string;
  donorWallet: string;
  amount: number;
  asset: ImpactDonationAsset;
  network: string;
  txHash?: string | null;
  destinationAddress?: string | null;
};

const globalProjectStore = globalThis as typeof globalThis & {
  __mqcImpactProjectStore?: ProjectStoreState;
};

function getFallbackState() {
  globalProjectStore.__mqcImpactProjectStore ??= {
    projects: [],
    evidences: [],
    nextProjectId: 10_000,
    nextEvidenceId: 1,
  };

  return globalProjectStore.__mqcImpactProjectStore;
}

function listFallbackProjects() {
  return [...demoProjects.map(projectFromDemo), ...getFallbackState().projects];
}

export function isProjectDatabaseEnabled() {
  return hasDatabaseUrl();
}

export async function listImpactProjects() {
  if (isProjectDatabaseEnabled()) {
    try {
      const prisma = getPrisma();
      const projects = await prisma.project.findMany({
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      });

      return projects.map(projectFromPrisma);
    } catch (error) {
      logPrismaFallback("listImpactProjects", error);
    }
  }

  return listFallbackProjects();
}

export async function listAdminImpactProjects() {
  const projects = await listImpactProjects();
  return projects.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getImpactProject(id: string) {
  if (isProjectDatabaseEnabled()) {
    try {
      const prisma = getPrisma();
      const project = await prisma.project.findUnique({ where: { id } });
      return project ? projectFromPrisma(project) : null;
    } catch (error) {
      logPrismaFallback("getImpactProject", error);
    }
  }

  return (
    getFallbackState().projects.find((project) => project.id === id) ??
    demoProjects.map(projectFromDemo).find((project) => project.id === id) ??
    null
  );
}

export async function createImpactProject(input: CreateProjectInput) {
  const slug = await createUniqueSlug(input.name);
  const now = new Date().toISOString();

  if (isProjectDatabaseEnabled()) {
    try {
      const prisma = getPrisma();
      const project = await prisma.project.create({
        data: {
          name: input.name,
          slug,
          description: input.description,
          organization: input.organization,
          responsibleName: input.responsibleName,
          responsibleEmail: input.responsibleEmail,
          walletAddress: input.walletAddress,
          pixKey: input.pixKey,
          pixQrCodeUrl: input.pixQrCodeUrl,
          goalAmount: input.goalAmount,
          goalAsset: input.goalAsset ?? "USDGLO",
          axes: input.axes,
          status: "PENDING",
        },
      });

      await createAuditLog({
        projectId: project.id,
        action: "PROJECT_CREATED",
        metadata: { source: "api" },
      });

      return projectFromPrisma(project);
    } catch (error) {
      logPrismaFallback("createImpactProject", error);
    }
  }

  return createFallbackProject(input, slug, now);
}

function createFallbackProject(
  input: CreateProjectInput,
  slug: string,
  now: string,
) {
  const state = getFallbackState();
  const project: ImpactProject = {
    id: String(state.nextProjectId),
    name: input.name,
    slug,
    description: input.description,
    organization: input.organization,
    responsibleName: input.responsibleName,
    responsibleEmail: input.responsibleEmail,
    walletAddress: input.walletAddress ?? null,
    pixKey: input.pixKey ?? null,
    pixQrCodeUrl: input.pixQrCodeUrl ?? null,
    goalAmount: input.goalAmount,
    goalAsset: input.goalAsset ?? "USDGLO",
    status: "PENDING",
    featured: false,
    axes: input.axes,
    payoutProvider: null,
    payoutStatus: "NOT_REQUESTED",
    bankAccountLast4: null,
    payoutReference: null,
    offRampEligible: false,
    createdAt: now,
    updatedAt: now,
  };

  state.nextProjectId += 1;
  state.projects.push(project);

  return project;
}

export async function updateImpactProject(
  id: string,
  input: UpdateProjectInput,
) {
  if (isProjectDatabaseEnabled()) {
    try {
      const prisma = getPrisma();
      const project = await prisma.project.update({
        where: { id },
        data: {
          ...input,
          goalAmount:
            input.goalAmount === undefined
              ? undefined
              : Number(input.goalAmount),
        },
      });

      return projectFromPrisma(project);
    } catch (error) {
      logPrismaFallback("updateImpactProject", error);
    }
  }

  const state = getFallbackState();
  const project = state.projects.find((item) => item.id === id);

  if (!project) return null;

  Object.assign(project, input, { updatedAt: new Date().toISOString() });

  return project;
}

export async function setImpactProjectStatus(
  id: string,
  status: ImpactProjectStatus,
  reason?: string,
) {
  const project = await updateImpactProject(id, { status });

  if (project) {
    await createAuditLog({
      projectId: project.id,
      action: status === "APPROVED" ? "PROJECT_APPROVED" : "PROJECT_REJECTED",
      metadata: { reason: reason ?? null },
    });
  }

  return project;
}

export async function setImpactProjectFeatured(id: string, featured: boolean) {
  const project = await updateImpactProject(id, { featured });

  if (project) {
    await createAuditLog({
      projectId: project.id,
      action: featured ? "PROJECT_FEATURED" : "PROJECT_UNFEATURED",
      metadata: { featured },
    });
  }

  return project;
}

export async function createProjectEvidence(input: CreateEvidenceInput) {
  if (isProjectDatabaseEnabled()) {
    try {
      const prisma = getPrisma();
      const evidence = await prisma.evidence.create({
        data: {
          projectId: input.projectId,
          userId: input.userId,
          title: input.title,
          description: input.description,
          type: input.type,
          fileUrl: input.fileUrl,
          fileName: input.fileName,
          mimeType: input.mimeType,
        },
      });

      await createAuditLog({
        projectId: input.projectId,
        userId: input.userId,
        action: "EVIDENCE_CREATED",
        metadata: { title: input.title },
      });

      return evidenceFromPrisma(evidence);
    } catch (error) {
      logPrismaFallback("createProjectEvidence", error);
    }
  }

  const state = getFallbackState();
  const evidence: EvidenceRecord = {
    id: String(state.nextEvidenceId),
    projectId: input.projectId,
    userId: input.userId ?? null,
    title: input.title,
    description: input.description,
    type: input.type,
    fileUrl: input.fileUrl,
    fileName: input.fileName ?? null,
    mimeType: input.mimeType ?? null,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  state.nextEvidenceId += 1;
  state.evidences.push(evidence);

  return evidence;
}

export async function listProjectEvidences(projectId: string) {
  if (isProjectDatabaseEnabled()) {
    try {
      const prisma = getPrisma();
      const evidences = await prisma.evidence.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
      });

      return evidences.map(evidenceFromPrisma);
    } catch (error) {
      logPrismaFallback("listProjectEvidences", error);
    }
  }

  return getFallbackState().evidences.filter(
    (evidence) => evidence.projectId === projectId,
  );
}

export async function listImpactDonationMetricRecords() {
  if (isProjectDatabaseEnabled()) {
    try {
      const prisma = getPrisma();
      const donations = await prisma.donation.findMany({
        where: { status: "CONFIRMED" },
        orderBy: { createdAt: "desc" },
      });

      return donations.map(donationFromPrismaMetric);
    } catch (error) {
      logPrismaFallback("listImpactDonationMetricRecords", error);
    }
  }

  return listDonations().map(toDonationMetricRecord);
}

export async function createConfirmedDonation(
  input: CreateConfirmedDonationInput,
) {
  if (input.network === "celo-mainnet" && !input.txHash) {
    throw new Error("Doacao Celo Mainnet confirmada exige txHash.");
  }

  if (isProjectDatabaseEnabled()) {
    try {
      const prisma = getPrisma();
      const existing = input.txHash
        ? await prisma.donation.findUnique({ where: { txHash: input.txHash } })
        : null;

      if (existing) return existing;

      const donation = await prisma.donation.create({
        data: {
          projectId: input.projectId,
          donorWallet: input.donorWallet,
          amount: input.amount,
          asset: input.asset,
          network: input.network,
          txHash: input.txHash,
          status: "CONFIRMED",
          destinationAddress: input.destinationAddress,
        },
      });

      await createAuditLog({
        projectId: input.projectId,
        action: "DONATION_CONFIRMED",
        metadata: {
          asset: input.asset,
          network: input.network,
          txHash: input.txHash,
        },
      });

      return donation;
    } catch (error) {
      logPrismaFallback("createConfirmedDonation", error);
    }
  }

  const project = await getImpactProject(input.projectId);

  addDonation({
    projectId: input.projectId,
    projectName: project?.name ?? input.projectId,
    donorType: "PF",
    amount: input.amount,
    asset: input.asset === "PIX" ? "BRZ" : input.asset,
    network: input.network === "celo-mainnet" ? "celo-mainnet" : "demo",
    txHash: input.txHash,
    status: "confirmed",
    walletAddress: input.donorWallet,
    destinationAddress: input.destinationAddress ?? undefined,
  });
}

export function toProjectDTO(
  project: ImpactProject,
  donations: DonationMetricRecord[] = listDonations().map(
    toDonationMetricRecord,
  ),
) {
  const metrics = calculateProjectDonationMetrics(
    {
      id: project.id,
      title: project.name,
      ngoName: project.organization,
      targetXlm: project.goalAmount,
      raisedXlm: 0,
      raisedAsset: project.goalAsset,
      status: project.status === "SUSPENDED" ? "INACTIVE" : project.status,
      moedaPrincipal: project.goalAsset,
    },
    donations,
  );

  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    title: project.name,
    description: project.description,
    organization: project.organization,
    ngoName: project.organization,
    responsibleName: project.responsibleName,
    responsibleEmail: project.responsibleEmail,
    walletAddress: project.walletAddress,
    ngoWallet: project.walletAddress ?? "",
    pixKey: project.pixKey,
    pixQrCodeUrl: project.pixQrCodeUrl,
    goalAmount: project.goalAmount,
    goalAsset: project.goalAsset,
    targetXlm: project.goalAmount,
    raisedXlm: metrics.totalRaised,
    raisedAsset: project.goalAsset,
    donationCount: metrics.donationCount,
    status: project.status === "SUSPENDED" ? "INACTIVE" : project.status,
    featured: project.featured,
    axes: project.axes,
    eixoTematico: mapAxisToTheme(project.axes[0]),
    taxCategory: project.axes.join(", "),
    metadataUri: project.slug,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    moedaPrincipal: project.goalAsset,
    moedasAceitas: [project.goalAsset],
    payoutProvider: project.payoutProvider,
    payoutStatus: project.payoutStatus,
    bankAccountLast4: project.bankAccountLast4,
    payoutReference: project.payoutReference,
    offRampEligible: project.offRampEligible,
  };
}

async function createUniqueSlug(name: string) {
  const base = slugify(name);
  const projects = await listImpactProjects();
  const usedSlugs = new Set(projects.map((project) => project.slug));

  if (!usedSlugs.has(base)) return base;

  let suffix = 2;
  while (usedSlugs.has(`${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
}

async function createAuditLog(input: {
  userId?: string | null;
  projectId?: string | null;
  action:
    | "PROJECT_CREATED"
    | "PROJECT_APPROVED"
    | "PROJECT_REJECTED"
    | "PROJECT_FEATURED"
    | "PROJECT_UNFEATURED"
    | "EVIDENCE_CREATED"
    | "DONATION_CONFIRMED";
  metadata?: Record<string, unknown>;
}) {
  if (!isProjectDatabaseEnabled()) return;

  try {
    const prisma = getPrisma();

    await prisma.adminAuditLog.create({
      data: {
        userId: input.userId,
        projectId: input.projectId,
        action: input.action,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    logPrismaFallback("createAuditLog", error);
  }
}

function projectFromPrisma(project: {
  id: string;
  name: string;
  slug: string;
  description: string;
  organization: string;
  responsibleName: string;
  responsibleEmail: string;
  walletAddress: string | null;
  pixKey: string | null;
  pixQrCodeUrl: string | null;
  goalAmount: { toString(): string } | number | string;
  goalAsset: string;
  status: string;
  featured: boolean;
  axes: string[];
  payoutProvider: string | null;
  payoutStatus: string;
  bankAccountLast4: string | null;
  payoutReference: string | null;
  offRampEligible: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ImpactProject {
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    description: project.description,
    organization: project.organization,
    responsibleName: project.responsibleName,
    responsibleEmail: project.responsibleEmail,
    walletAddress: project.walletAddress,
    pixKey: project.pixKey,
    pixQrCodeUrl: project.pixQrCodeUrl,
    goalAmount: Number(project.goalAmount),
    goalAsset: parseDonationAsset(project.goalAsset),
    status: parseProjectStatus(project.status),
    featured: project.featured,
    axes: project.axes
      .map(parseAxis)
      .filter((axis): axis is ImpactProjectAxis => Boolean(axis)),
    payoutProvider: project.payoutProvider,
    payoutStatus: project.payoutStatus,
    bankAccountLast4: project.bankAccountLast4,
    payoutReference: project.payoutReference,
    offRampEligible: project.offRampEligible,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

function projectFromDemo(
  project: (typeof demoProjects)[number],
): ImpactProject {
  return {
    id: String(project.id),
    name: project.title,
    slug: slugify(project.title),
    description: project.description,
    organization: project.ngoName,
    responsibleName: project.ngoName,
    responsibleEmail: "demo@ponteia.org",
    walletAddress: null,
    pixKey: null,
    pixQrCodeUrl: null,
    goalAmount: project.targetXlm,
    goalAsset: "USDGLO",
    status: project.status,
    featured: ["1", "6", "8"].includes(String(project.id)),
    axes: ["SOCIAL"],
    payoutProvider: null,
    payoutStatus: "NOT_REQUESTED",
    bankAccountLast4: null,
    payoutReference: null,
    offRampEligible: false,
    createdAt: project.createdAt,
    updatedAt: project.createdAt,
  };
}

function evidenceFromPrisma(evidence: {
  id: string;
  projectId: string;
  userId: string | null;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  status: string;
  createdAt: Date;
}): EvidenceRecord {
  return {
    id: evidence.id,
    projectId: evidence.projectId,
    userId: evidence.userId,
    title: evidence.title,
    description: evidence.description,
    type: parseEvidenceType(evidence.type),
    fileUrl: evidence.fileUrl,
    fileName: evidence.fileName,
    mimeType: evidence.mimeType,
    status: parseEvidenceStatus(evidence.status),
    createdAt: evidence.createdAt.toISOString(),
  };
}

function donationFromPrismaMetric(donation: {
  id: string;
  projectId: string;
  amount: { toString(): string } | number | string;
  asset: string;
  status: string;
  donorWallet: string | null;
  network: string;
}): DonationMetricRecord {
  return {
    id: donation.id,
    projectId: donation.projectId,
    amount: Number(donation.amount),
    asset: donation.asset,
    status:
      donation.status === "CONFIRMED"
        ? "CONFIRMED"
        : donation.status === "PENDING"
          ? "PENDING"
          : "FAILED",
    walletAddress: donation.donorWallet,
    source: donation.network,
  };
}

function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `projeto-${Date.now()}`
  );
}

function parseAxis(value: string): ImpactProjectAxis | null {
  if (value === "AMBIENTAL" || value === "CULTURAL" || value === "SOCIAL") {
    return value;
  }

  return null;
}

function parseProjectStatus(value: string): ImpactProjectStatus {
  if (
    value === "PENDING" ||
    value === "APPROVED" ||
    value === "REJECTED" ||
    value === "SUSPENDED"
  ) {
    return value;
  }

  return "PENDING";
}

function parseDonationAsset(value: string): ImpactDonationAsset {
  if (
    value === "USDGLO" ||
    value === "XLM" ||
    value === "USDC" ||
    value === "BRZ" ||
    value === "PIX"
  ) {
    return value;
  }

  return "USDGLO";
}

function parseEvidenceType(value: string): EvidenceType {
  if (
    value === "REPORT" ||
    value === "INVOICE_PHOTO" ||
    value === "CLASS_PHOTO" ||
    value === "TESTIMONIAL" ||
    value === "IMPACT_REPORT" ||
    value === "OTHER"
  ) {
    return value;
  }

  return "OTHER";
}

function parseEvidenceStatus(value: string): EvidenceStatus {
  if (value === "APPROVED" || value === "REJECTED") return value;
  return "PENDING";
}

function logPrismaFallback(scope: string, error: unknown) {
  console.warn(
    `[project-store] Prisma unavailable in ${scope}; using fallback.`,
    {
      message: error instanceof Error ? error.message : "Unknown error",
    },
  );
}

function mapAxisToTheme(axis: ImpactProjectAxis | undefined) {
  if (axis === "AMBIENTAL") return "Transição energética justa";
  if (axis === "CULTURAL") return "Educação de qualidade";
  return "Equidade de gênero";
}
