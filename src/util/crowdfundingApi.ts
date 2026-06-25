import { apiRequest } from "./api";
import type {
  DemoCurrencyCode,
  OdsNumber,
  ProjectTheme,
} from "./projectDemoMetadata";

export interface ProjectDTO {
  id: number;
  ngoName: string;
  ngoWallet: string;
  title: string;
  description: string;
  taxCategory: string;
  targetXlm: number;
  raisedXlm: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "INACTIVE";
  metadataUri: string;
  createdAt: string;
  eixoTematico?: ProjectTheme;
  ods?: OdsNumber[];
  odsNames?: string[];
  moedaPrincipal?: DemoCurrencyCode;
  moedasAceitas?: DemoCurrencyCode[];
}

export interface DonationPrepareResponse {
  donationId: number;
  feeBps: number;
  feeXlm: number;
  projectXlm: number;
}

export interface DonationReceiptDTO {
  id: number;
  projectId: number;
  projectName: string;
  donorType: "PF" | "PJ";
  amountXlm: number;
  feeXlm: number;
  projectXlm: number;
  walletAddress: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  txHash: string | null;
  nftId: number | null;
  createdAt: string;
  confirmedAt: string | null;
}

export interface AdminReportSummaryDTO {
  totalXlm: number;
  projectXlm: number;
  feeXlm: number;
  totalProjects: number;
  uniqueDonors: number;
}

export interface TransparencySummaryDTO {
  totalXlm: number;
  projectXlm: number;
  feeXlm: number;
  approvedProjects: number;
  uniqueDonors: number;
  recentImpacts: Array<{
    id: number;
    projectId: number;
    projectName: string;
    amountXlm: number;
    nftId: number | null;
    walletAddress: string;
    confirmedAt: string | null;
  }>;
}

export interface NftCatalogItemDTO {
  id: number;
  name: string;
  color: string;
  gradient: string;
  icon: string;
  rarity: string;
  description: string;
  thanks: string;
}

export interface ProjectNftCatalogItemDTO {
  projectId: number;
  projectTitle: string;
  name: string;
  color: string;
  gradient: string;
  icon: string;
  rarity: string;
  description: string;
  thanks: string;
}

export interface ProjectMediaItemDTO {
  id: string;
  name: string;
  img: string;
}

export interface AdminDashboardDTO {
  activity: Array<{
    icon: string;
    title: string;
    description: string;
    tone: "green" | "blue" | "orange";
    occurredAt: string;
  }>;
  featuredProjects: Array<{
    projectId: number;
    title: string;
    ngoName: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "INACTIVE";
    raisedXlm: number;
    targetXlm: number;
    donors: number;
    createdAt: string;
  }>;
}

export interface AdminDonationSummaryDTO {
  ok: boolean;
  source?: string;
  environmentStatus: "demo" | "homologation" | "production" | (string & {});
  resetEnabled: boolean;
  resetMessage: string;
  totalRaised: number;
  donationCount: number;
  demoDonationCount: number;
  uniqueDonors: number;
  lastUpdated: string;
  projects: Array<{
    projectId: number | string;
    title: string;
    totalRaised: number;
    donationCount: number;
    progressPercent: number;
    currency: string;
    status: string;
  }>;
}

export interface AdminDonationResetResponseDTO {
  ok: boolean;
  source?: string;
  message?: string;
  error?: string;
  projectsAffected?: Array<{
    projectId: number | string;
    title: string;
    previousTotal: number;
    afterTotal: number;
  }>;
  totalBeforeReset?: number;
  totalAfterReset?: number;
  recordsRemovedOrZeroed?: number;
  localStorageKeysToClear?: string[];
  lastUpdated?: string;
}

export interface AdminProjectsDTO {
  summary: {
    pending: number;
    approved: number;
    rejected: number;
    totalProjects: number;
  };
}

export interface AdminProjectPendingDTO {
  id: number;
  ngoName: string;
  title: string;
  taxCategory: string;
  targetXlm: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "INACTIVE";
  createdAt: string;
}

export interface AdminProjectSummaryDTO {
  pending: number;
  approved: number;
  rejected: number;
  total_projects: number;
}

