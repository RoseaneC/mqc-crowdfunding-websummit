import {
  setImpactProjectStatus,
  toProjectDTO,
} from "../../../../_lib/projectStore";
import { requireAdmin } from "../../../../_lib/adminAuth";
import { getApiBaseUrl } from "../../../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Ctx) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  if (getApiBaseUrl()) {
    return Response.json(
      {
        ok: false,
        error:
          "Endpoint dedicado de aprovacao ainda nao esta mapeado para API_BASE_URL.",
      },
      { status: 501 },
    );
  }

  const project = await setImpactProjectStatus(id, "APPROVED");

  if (!project) {
    return Response.json(
      {
        ok: false,
        error: "Projeto nao encontrado.",
      },
      { status: 404 },
    );
  }

  return Response.json({
    ok: true,
    project: toProjectDTO(project),
    warning: "Modo demonstrativo: endpoint pronto para protecao admin futura.",
  });
}
