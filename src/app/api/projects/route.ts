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
  const payload: unknown = await request.json().catch(() => null);
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

  if (getApiBaseUrl()) {
    return proxyToFastify(
      new Request(request.url, {
        method: "POST",
        headers: request.headers,
        body: JSON.stringify(payload),
      }),
      "POST",
      "/projects",
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

function validateCreateProjectPayload(payload: unknown):
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
  if (!isRecord(payload)) {
    return { ok: false, error: "Payload invalido." };
  }

  const name = (
    getStringField(payload, "name") || getStringField(payload, "title")
  ).trim();
  const description = getStringField(payload, "description").trim();
  const organization = (
    getStringField(payload, "organization") ||
    getStringField(payload, "ngoName")
  ).trim();
  const responsibleName =
    getStringField(payload, "responsibleName").trim() || organization;
  const responsibleEmail = (
    getStringField(payload, "responsibleEmail") ||
    getStringField(payload, "email")
  ).trim();
  const walletAddress = (
    getStringField(payload, "walletAddress") ||
    getStringField(payload, "ngoWallet")
  ).trim();
  const pixKey = getStringField(payload, "pixKey").trim();
  const pixQrCodeUrl = getStringField(payload, "pixQrCodeUrl").trim();
  const goalAmount = Number(
    getField(payload, "goalAmount") ?? getField(payload, "targetXlm"),
  );

  if (!name || !description || !organization || !responsibleName) {
    return { ok: false, error: "Preencha os dados principais do projeto." };
  }

  if (!Array.isArray(payload.axes)) {
    return {
      ok: false,
      error:
        "Selecione pelo menos um eixo de impacto para cadastrar o projeto.",
    };
  }

  if (payload.axes.length === 0) {
    return {
      ok: false,
      error:
        "Selecione pelo menos um eixo de impacto para cadastrar o projeto.",
    };
  }

  const axes: ImpactProjectAxis[] = [];

  for (const axis of payload.axes) {
    if (typeof axis !== "string" || !isImpactAxis(axis)) {
      return {
        ok: false,
        error: "Eixo de impacto invalido. Use AMBIENTAL, CULTURAL ou SOCIAL.",
      };
    }

    if (!axes.includes(axis)) {
      axes.push(axis);
    }
  }

  if (
    !responsibleEmail ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responsibleEmail)
  ) {
    return { ok: false, error: "Informe um e-mail responsavel valido." };
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getField(record: Record<string, unknown>, field: string) {
  return record[field];
}

function getStringField(record: Record<string, unknown>, field: string) {
  const value = record[field];

  return typeof value === "string" ? value : "";
}
