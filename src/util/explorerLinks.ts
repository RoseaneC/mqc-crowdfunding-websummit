import { impactSbtContractId, stellarNetwork } from "../contracts/util";

const LOCAL_IMPACT_SBT_CONTRACT_ID =
  "CB4VREIALJOPIIUX6RGX2WF7GWXD3VWGMRSDDW2V5GCBJ4N2DNXYMXC6";

type ExplorerKind = "stellar_expert" | "stellar_lab";

function networkToExpertSegment() {
  if (stellarNetwork === "PUBLIC") return "public";
  if (stellarNetwork === "TESTNET") return "testnet";
  return null;
}

function getExplorerKind(): ExplorerKind {
  return networkToExpertSegment() ? "stellar_expert" : "stellar_lab";
}

function getExpertBaseUrl() {
  const segment = networkToExpertSegment();
  if (!segment) return null;
  return `https://stellar.expert/explorer/${segment}`;
}

export function getExplorerLabel() {
  return getExplorerKind() === "stellar_expert"
    ? "Stellar Expert"
    : "Stellar Laboratory";
}

export function isValidTxHash(hash: string | null | undefined) {
  return /^[0-9a-fA-F]{64}$/.test((hash ?? "").trim());
}

export function isValidContractId(contractId: string | null | undefined) {
  return /^C[A-Z2-7]{55}$/.test((contractId ?? "").trim());
}

export function resolveImpactSbtContractId() {
  const configured = impactSbtContractId.trim();
  if (isValidContractId(configured)) return configured;
  if (stellarNetwork === "LOCAL") return LOCAL_IMPACT_SBT_CONTRACT_ID;
  return "";
}

export function buildTransactionExplorerUrl(txHash: string | null | undefined) {
  if (!isValidTxHash(txHash)) return null;
  const hash = txHash!.trim();
  const expertBase = getExpertBaseUrl();
  if (!expertBase) return null;
  return `${expertBase}/tx/${hash}`;
}

export function buildContractExplorerUrl(
  contractId: string | null | undefined,
) {
  if (!isValidContractId(contractId)) return null;
  const id = contractId!.trim();
  const expertBase = getExpertBaseUrl();
  if (expertBase) return `${expertBase}/contract/${id}`;
  return null;
}

export function buildNftTokenExplorerUrl(tokenId: number | null | undefined) {
  const numericTokenId = Number(tokenId);
  if (!Number.isFinite(numericTokenId) || numericTokenId <= 0) return null;
  if (!networkToExpertSegment()) return null;
  const contractId = resolveImpactSbtContractId();
  const contractUrl = buildContractExplorerUrl(contractId);
  if (!contractUrl) return null;
  const tokenValue = Math.trunc(numericTokenId);
  return `${contractUrl}?token=${tokenValue}`;
}
