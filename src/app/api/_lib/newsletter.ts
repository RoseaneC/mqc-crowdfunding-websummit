import nodemailer from "nodemailer";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NEWSLETTER_SUBJECT = "Novo cadastro na newsletter MQC";
const REAL_NEWSLETTER_SUCCESS_MESSAGE = "Cadastro realizado com sucesso!";
const DEMO_NEWSLETTER_MESSAGE =
  "Recebemos seu e-mail para a demonstração. Configure SMTP para envio real da notificação.";
const NEWSLETTER_ERROR_MESSAGE =
  "Não foi possível registrar seu cadastro agora. Tente novamente em alguns minutos.";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  to: string;
  from: string;
};

const demoNewsletterEmails = new Set<string>();

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

function cleanEmail(value: unknown) {
  return typeof value === "string"
    ? value.replace(/\0/g, "").trim().toLowerCase().slice(0, 160)
    : "";
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

function getNewsletterTimestamp() {
  return new Date().toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
}

async function parseEmail(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return { error: "Envie os dados do formulário em JSON." };
  }

  if (!isRecord(body)) {
    return { error: "Formato de cadastro inválido." };
  }

  const email = cleanEmail(body.email);

  if (!email || !EMAIL_PATTERN.test(email)) {
    return { error: "Informe um e-mail válido." };
  }

  return { email };
}

async function sendNewsletterEmail(email: string, config: SmtpConfig) {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
  const sentAt = getNewsletterTimestamp();

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    replyTo: email,
    subject: NEWSLETTER_SUBJECT,
    text: [
      NEWSLETTER_SUBJECT,
      "",
      `E-mail: ${email}`,
      `Data e hora: ${sentAt}`,
      "Origem: MQC Crowdfunding - Footer",
    ].join("\n"),
  });
}

export async function handleNewsletterPost(request: Request) {
  const parsed = await parseEmail(request);

  if (parsed.error || !parsed.email) {
    return json({ ok: false, error: parsed.error }, 400);
  }

  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    demoNewsletterEmails.add(parsed.email);

    return json(
      {
        ok: true,
        sent: false,
        demo: true,
        totalDemoSubscribers: demoNewsletterEmails.size,
        message: DEMO_NEWSLETTER_MESSAGE,
      },
      202,
    );
  }

  try {
    await sendNewsletterEmail(parsed.email, smtpConfig);

    return json({
      ok: true,
      sent: true,
      demo: false,
      message: REAL_NEWSLETTER_SUCCESS_MESSAGE,
    });
  } catch {
    return json(
      {
        ok: false,
        sent: false,
        demo: false,
        message: NEWSLETTER_ERROR_MESSAGE,
      },
      502,
    );
  }
}

export function handleNewsletterOptions() {
  return optionsResponse();
}
