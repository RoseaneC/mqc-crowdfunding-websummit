import { proxyToFastify } from "../../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ wallet: string }> };

export async function GET(request: Request, context: Ctx) {
  const { wallet } = await context.params;
  return proxyToFastify(
    request,
    "GET",
    `/users/${encodeURIComponent(wallet)}/donations`,
  );
}
