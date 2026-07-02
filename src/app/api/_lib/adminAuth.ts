import { getApiBaseUrl } from "./proxy";

type AdminCheck = {
  authenticated: boolean;
  isAdmin: boolean;
  email: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStringField(
  value: Record<string, unknown>,
  field: string,
): string | null {
  const fieldValue = value[field];
  return typeof fieldValue === "string" ? fieldValue : null;
}

function normalizeEmail(value: string | null | undefined): string | null {
  const email = value?.trim().toLowerCase();
  return email ? email : null;
}

export function getAdminEmailAllowlist(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => normalizeEmail(email))
      .filter((email): email is string => Boolean(email)),
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;

  return getAdminEmailAllowlist().has(normalizedEmail);
}

function getAuthorizationHeader(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  return authorization?.trim() || null;
}

function getBearerToken(request: Request): string | null {
  const authorization = getAuthorizationHeader(request);
  if (!authorization?.toLowerCase().startsWith("bearer ")) return null;

  return authorization.slice("bearer ".length).trim() || null;
}

function extractEmailFromAuthPayload(payload: unknown): string | null {
  if (!isRecord(payload)) return null;

  const directEmail = getStringField(payload, "email");
  if (directEmail) return normalizeEmail(directEmail);

  const data = payload.data;
  if (isRecord(data)) {
    const dataEmail = getStringField(data, "email");
    if (dataEmail) return normalizeEmail(dataEmail);
  }

  const user = payload.user;
  if (isRecord(user)) {
    const userEmail = getStringField(user, "email");
    if (userEmail) return normalizeEmail(userEmail);
  }

  return null;
}

function decodeJwtPayload(token: string): unknown {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  const payload = parts[1];
  if (!payload) return null;

  const normalized = payload
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(payload.length / 4) * 4, "=");

  try {
    return JSON.parse(
      Buffer.from(normalized, "base64").toString("utf8"),
    ) as Record<string, unknown> | null;
  } catch {
    return null;
  }
}

async function getEmailFromApiBase(request: Request): Promise<string | null> {
  const apiBaseUrl = getApiBaseUrl();
  const authorization = getAuthorizationHeader(request);

  if (!apiBaseUrl || !authorization) return null;

  try {
    const response = await fetch(`${apiBaseUrl}/auth/me`, {
      headers: {
        authorization,
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload: unknown = await response.json();
    return extractEmailFromAuthPayload(payload);
  } catch (error) {
    console.error("Admin auth lookup failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}

async function getAuthenticatedEmail(request: Request): Promise<string | null> {
  const apiEmail = await getEmailFromApiBase(request);
  if (apiEmail) return apiEmail;

  const token = getBearerToken(request);
  if (!token) return null;

  return extractEmailFromAuthPayload(decodeJwtPayload(token));
}

export async function getAdminCheck(request: Request): Promise<AdminCheck> {
  const email = await getAuthenticatedEmail(request);

  return {
    authenticated: Boolean(email),
    isAdmin: isAdminEmail(email),
    email,
  };
}

export async function requireAdmin(request: Request): Promise<Response | null> {
  const check = await getAdminCheck(request);

  if (!check.authenticated) {
    return Response.json(
      {
        ok: false,
        error: "Conecte-se para acessar a área administrativa.",
      },
      { status: 401 },
    );
  }

  if (!check.isAdmin) {
    return Response.json(
      {
        ok: false,
        error: "Você não tem permissão para acessar esta área.",
      },
      { status: 403 },
    );
  }

  return null;
}
