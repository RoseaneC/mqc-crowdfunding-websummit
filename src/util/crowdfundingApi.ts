import { apiRequest } from "./api";

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
    timeLabel: string;
    tone: "green" | "blue" | "orange";
  }>;
  featuredProjects: Array<{
    name: string;
    leader: string;
    status: string;
    action: string;
  }>;
}

export interface AdminProjectsDTO {
  summary: {
    pending: number;
    approved: number;
    rejected: number;
    totalProjects: number;
  };
  recentRequests: Array<{
    name: string;
    ngo: string;
    status: string;
    timeLabel: string;
    initials: string;
    tone: "orange" | "green";
    active: boolean;
  }>;
  selectedRequest: {
    status: string;
    idLabel: string;
    title: string;
    submittedAt: string;
    organization: string;
    contactName: string;
    contactEmail: string;
    cnpj: string;
    cnpjStatus: string;
    location: string;
    description: string;
  };
}

export interface AdminReportsDTO {
  kpis: {
    totalCollected: string;
    activeDonors: string;
    fundedProjects: string;
    avgTicket: string;
  };
  distribution: Array<{
    label: string;
    percent: number;
    value: string;
  }>;
  topProjects: Array<{
    rank: number;
    name: string;
    incentive: string;
    amount: string;
  }>;
  recentDonations: Array<{
    donor: string;
    initials: string;
    project: string;
    incentive: string;
    date: string;
    amount: string;
    status: "confirmed" | "pending";
  }>;
}

export interface AdminMroscDTO {
  summary: {
    pending: number;
    inReview: number;
    approved: number;
    activeOrgs: number;
  };
  reports: Array<{
    org: string;
    initials: string;
    cnpj: string;
    project: string;
    projectId: string;
    submitted: string;
    status: string;
  }>;
  totalResults: number;
}

export function listProjects() {
  return apiRequest<ProjectDTO[]>("/projects");
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

export function listNftCatalog() {
  return apiRequest<NftCatalogItemDTO[]>("/catalog/nfts");
}

export function listProjectMedia() {
  return apiRequest<ProjectMediaItemDTO[]>("/catalog/project-media");
}

export function getAdminDashboard() {
  return apiRequest<AdminDashboardDTO>("/admin/dashboard");
}

export function getAdminProjects() {
  return apiRequest<AdminProjectsDTO>("/admin/projects");
}

export function getAdminReports() {
  return apiRequest<AdminReportsDTO>("/admin/reports");
}

export function getAdminMrosc() {
  return apiRequest<AdminMroscDTO>("/admin/mrosc");
}
