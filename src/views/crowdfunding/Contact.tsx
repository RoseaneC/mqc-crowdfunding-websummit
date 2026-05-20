import { FormEvent, ReactNode, useState } from "react";
import { Instagram, Linkedin, Mail } from "lucide-react";
import { submitContactMessage } from "../../util/crowdfundingApi";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: typeof errors = {};

    if (!name.trim()) nextErrors.name = "Informe seu nome.";

    if (!email.trim()) {
      nextErrors.email = "Informe seu e-mail.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Informe um e-mail válido.";
    }

    if (!message.trim()) nextErrors.message = "Digite sua mensagem.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setFeedback(null);
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContactMessage({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        source: "contato-page",
      });

      setFeedback("Mensagem enviada com sucesso. Obrigada pelo contato!");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setFeedback(
        "Não foi possível enviar agora. Tente novamente em alguns instantes.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary-dark)] font-[var(--font-body)]">
      <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 sm:px-8 lg:grid-cols-[0.9fr_0.95fr] lg:px-10">
        <section className="max-w-xl -translate-y-6 lg:-translate-y-10">
          <h1 className="max-w-lg font-[var(--font-body)] text-5xl font-medium leading-[1.08] tracking-tight text-[var(--color-text-light)] sm:text-5xl">
            Entre em contato
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-[var(--color-text-light)]">
            Dúvidas, parcerias ou sugestões? Entre em contato por um dos canais
            abaixo ou envie uma mensagem pelo formulário.
          </p>

          <div className="mt-8">
            <p className="mb-4 text-sm leading-7 text-[var(--color-text-light)]">
              Acesse nossas redes!
            </p>

            <div className="flex items-center gap-3">
              <SocialLink
                href="https://www.linkedin.com/in/mulheresquecodam?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                label="LinkedIn"
                icon={<Linkedin size={17} />}
              />

              <SocialLink
                href="https://www.instagram.com/mulheresquecodam.oficial?igsh=ZDNzOXo4ODl6OGk3"
                label="Instagram"
                icon={<Instagram size={17} />}
              />

              <SocialLink
                href="mailto:mulheresquecodam@gmail.com"
                label="E-mail"
                icon={<Mail size={17} />}
              />

              <SocialLink
                href="https://x.com/mulheresqcodam"
                label="X"
                icon={
                  <span className="font-[var(--font-body)] text-sm font-semibold">
                    X
                  </span>
                }
              />
            </div>
          </div>
        </section>

        <section className="w-full max-w-md justify-self-end rounded-[1.75rem] bg-[var(--color-white)] p-6 shadow-[0_22px_70px_rgba(15,0,161,0.12)] sm:p-7 lg:p-8">
          <h2 className="font-[var(--font-body)] text-2xl font-medium tracking-tight text-[var(--color-text)]">
            Envie uma mensagem
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            Preencha os campos abaixo e retornaremos assim que possível.
          </p>

          <form
            className="mt-7 space-y-4"
            onSubmit={(event) => {
              void onSubmit(event);
            }}
            noValidate
          >
            <Field
              label="Nome"
              value={name}
              onChange={setName}
              error={errors.name}
              placeholder="Seu nome"
            />

            <Field
              label="E-mail"
              value={email}
              onChange={setEmail}
              error={errors.email}
              placeholder="voce@email.com"
              type="email"
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Mensagem
              </label>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Como podemos ajudar?"
                className="min-h-32 w-full resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-soft)] focus:border-[var(--color-border-strong)] focus:bg-[var(--color-white)] focus:ring-0"
              />

              {errors.message ? (
                <p className="mt-2 text-xs font-medium text-[var(--color-error)]">
                  {errors.message}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-[var(--color-white)] transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar mensagem"}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] leading-5 text-[var(--color-text-muted)]">
            Ao enviar esta mensagem, você concorda com nossos{" "}
            <a
              href="/termos"
              className="font-medium text-[var(--color-primary)] underline-offset-4 hover:underline"
            >
              Termos de uso
            </a>{" "}
            e nossa{" "}
            <a
              href="/privacidade"
              className="font-medium text-[var(--color-primary)] underline-offset-4 hover:underline"
            >
              Política de privacidade
            </a>
            .
          </p>

          {feedback ? (
            <p className="mt-4 rounded-2xl bg-[var(--color-primary-light)] px-4 py-3 text-sm font-medium text-[var(--color-primary)]">
              {feedback}
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function SocialLink(props: { href: string; label: string; icon: ReactNode }) {
  return (
    <a
      href={props.href}
      target={props.href.startsWith("mailto:") ? undefined : "_blank"}
      rel={props.href.startsWith("mailto:") ? undefined : "noreferrer"}
      aria-label={props.label}
      title={props.label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-primary)] shadow-sm transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)]"
    >
      {props.icon}
    </a>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: "text" | "email";
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
        {props.label}
      </label>

      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder={props.placeholder}
        className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-soft)] focus:border-[var(--color-border-strong)] focus:bg-[var(--color-white)] focus:ring-0"
      />

      {props.error ? (
        <p className="mt-2 text-xs font-medium text-[var(--color-error)]">
          {props.error}
        </p>
      ) : null}
    </div>
  );
}
