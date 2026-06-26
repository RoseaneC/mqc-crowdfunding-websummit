import {
  setImpactProjectStatus,
  toProjectDTO,
  type ImpactProjectStatus,
} from "../../../_lib/projectStore";
import { getApiBaseUrl, proxyToFastify } from "../../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const { id } = await context.params;

  if (!getApiBaseUrl()) {
    const body = (await request.json().catch(() => null)) as {
      status?: string;
      reason?: string;
    } | null;
    const status = normalizeStatus(body?.status);

    if (!status) {
      return Response.json(
        {
          ok: false,
          error: "Status invalido.",
        },
        { status: 400 },
      );
    }

    const project = await setImpactProjectStatus(id, status, body?.reason);

    if (!project) {
      return Response.json(
        {
          ok: false,
          error: "Projeto nao encontrado ou nao editavel no fallback.",
        },
        { status: 404 },
      );
    }

    return Response.json({
      ok: true,
      project: toProjectDTO(project),
      source: "local-project-store",
    });
  }

  return proxyToFastify(request, "PATCH", `/projects/${id}/status`);
}

function normalizeStatus(
  value: string | undefined,
): ImpactProjectStatus | null {
  if (value === "PENDING" || value === "APPROVED" || value === "REJECTED") {
    return value;
  }

  if (value === "SUSPENDED" || value === "INACTIVE") return "SUSPENDED";

  return null;
}
