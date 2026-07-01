import { requireAdmin } from "../../../../../_lib/adminAuth";
import { proxyToFastify } from "../../../../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string; userId: string }> };

export async function DELETE(request: Request, context: Ctx) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id, userId } = await context.params;
  return proxyToFastify(
    request,
    "DELETE",
    `/admin/projects/${id}/admins/${userId}`,
  );
}
