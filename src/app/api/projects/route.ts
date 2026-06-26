import {
  createImpactProject,
  listImpactDonationMetricRecords,
  listImpactProjects,
  toProjectDTO,
  type ImpactProjectAxis,
} from "../_lib/projectStore";
import { getApiBaseUrl, proxyToFastify } from "../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (getApiBaseUrl()) {
    return proxyToFastify(request, "GET", "/projects");
  }

  const [projects, donations] = await Promise.all([
    listImpactProjects(),
    listImpactDonationMetricRecords(),
  ]);

  return Response.json({
    data: projects.map((project) => toProjectDTO(project, donations)),
    source: "local-project-store",
  });
}

export async function POST(request: Request) {
  if (getApiBaseUrl()) {
    return proxyToFastify(request, "POST", "/projects");
  }

  const payload = (await request
    .json()
    .catch(() => null)) as ProjectCreatePayload | null;
  const validation = validateCreateProjectPayload(payload);

  if (!validation.ok) {
    return Response.json(
      {
        ok: false,
        error: validation.error,
      },
      { status: 400 },
    );
  }

  const project = await createImpactProject(validation.value);

  return Response.json(
    {
      ok: true,
      id: project.id,
      project: toProjectDTO(project),
      source: "local-project-store",
    },
    { status: 201 },
  );
}

type ProjectCreatePayload = {
  name?: string;
  title?: string;
  description?: string;
  organization?: string;
  ngoName?: string;
  responsibleName?: string;
  responsibleEmail?: string;
  email?: string;
  walletAddress?: string | null;
  ngoWallet?: string | null;
  pixKey?: string | null;
  pixQrCodeUrl?: string | null;
  goalAmount?: number | string;
  targetXlm?: number | string;
  goalAsset?: string;
  axes?: string[];
};

function validateCreateProjectPayload(payload: ProjectCreatePayload | null):
  | {
      ok: true;
      value: {
        name: string;
        description: string;
        organization: string;
        responsibleName: string;
        responsibleEmail: string;
        walletAddress?: string | null;
        pixKey?: string | null;
        pixQrCodeUrl?: string | null;
        goalAmount: number;
        goalAsset: "USDGLO";
        axes: ImpactProjectAxis[];
      };
    }
  | { ok: false; error: string } {
  if (!payload) {
    return { ok: false, error: "Payload invalido." };
  }

  const name = (payload.name ?? payload.title ?? "").trim();
  const description = payload.description?.trim() ?? "";
  const organization = (payload.organization ?? payload.ngoName ?? "").trim();
  const responsibleName = payload.responsibleName?.trim() ?? organization;
  const responsibleEmail = (
    payload.responsibleEmail ??
    payload.email ??
    ""
  ).trim();
  const walletAddress = (
    payload.walletAddress ??
    payload.ngoWallet ??
    ""
  ).trim();
  const pixKey = payload.pixKey?.trim() ?? "";
  const pixQrCodeUrl = payload.pixQrCodeUrl?.trim() ?? "";
  const goalAmount = Number(payload.goalAmount ?? payload.targetXlm);
  const axes = (payload.axes ?? []).filter(isImpactAxis);

  if (!name || !description || !organization || !responsibleName) {
    return { ok: false, error: "Preencha os dados principais do projeto." };
  }

  if (
    !responsibleEmail ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responsibleEmail)
  ) {
    return { ok: false, error: "Informe um e-mail responsavel valido." };
  }

  if (axes.length === 0) {
    return { ok: false, error: "Selecione pelo menos um eixo de impacto." };
  }

  if (!Number.isFinite(goalAmount) || goalAmount <= 0) {
    return { ok: false, error: "Informe uma meta valida." };
  }

  if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return {
      ok: false,
      error: "Wallet EVM precisa comecar com 0x e ter 42 caracteres.",
    };
  }

  if (!walletAddress && !pixKey && !pixQrCodeUrl) {
    return {
      ok: false,
      error: "Informe uma wallet EVM, chave PIX ou URL de QR Code PIX.",
    };
  }

  return {
    ok: true,
    value: {
      name,
      description,
      organization,
      responsibleName,
      responsibleEmail,
      walletAddress: walletAddress || null,
      pixKey: pixKey || null,
      pixQrCodeUrl: pixQrCodeUrl || null,
      goalAmount,
      goalAsset: "USDGLO",
      axes,
    },
  };
}

function isImpactAxis(value: string): value is ImpactProjectAxis {
  return value === "AMBIENTAL" || value === "CULTURAL" || value === "SOCIAL";
}
