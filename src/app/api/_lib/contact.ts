import nodemailer from "nodemailer";

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
const CONTACT_SOURCE = "MQC Crowdfunding";
const CONTACT_SUBJECT = "Novo contato pelo MQC Crowdfunding";
const REAL_EMAIL_SUCCESS_MESSAGE =
  "Mensagem enviada com sucesso! Nossa equipe recebeu seu contato.";
const DEMO_CONTACT_MESSAGE =
  "Mensagem recebida em ambiente de demonstração. Configure as variáveis SMTP para envio real de e-mail.";
const REAL_EMAIL_ERROR_MESSAGE =
  "Não foi possível enviar sua mensagem agora. Tente novamente em alguns minutos.";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  to: string;
  from: string;
};

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
      sent: false,
      demo: false,
      message: "Mensagem encaminhada para a API configurada.",
    },
    response.status,
  );
}

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const portText = process.env.SMTP_PORT?.trim();
  const secureText = process.env.SMTP_SECURE?.trim().toLowerCase();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  const port = Number(portText);

  if (
    !host ||
    !portText ||
    !Number.isFinite(port) ||
    !secureText ||
    !user ||
    !pass ||
    !to ||
    !from
  ) {
    return null;
  }

  return {
    host,
    port,
    secure: secureText === "true",
    user,
    pass,
    to,
    from,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getContactTimestamp() {
  return new Date().toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
}

function buildEmailText(payload: ContactPayload, sentAt: string) {
  return [
    CONTACT_SUBJECT,
    "",
    `Nome: ${payload.name}`,
    `E-mail: ${payload.email}`,
    `Data e hora do envio: ${sentAt}`,
    `Origem: ${CONTACT_SOURCE}`,
    "",
    "Mensagem:",
    payload.message,
  ].join("\n");
}

function buildEmailHtml(payload: ContactPayload, sentAt: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">${CONTACT_SUBJECT}</h1>
      <p><strong>Nome:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(payload.email)}</p>
      <p><strong>Data e hora do envio:</strong> ${escapeHtml(sentAt)}</p>
      <p><strong>Origem:</strong> ${CONTACT_SOURCE}</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p><strong>Mensagem:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(payload.message)}</p>
    </div>
  `;
}

async function sendContactEmail(payload: ContactPayload, config: SmtpConfig) {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
  const sentAt = getContactTimestamp();

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    replyTo: payload.email,
    subject: CONTACT_SUBJECT,
    text: buildEmailText(payload, sentAt),
    html: buildEmailHtml(payload, sentAt),
  });

  return json({
    ok: true,
    sent: true,
    demo: false,
    id: Date.now(),
    createdAt: new Date().toISOString(),
    delivery: "smtp",
    message: REAL_EMAIL_SUCCESS_MESSAGE,
  });
}

function demoResponse() {
  return json(
    {
      ok: true,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      delivery: "demo",
      sent: false,
      demo: true,
      message: DEMO_CONTACT_MESSAGE,
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

  const smtpConfig = getSmtpConfig();

  if (smtpConfig) {
    try {
      return await sendContactEmail(parsed.payload, smtpConfig);
    } catch {
      return json(
        {
          ok: false,
          sent: false,
          demo: false,
          message: REAL_EMAIL_ERROR_MESSAGE,
        },
        502,
      );
    }
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
        sent: false,
        demo: true,
        warning:
          "API externa indisponível. A mensagem foi recebida apenas em modo de demonstração.",
        message: DEMO_CONTACT_MESSAGE,
      },
      202,
    );
  }

  return demoResponse();
}

export function handleContactOptions() {
  return optionsResponse();
}
