import { requireAdmin } from "../../../../_lib/adminAuth";
import { proxyToFastify } from "../../../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  return proxyToFastify(request, "GET", "/admin/mrosc/reports/my");
}
