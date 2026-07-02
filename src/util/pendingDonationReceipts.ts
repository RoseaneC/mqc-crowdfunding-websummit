import { safeLocalStorageGetJson } from "./safeStorage";

export const PENDING_DONATION_RECEIPTS_KEY =
  "ponteia_pending_donation_receipts";

export type PendingDonationReceipt = {
  projectId: number | string;
  projectName: string;
  donorType: "PF" | "PJ";
  document?: string;
  amount: number | string;
  asset: "USDGLO" | "CELO";
  network: "celo-mainnet";
  txHash: string;
  donorWallet: string;
  recipientWallet: string;
  createdAt: string;
  localStatus: "PENDING_PLATFORM_SYNC";
};

export function listPendingDonationReceipts(): PendingDonationReceipt[] {
  if (typeof window === "undefined") return [];

  const parsed = safeLocalStorageGetJson<unknown>(
    PENDING_DONATION_RECEIPTS_KEY,
    [],
  );

  if (!Array.isArray(parsed)) return [];

  return parsed.filter(isPendingDonationReceipt);
}

export function listPendingDonationReceiptsByWallet(wallet: string | null) {
  const normalizedWallet = normalizeWallet(wallet);
  if (!normalizedWallet) return [];

  return listPendingDonationReceipts().filter(
    (receipt) => normalizeWallet(receipt.donorWallet) === normalizedWallet,
  );
}

export function getPendingDonationReceiptByTxHash(txHash: string | null) {
  const normalizedTxHash = normalizeTxHash(txHash);
  if (!normalizedTxHash) return null;

  return (
    listPendingDonationReceipts().find(
      (receipt) => normalizeTxHash(receipt.txHash) === normalizedTxHash,
    ) ?? null
  );
}

export function savePendingDonationReceipt(receipt: PendingDonationReceipt) {
  if (typeof window === "undefined") return;

  const normalizedTxHash = normalizeTxHash(receipt.txHash);
  if (!normalizedTxHash) return;

  const receipts = listPendingDonationReceipts();
  const nextReceipt: PendingDonationReceipt = {
    ...receipt,
    txHash: normalizedTxHash,
    donorWallet: receipt.donorWallet.toLowerCase(),
    recipientWallet: receipt.recipientWallet.toLowerCase(),
  };
  const nextReceipts = [
    nextReceipt,
    ...receipts.filter(
      (item) => normalizeTxHash(item.txHash) !== normalizedTxHash,
    ),
  ];

  window.localStorage.setItem(
    PENDING_DONATION_RECEIPTS_KEY,
    JSON.stringify(nextReceipts),
  );
  window.dispatchEvent(new Event("ponteia:pending-donations-changed"));
}

export function removePendingDonationReceipt(txHash: string | null) {
  if (typeof window === "undefined") return;

  const normalizedTxHash = normalizeTxHash(txHash);
  if (!normalizedTxHash) return;

  const nextReceipts = listPendingDonationReceipts().filter(
    (receipt) => normalizeTxHash(receipt.txHash) !== normalizedTxHash,
  );

  window.localStorage.setItem(
    PENDING_DONATION_RECEIPTS_KEY,
    JSON.stringify(nextReceipts),
  );
  window.dispatchEvent(new Event("ponteia:pending-donations-changed"));
}

export function normalizeTxHash(value: string | null | undefined) {
  const txHash = value?.trim().toLowerCase();
  return txHash && /^0x[0-9a-f]{64}$/.test(txHash) ? txHash : null;
}

function normalizeWallet(value: string | null | undefined) {
  const wallet = value?.trim().toLowerCase();
  return wallet && /^0x[0-9a-f]{40}$/.test(wallet) ? wallet : null;
}

function isPendingDonationReceipt(
  value: unknown,
): value is PendingDonationReceipt {
  if (!value || typeof value !== "object") return false;

  const receipt = value as Record<string, unknown>;

  return (
    (typeof receipt.projectId === "string" ||
      typeof receipt.projectId === "number") &&
    typeof receipt.projectName === "string" &&
    (receipt.donorType === "PF" || receipt.donorType === "PJ") &&
    (typeof receipt.amount === "string" ||
      typeof receipt.amount === "number") &&
    (receipt.asset === "USDGLO" || receipt.asset === "CELO") &&
    receipt.network === "celo-mainnet" &&
    typeof receipt.txHash === "string" &&
    Boolean(normalizeTxHash(receipt.txHash)) &&
    typeof receipt.donorWallet === "string" &&
    Boolean(normalizeWallet(receipt.donorWallet)) &&
    typeof receipt.recipientWallet === "string" &&
    Boolean(normalizeWallet(receipt.recipientWallet)) &&
    typeof receipt.createdAt === "string" &&
    receipt.localStatus === "PENDING_PLATFORM_SYNC"
  );
}
