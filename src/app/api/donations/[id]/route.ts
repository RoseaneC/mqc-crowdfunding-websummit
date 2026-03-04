import { proxyToFastify } from "../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  const { id } = await context.params;
  return proxyToFastify(request, "GET", `/donations/${id}`);
}
