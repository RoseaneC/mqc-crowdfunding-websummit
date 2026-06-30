import { demoProjects } from "./demoProjects";
import {
  calculateDonationPortfolioMetrics,
  type DonationMetricRecord,
} from "../../../util/donationMetrics";

export type StoredDonationAsset = "USDGLO" | "CELO" | "XLM" | "USDC" | "BRZ";
export type StoredDonationNetwork =
  | "celo-mainnet"
  | "stellar-mainnet"
  | "stellar-testnet"
  | "demo";
export type StoredDonationStatus = "confirmed" | "pending" | "failed";

export type StoredDonation = {
  id: number;
  projectId: number | string;
  projectName: string;
  donorType: "PF" | "PJ";
  document?: string;
  amount: number;
  asset: StoredDonationAsset;
  network: StoredDonationNetwork;
  txHash: string | null;
  status: StoredDonationStatus;
  createdAt: string;
  confirmedAt: string | null;
  walletAddress: string;
  destinationAddress?: string;
  nftId: number | null;
  contractDonationId?: string;
};

export type DonationInput = {
  id?: number;
  projectId: number | string;
  projectName?: string;
  donorType: "PF" | "PJ";
  document?: string;
  amount: number;
  asset: StoredDonationAsset;
  network: StoredDonationNetwork;
  txHash?: string | null;
  status: StoredDonationStatus;
  walletAddress: string;
  destinationAddress?: string;
  nftId?: number | null;
  contractDonationId?: string;
};

type DonationStoreState = {
  donations: StoredDonation[];
  nextId: number;
};

const globalDonationStore = globalThis as typeof globalThis & {
  __mqcDonationStore?: DonationStoreState;
};

function getState() {
  globalDonationStore.__mqcDonationStore ??= {
    donations: [],
    nextId: 1,
  };

  return globalDonationStore.__mqcDonationStore;
}

export function addDonation(input: DonationInput) {
  const state = getState();
  const normalizedTxHash = input.txHash?.trim() || null;
  const normalizedWalletAddress =
    input.walletAddress.trim().toLowerCase() || input.walletAddress;
  const normalizedDestinationAddress =
    input.destinationAddress?.trim().toLowerCase() || undefined;

  if (normalizedTxHash) {
    const existing = state.donations.find(
      (donation) =>
        donation.txHash?.toLowerCase() === normalizedTxHash.toLowerCase(),
    );

    if (existing) {
      return existing;
    }
  }

  const project = demoProjects.find(
    (item) => Number(item.id) === Number(input.projectId),
  );
  const now = new Date().toISOString();
  const donation: StoredDonation = {
    id: input.id && input.id > 0 ? input.id : state.nextId,
    projectId: input.projectId,
    projectName:
      input.projectName?.trim() ||
      project?.title ||
      `Projeto #${input.projectId}`,
    donorType: input.donorType,
    document: input.document,
    amount: input.amount,
    asset: input.asset,
    network: input.network,
    txHash: normalizedTxHash,
    status: input.status,
    createdAt: now,
    confirmedAt: input.status === "confirmed" ? now : null,
    walletAddress: normalizedWalletAddress,
    destinationAddress: normalizedDestinationAddress,
    nftId:
      input.nftId === null || input.nftId === undefined
        ? null
        : Number(input.nftId),
    contractDonationId: input.contractDonationId,
  };

  state.nextId = Math.max(state.nextId, donation.id + 1);
  state.donations.push(donation);

  return donation;
}

export function listDonations() {
  return [...getState().donations];
}

export function listDonationsByProject(projectId: number | string) {
  return listDonations().filter(
    (donation) => String(donation.projectId) === String(projectId),
  );
}

export function listDonationsByWallet(walletAddress: string) {
  const normalizedWalletAddress = walletAddress.trim().toLowerCase();
  return listDonations().filter(
    (donation) =>
      donation.walletAddress.toLowerCase() === normalizedWalletAddress,
  );
}

export function getDonationById(id: number | string) {
  return listDonations().find((donation) => String(donation.id) === String(id));
}

export function getConfirmedDonationMetrics() {
  return calculateDonationPortfolioMetrics(
    [...demoProjects],
    listDonations().map(toDonationMetricRecord),
  );
}

export function resetDemoDonations() {
  const state = getState();
  const before = state.donations;
  state.donations = before.filter(
    (donation) => donation.network === "stellar-mainnet",
  );

  return {
    removed: before.length - state.donations.length,
    remaining: state.donations.length,
  };
}

export function toDonationMetricRecord(
  donation: StoredDonation,
): DonationMetricRecord {
  return {
    id: donation.id,
    projectId: donation.projectId,
    amountXlm: donation.asset === "XLM" ? donation.amount : undefined,
    amount: donation.amount,
    asset: donation.asset,
    status:
      donation.status === "confirmed"
        ? "CONFIRMED"
        : donation.status === "pending"
          ? "PENDING"
          : "FAILED",
    walletAddress: donation.walletAddress,
    source: donation.network,
  };
}

export function toDonationReceipt(donation: StoredDonation) {
  return {
    id: donation.id,
    projectId: donation.projectId,
    projectName: donation.projectName,
    donorType: donation.donorType,
    amountXlm: donation.asset === "XLM" ? donation.amount : 0,
    feeXlm: 0,
    projectXlm: donation.asset === "XLM" ? donation.amount : 0,
    walletAddress: donation.walletAddress,
    status:
      donation.status === "confirmed"
        ? "CONFIRMED"
        : donation.status === "pending"
          ? "PENDING"
          : "FAILED",
    txHash: donation.txHash,
    nftId: donation.nftId,
    createdAt: donation.createdAt,
    confirmedAt: donation.confirmedAt,
    asset: donation.asset,
    network: donation.network,
    amount: donation.amount,
    destinationAddress: donation.destinationAddress,
  };
}
