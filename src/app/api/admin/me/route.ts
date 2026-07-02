import { getAdminCheck } from "../../_lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const check = await getAdminCheck(request);

  return Response.json({
    isAdmin: check.isAdmin,
    ...(check.isAdmin && check.email ? { email: check.email } : {}),
  });
}
