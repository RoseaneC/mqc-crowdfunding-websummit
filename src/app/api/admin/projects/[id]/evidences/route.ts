import {
  createProjectEvidence,
  getImpactProject,
  listProjectEvidences,
  type EvidenceType,
} from "../../../../_lib/projectStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

type EvidencePayload = {
  title?: string;
  description?: string;
  type?: string;
  fileUrl?: string;
  fileName?: string | null;
  mimeType?: string | null;
  userId?: string | null;
};

export async function GET(_request: Request, context: Ctx) {
  const { id } = await context.params;
  const evidences = await listProjectEvidences(id);

  return Response.json({
    data: evidences,
    source: "local-project-store",
  });
}

export async function POST(request: Request, context: Ctx) {
  const { id } = await context.params;
  const project = await getImpactProject(id);

  if (!project) {
    return Response.json(
      {
        ok: false,
        error: "Projeto nao encontrado.",
      },
      { status: 404 },
    );
  }

  const payload = (await request
    .json()
    .catch(() => null)) as EvidencePayload | null;
  const validation = validateEvidencePayload(payload);

  if (!validation.ok) {
    return Response.json(
      {
        ok: false,
        error: validation.error,
      },
      { status: 400 },
    );
  }

  const evidence = await createProjectEvidence({
    projectId: id,
    ...validation.value,
  });

  return Response.json(
    {
      ok: true,
      evidence,
      message:
        "Evidencia registrada por URL manual. TODO: integrar upload real via Vercel Blob, S3 ou Supabase Storage.",
    },
    { status: 201 },
  );
}

function validateEvidencePayload(payload: EvidencePayload | null):
  | {
      ok: true;
      value: {
        title: string;
        description: string;
        type: EvidenceType;
        fileUrl: string;
        fileName?: string | null;
        mimeType?: string | null;
        userId?: string | null;
      };
    }
  | { ok: false; error: string } {
  if (!payload) {
    return { ok: false, error: "Payload invalido." };
  }

  const title = payload.title?.trim() ?? "";
  const description = payload.description?.trim() ?? "";
  const type = parseEvidenceType(payload.type);
  const fileUrl = payload.fileUrl?.trim() ?? "";

  if (!title || !description || !fileUrl) {
    return {
      ok: false,
      error: "Informe titulo, descricao e URL do arquivo/evidencia.",
    };
  }

  return {
    ok: true,
    value: {
      title,
      description,
      type,
      fileUrl,
      fileName: payload.fileName?.trim() || null,
      mimeType: payload.mimeType?.trim() || null,
      userId: payload.userId?.trim() || null,
    },
  };
}

function parseEvidenceType(value: string | undefined): EvidenceType {
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
