import { requireAdmin } from "../../../../../_lib/adminAuth";
import { proxyToFastify } from "../../../../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  return proxyToFastify(request, "PATCH", `/admin/mrosc/reports/${id}/status`);
}
