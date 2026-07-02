import {
  setImpactProjectFeatured,
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
  const body = (await request.json().catch(() => null)) as {
    featured?: boolean;
  } | null;

  if (getApiBaseUrl()) {
    return Response.json(
      {
        ok: false,
        error:
          "Endpoint dedicado de destaque ainda nao esta mapeado para API_BASE_URL.",
      },
      { status: 501 },
    );
  }

  const project = await setImpactProjectFeatured(id, body?.featured ?? true);

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