export interface AdminReportsDTO {
  kpis: {
    totalCollectedXlm: number;
    activeDonors: number;
    fundedProjects: number;
    avgTicketXlm: number;
  };
  distribution: Array<{
    label: string;
    percent: number;
    totalProjectXlm: number;
  }>;
  topProjects: Array<{
    rank: number;
    projectId: number;
    name: string;
    incentive: string;
    totalProjectXlm: number;
  }>;
  recentDonations: Array<{
    id: number;
    donorWallet: string;
    project: string;
    incentive: string;
    confirmedAt: string;
    amountXlm: number;
    status: "CONFIRMED";
    txHash: string | null;
    nftId: number | null;
  }>;
}

export interface AdminMroscReportDTO {
  id: number;
  projectId: number;
  projectTitle: string;
  ngoName: string;
  ngoWallet: string;
  submittedAt: string;
  status: "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED";
  periodStart: string;
  periodEnd: string;
  financialTotalXlm: number;
  beneficiariesCount: number;
  submittedByName?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
}

export interface AdminMroscDTO {
  summary: {
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
    totalResults: number;
    activeOrgs: number;
  };
  reports: AdminMroscReportDTO[];
}

export type MyMroscReportDTO = AdminMroscReportDTO;

export interface ContactMessageResponseDTO {
  id: number;
  createdAt: string;
  ok?: boolean;
  sent?: boolean;
  demo?: boolean;
  delivery?: "api" | "demo" | "smtp";
  message?: string;
  warning?: string;
}

export interface AuthSessionDTO {
  token: string;
  expiresAt: string;
}

export interface AuthMeDTO {
  id: number;
  name: string;
  email: string;
  walletAddress: string | null;
  roles: Array<"SUPERADMIN" | "PROJECT_ADMIN">;
}

export interface AdminUserDTO {
  id: number;
  name: string;
  email: string;
  walletAddress: string | null;
  roles: Array<"SUPERADMIN" | "PROJECT_ADMIN">;
}

export interface ProjectAdminDTO {
  id: number;
  name: string;
  email: string;
  walletAddress: string | null;
  assignedAt: string;
}

export interface TransferBudgetDTO {
  totalProjectXlm?: number;
  totalFeeXlm?: number;
  transferredXlm: number;
  availableXlm: number;
}

export interface AdminTransferDTO {
  id: number;
  projectId?: number;
  initiatedByUserId: number;
  fromWallet: string;
  toWallet: string;
  amountXlm: number;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  txHash: string | null;
  failureReason: string | null;
  createdAt: string;
  confirmedAt: string | null;
}

type ProjectListResponse =
  | ProjectDTO[]
  | {
      value?: ProjectDTO[];
      data?: ProjectDTO[];
      projects?: ProjectDTO[];
      items?: ProjectDTO[];
      Count?: number;
    };

export async function listProjects() {
  const response = await apiRequest<ProjectListResponse>("/projects");

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.value)) {
    return response.value;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.projects)) {
    return response.projects;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  return [];
}

