import { proxyToFastify } from "../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return proxyToFastify(request, "GET", "/admin/users");
}
