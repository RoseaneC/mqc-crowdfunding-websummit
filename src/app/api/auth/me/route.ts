import { isAdminEmail } from "../../_lib/adminAuth";
import { proxyToFastify } from "../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getEmail(value: unknown): string | null {
  if (!isRecord(value)) return null;

  const email = value.email;
  return typeof email === "string" ? email : null;
}

export async function GET(request: Request) {
  const response = await proxyToFastify(request, "GET", "/auth/me");
  const payload: unknown = await response.json().catch(() => null);

  if (!isRecord(payload)) {
    return Response.json(payload, { status: response.status });
  }

  return Response.json(
    {
      ...payload,
      isAdmin: isAdminEmail(getEmail(payload)),
    },
    { status: response.status },
  );
}