export function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  walletAddress?: string;
}) {
  return apiRequest<AuthSessionDTO>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createProject(payload: {
  ngoName: string;
  ngoWallet: string;
  title: string;
  description: string;
  taxCategory: string;
  targetXlm: number;
  metadataUri: string;
}) {
  return apiRequest<{ id: number }>("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: { email: string; password: string }) {
  return apiRequest<AuthSessionDTO>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutUser() {
  return apiRequest<{ ok: boolean }>("/auth/logout", {
    method: "POST",
  });
}

export function getAuthMe() {
  return apiRequest<AuthMeDTO>("/auth/me");
}

export function prepareDonation(payload: {
  projectId: number;
  donorType: "PF" | "PJ";
  donorDocHash: string;
  amountXlm: number;
  walletAddress: string;
}) {
  return apiRequest<DonationPrepareResponse>("/donations/prepare", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function submitDonation(payload: {
  donationId: number;
  txHash: string;
  contractDonationId?: string;
  nftId: number;
}) {
  return apiRequest<{ ok: boolean }>("/donations/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getDonationReceipt(donationId: number) {
  return apiRequest<DonationReceiptDTO>(`/donations/${donationId}`);
}

export function listWalletDonations(wallet: string) {
  return apiRequest<DonationReceiptDTO[]>(
    `/users/${encodeURIComponent(wallet)}/donations`,
  );
}

export function getAdminReportSummary() {
  return apiRequest<AdminReportSummaryDTO>("/admin/reports/summary");
}

export function getTransparencySummary() {
  return apiRequest<TransparencySummaryDTO>("/transparency/summary");
}

export function listNftCatalog() {
  return apiRequest<NftCatalogItemDTO[]>("/catalog/nfts");
}

export function listProjectNftCatalog() {
  return apiRequest<ProjectNftCatalogItemDTO[]>("/catalog/project-nfts");
}

export function listProjectMedia() {
  return apiRequest<ProjectMediaItemDTO[]>("/catalog/project-media");
}

export function getAdminDashboard() {
  return apiRequest<AdminDashboardDTO>("/admin/dashboard");
}

export function getAdminDonationSummary() {
  return apiRequest<AdminDonationSummaryDTO>("/admin/donations/summary");
}

export function resetDemoDonations(confirm: "ZERAR_DOACOES_TESTE") {
  return apiRequest<AdminDonationResetResponseDTO>(
    "/admin/donations/reset-demo",
    {
      method: "POST",
      body: JSON.stringify({ confirm }),
    },
  );
}

export function getAdminProjects() {
  return apiRequest<AdminProjectsDTO>("/admin/projects");
}

export function listAdminPendingProjects() {
  return apiRequest<AdminProjectPendingDTO[]>("/admin/projects/pending");
}

export function getAdminProjectSummary() {
  return apiRequest<AdminProjectSummaryDTO>("/admin/projects/summary");
}

export function updateProjectStatus(
  projectId: number,
  payload: {
    status: "PENDING" | "APPROVED" | "REJECTED" | "INACTIVE";
    reason?: string;
  },
) {
  return apiRequest<{ ok: boolean }>(`/projects/${projectId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getAdminReports() {
  return apiRequest<AdminReportsDTO>("/admin/reports");
}

export function getAdminMrosc() {
  return apiRequest<AdminMroscDTO>("/admin/mrosc");
}

export function listMyMroscReports() {
  return apiRequest<MyMroscReportDTO[]>("/admin/mrosc/reports/my");
}

export function createMroscReport(payload: {
  projectId: number;
  periodStart: string;
  periodEnd: string;
  summary: string;
  financialTotalXlm: number;
  beneficiariesCount: number;
}) {
  return apiRequest<{ id: number; ok: boolean }>("/admin/mrosc/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMroscReportStatus(
  reportId: number,
  payload: {
    status: "IN_REVIEW" | "APPROVED" | "REJECTED";
    reviewNotes?: string;
  },
) {
  return apiRequest<{ ok: boolean }>(
    `/admin/mrosc/reports/${reportId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function listAdminUsers() {
  return apiRequest<AdminUserDTO[]>("/admin/users");
}

export function listProjectAdmins(projectId: number) {
  return apiRequest<ProjectAdminDTO[]>(`/admin/projects/${projectId}/admins`);
}

export function assignProjectAdmin(projectId: number, userId: number) {
  return apiRequest<{ ok: boolean }>(`/admin/projects/${projectId}/admins`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export function removeProjectAdmin(projectId: number, userId: number) {
  return apiRequest<{ ok: boolean }>(
    `/admin/projects/${projectId}/admins/${userId}`,
    {
      method: "DELETE",
    },
  );
}

export function listMyAdminProjects() {
  return apiRequest<
    Array<{
      id: number;
      title: string;
      status: "PENDING" | "APPROVED" | "REJECTED" | "INACTIVE";
      targetXlm: number;
      raisedXlm: number;
      createdAt: string;
    }>
  >("/admin/projects/my");
}

export function getTaxTransferBudget() {
  return apiRequest<TransferBudgetDTO>("/admin/tax/transfer-budget");
}

export function listTaxTransfers() {
  return apiRequest<AdminTransferDTO[]>("/admin/tax/transfers");
}

export function createTaxTransfer(payload: {
  toWallet: string;
  amountXlm: number;
}) {
  return apiRequest<{
    id: number;
    ok?: boolean;
    txHash?: string;
    error?: string;
  }>("/admin/tax/transfers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function submitContactMessage(payload: {
  name: string;
  email: string;
  message: string;
  source?: string;
}) {
  return apiRequest<ContactMessageResponseDTO>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
