type ContactPayload = {
  name: string;
  email: string;
  message: string;
  source?: string;
};

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 3000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type, authorization",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
    },
  });
}

function optionsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type, authorization",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function toText(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function cleanSingleLine(value: unknown, maxLength: number) {
  return toText(value)
    .replace(/\0/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanMessage(value: unknown) {
  return toText(value)
    .replace(/\0/g, "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
}

async function parsePayload(request: Request): Promise<{
  payload?: ContactPayload;
  honeypot?: boolean;
  error?: string;
}> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return { error: "Envie os dados do formulário em JSON." };
  }

  if (!isRecord(body)) {
    return { error: "Formato de mensagem inválido." };
  }

  const honeypot = cleanSingleLine(body.website ?? body.company, 200);
  if (honeypot) {
    return { honeypot: true };
  }

  const payload = {
    name: cleanSingleLine(body.name, MAX_NAME_LENGTH),
    email: cleanSingleLine(body.email, MAX_EMAIL_LENGTH).toLowerCase(),
    message: cleanMessage(body.message),
    source: cleanSingleLine(body.source, 80) || "contact-page",
  };

  if (!payload.name) return { error: "Informe seu nome." };
  if (!payload.email || !EMAIL_PATTERN.test(payload.email)) {
    return { error: "Informe um e-mail válido." };
  }
  if (!payload.message || payload.message.length < 10) {
    return { error: "Digite uma mensagem com pelo menos 10 caracteres." };
  }

  return { payload };
}

function getApiBaseUrl() {
  return (process.env.API_BASE_URL ?? "").replace(/\/$/, "");
}

async function forwardToConfiguredApi(payload: ContactPayload) {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) return null;

  const response = await fetch(`${apiBaseUrl}/contact-messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { body: text };
  }

  if (!response.ok) {
    return json(data, response.status);
  }

  const record = isRecord(data) ? data : {};
  const id =
    typeof record.id === "number"
      ? record.id
      : typeof record.id === "string"
        ? Number(record.id)
        : Date.now();
  const createdAt =
    typeof record.createdAt === "string"
      ? record.createdAt
      : new Date().toISOString();

  return json(
    {
      ok: true,
      id: Number.isFinite(id) ? id : Date.now(),
      createdAt,
      delivery: "api",
      message: "Mensagem encaminhada para a API configurada.",
    },
    response.status,
  );
}

function demoResponse() {
  return json(
    {
      ok: true,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      delivery: "demo",
      message:
        "Mensagem recebida em ambiente de demonstração. Configure API_BASE_URL ou um serviço de e-mail para envio real.",
    },
    202,
  );
}

export async function handleContactPost(request: Request) {
  const parsed = await parsePayload(request);

  if (parsed.honeypot) {
    return demoResponse();
  }

  if (parsed.error || !parsed.payload) {
    return json({ ok: false, error: parsed.error }, 400);
  }

  try {
    const forwarded = await forwardToConfiguredApi(parsed.payload);
    if (forwarded) return forwarded;
  } catch {
    return json(
      {
        ok: true,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        delivery: "demo",
        warning:
          "API externa indisponível. A mensagem foi recebida apenas em modo de demonstração.",
        message:
          "Mensagem recebida em ambiente de demonstração. Configure API_BASE_URL ou um serviço de e-mail para envio real.",
      },
      202,
    );
  }

  return demoResponse();
}

export function handleContactOptions() {
  return optionsResponse();
}
