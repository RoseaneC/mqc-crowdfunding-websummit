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
      nextErrors.email = "Informe um e-mail valido.";
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
        "Nao foi possivel enviar agora. Tente novamente ou use o e-mail direto abaixo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-sm">
          <p className="text-[11px] font-black tracking-[0.25em] uppercase text-blue-700">
            Contato
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mt-3 text-slate-900">
            Fale com a Mulheres Que Codam
          </h1>
          <p className="mt-4 text-slate-600">
            Duvudas, parcerias ou sugestoes? Entre em contato por um dos canais
            abaixo.
          </p>

          <div className="mt-8 space-y-4">
            <ContactLink
              href="mailto:contato@mulheresquecodam.org"
              label="contato@mulheresquecodam.org"
              icon={<Mail size={18} />}
            />
            <ContactLink
              href="https://www.instagram.com/mulheresquecodam.oficial?igsh=ZDNzOXo4ODl6OGk3"
              label="@mulheresquecodam.oficial"
              icon={<Instagram size={18} />}
              external
            />
            <ContactLink
              href="https://www.linkedin.com/in/mulheresquecodam?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              label="LinkedIn / mulheresquecodam"
              icon={<Linkedin size={18} />}
              external
            />
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-sm">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Envie uma mensagem
          </h2>
          <form
            className="mt-6 space-y-4"
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
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Mensagem
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 min-h-36 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Escreva sua mensagem"
              />
              {errors.message ? (
                <p className="mt-1 text-xs font-semibold text-rose-600">
                  {errors.message}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-xl bg-[#002B99] hover:bg-blue-800 text-white font-black px-6 py-3 text-sm uppercase tracking-wider"
            >
              {isSubmitting ? "Enviando..." : "Enviar"}
            </button>
          </form>
          {feedback ? (
            <p className="mt-4 text-sm font-semibold text-emerald-700">
              {feedback}
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function ContactLink(props: {
  href: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={props.href}
      target={props.external ? "_blank" : undefined}
      rel={props.external ? "noreferrer" : undefined}
      className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50 transition"
    >
      <span className="text-blue-700">{props.icon}</span>
      <span className="text-sm font-semibold text-slate-800">
        {props.label}
      </span>
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
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {props.label}
      </label>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder={props.placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      {props.error ? (
        <p className="mt-1 text-xs font-semibold text-rose-600">
          {props.error}
        </p>
      ) : null}
    </div>
  );
}
