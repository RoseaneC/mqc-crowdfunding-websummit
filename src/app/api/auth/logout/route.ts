import { proxyToFastify } from "../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return proxyToFastify(request, "POST", "/auth/logout");
}
