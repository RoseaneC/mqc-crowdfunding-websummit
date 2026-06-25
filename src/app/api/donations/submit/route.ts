import {
  addDonation,
  toDonationReceipt,
  type StoredDonationAsset,
  type StoredDonationNetwork,
  type StoredDonationStatus,
} from "../../_lib/donationStore";
import { demoProjects } from "../../_lib/demoProjects";
import { getApiBaseUrl, proxyToFastify } from "../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DonationSubmitPayload = {
  donationId?: number;
  projectId?: number;
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
  const validation = validateDonationSubmitPayload(payload);

  if (!validation.ok) {
    return Response.json(
      {
        ok: false,
        error: validation.error,
      },
      { status: validation.status },
    );
  }

  const donation = addDonation(validation.value);

  console.info("[donations-submit] Confirmed donation stored locally.", {
    id: donation.id,
    projectId: donation.projectId,
    amount: donation.amount,
    asset: donation.asset,
    network: donation.network,
    txHash: donation.txHash,
  });

  return Response.json(
    {
      ok: true,
      donation: toDonationReceipt(donation),
    },
    { status: 201 },
  );
}

function validateDonationSubmitPayload(payload: DonationSubmitPayload | null):
  | {
      ok: true;
      value: {
        id?: number;
        projectId: number;
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
  | { ok: false; error: string; status: number } {
  if (!payload) {
    return { ok: false, error: "Payload invalido.", status: 400 };
  }

  const projectId = Number(payload.projectId);
  const project = demoProjects.find((item) => Number(item.id) === projectId);

  if (!Number.isInteger(projectId) || projectId <= 0 || !project) {
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

  if (!asset) {
    return { ok: false, error: "Asset invalido.", status: 400 };
  }

  if (!network) {
    return { ok: false, error: "Rede invalida.", status: 400 };
  }

  if (!status) {
    return { ok: false, error: "Status invalido.", status: 400 };
  }

  if (network === "stellar-mainnet" && !isValidTxHash(txHash)) {
    return {
      ok: false,
      error: "txHash valido e obrigatorio para doacao Mainnet.",
      status: 400,
    };
  }

  if (status === "confirmed" && network !== "demo" && !isValidTxHash(txHash)) {
    return {
      ok: false,
      error: "Doacao confirmada em rede Stellar exige txHash valido.",
      status: 400,
    };
  }

  if (!payload.walletAddress?.trim()) {
    return { ok: false, error: "Carteira doadora obrigatoria.", status: 400 };
  }

  return {
    ok: true,
    value: {
      id: payload.donationId,
      projectId,
      projectName: payload.projectName || project.title,
      donorType: payload.donorType === "PJ" ? "PJ" : "PF",
      document: payload.document,
      amount,
      asset,
      network,
      txHash,
      status,
      walletAddress: payload.walletAddress.trim(),
      destinationAddress: payload.destinationAddress?.trim(),
      contractDonationId: payload.contractDonationId,
      nftId: payload.nftId,
    },
  };
}

function parseAsset(value: string | undefined): StoredDonationAsset | null {
  if (value === "XLM" || value === "USDC" || value === "BRZ") return value;
  return null;
}

function parseNetwork(value: string | undefined): StoredDonationNetwork | null {
  if (
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
  return /^[0-9a-fA-F]{64}$/.test((hash ?? "").trim());
}
