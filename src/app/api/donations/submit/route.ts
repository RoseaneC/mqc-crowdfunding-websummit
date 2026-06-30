import {
  addDonation,
  toDonationReceipt,
  type StoredDonationAsset,
  type StoredDonationNetwork,
  type StoredDonationStatus,
} from "../../_lib/donationStore";
import {
  createConfirmedDonation,
  getImpactProject,
} from "../../_lib/projectStore";
import { getApiBaseUrl, proxyToFastify } from "../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DonationSubmitPayload = {
  donationId?: number;
  projectId?: number | string;
  projectName?: string;
  donorType?: "PF" | "PJ";
  document?: string;
  amount?: number | string;
  amountXlm?: number | string;
  asset?: string;
  network?: string;
  txHash?: string | null;
  status?: string;
  walletAddress?: string;
  destinationAddress?: string;
  contractDonationId?: string;
  nftId?: number | null;
};

export async function POST(request: Request) {
  if (getApiBaseUrl()) {
    return proxyToFastify(request, "POST", "/donations/submit");
  }

  const payload = (await request
    .json()
    .catch(() => null)) as DonationSubmitPayload | null;
  const validation = await validateDonationSubmitPayload(payload);

  if (!validation.ok) {
    return Response.json(
      {
        ok: false,
        error: validation.error,
      },
      { status: validation.status },
    );
  }

  const persistedDonation =
    validation.value.status === "confirmed" &&
    (validation.value.network === "celo-mainnet" ||
      validation.value.network === "stellar-mainnet")
      ? await createConfirmedDonation({
          projectId: String(validation.value.projectId),
          donorWallet: validation.value.walletAddress,
          amount: validation.value.amount,
          asset: validation.value.asset,
          network: validation.value.network,
          txHash: validation.value.txHash,
          destinationAddress: validation.value.destinationAddress,
        })
      : null;

  const donation = addDonation(validation.value);
  const receipt = persistedDonation ?? toDonationReceipt(donation);

  console.info("[donations-submit] Confirmed donation stored locally.", {
    id: receipt.id,
    projectId: receipt.projectId,
    amount: receipt.amount,
    asset: receipt.asset,
    network: receipt.network,
    txHash: receipt.txHash,
  });

  return Response.json(
    {
      ok: true,
      donation: receipt,
    },
    { status: 201 },
  );
}

async function validateDonationSubmitPayload(
  payload: DonationSubmitPayload | null,
): Promise<
  | {
      ok: true;
      value: {
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
        contractDonationId?: string;
        nftId?: number | null;
      };
    }
  | { ok: false; error: string; status: number }
> {
  if (!payload) {
    return { ok: false, error: "Payload invalido.", status: 400 };
  }

  const projectId = String(payload.projectId ?? "").trim();
  const project = projectId ? await getImpactProject(projectId) : null;

  if (!projectId || !project) {
    return { ok: false, error: "Projeto invalido.", status: 400 };
  }

  const amount = Number(payload.amount ?? payload.amountXlm);

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Valor de doacao invalido.", status: 400 };
  }

  const asset = parseAsset(payload.asset);
  const network = parseNetwork(payload.network);
  const status = parseStatus(payload.status);
  const txHash = payload.txHash?.trim() || null;
  const walletAddress = payload.walletAddress?.trim().toLowerCase();
  const destinationAddress = payload.destinationAddress?.trim().toLowerCase();

  if (!asset) {
    return { ok: false, error: "Asset invalido.", status: 400 };
  }

  if (!network) {
    return { ok: false, error: "Rede invalida.", status: 400 };
  }

  if (!status) {
    return { ok: false, error: "Status invalido.", status: 400 };
  }

  if (
    (network === "stellar-mainnet" || network === "celo-mainnet") &&
    !isValidTxHash(txHash)
  ) {
    return {
      ok: false,
      error: "txHash valido e obrigatorio para doacao Mainnet.",
      status: 400,
    };
  }

  if (status === "confirmed" && network !== "demo" && !isValidTxHash(txHash)) {
    return {
      ok: false,
      error: "Doacao confirmada em Mainnet exige txHash valido.",
      status: 400,
    };
  }

  if (!walletAddress) {
    return { ok: false, error: "Carteira doadora obrigatoria.", status: 400 };
  }

  return {
    ok: true,
    value: {
      id: payload.donationId,
      projectId,
      projectName: payload.projectName || project.name,
      donorType: payload.donorType === "PJ" ? "PJ" : "PF",
      document: payload.document,
      amount,
      asset,
      network,
      txHash,
      status,
      walletAddress,
      destinationAddress,
      contractDonationId: payload.contractDonationId,
      nftId: payload.nftId,
    },
  };
}

function parseAsset(value: string | undefined): StoredDonationAsset | null {
  if (
    value === "USDGLO" ||
    value === "CELO" ||
    value === "XLM" ||
    value === "USDC" ||
    value === "BRZ"
  ) {
    return value;
  }
  return null;
}

function parseNetwork(value: string | undefined): StoredDonationNetwork | null {
  if (
    value === "celo-mainnet" ||
    value === "stellar-mainnet" ||
    value === "stellar-testnet" ||
    value === "demo"
  ) {
    return value;
  }

  return null;
}

function parseStatus(value: string | undefined): StoredDonationStatus | null {
  if (value === "confirmed" || value === "pending" || value === "failed") {
    return value;
  }

  return null;
}

function isValidTxHash(hash: string | null | undefined) {
  return /^(0x)?[0-9a-fA-F]{64}$/.test((hash ?? "").trim());
}
