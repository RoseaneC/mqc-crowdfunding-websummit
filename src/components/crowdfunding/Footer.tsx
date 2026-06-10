"use client";

import { useState, type FormEvent } from "react";
import { Twitter, Instagram, Linkedin, Mail } from "lucide-react";

type NewsletterResponse = {
  ok?: boolean;
  sent?: boolean;
  demo?: boolean;
  message?: string;
  error?: string;
};

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "loading" | "success" | "demo" | "error"
  >("idle");
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(
    null,
  );

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = newsletterEmail.trim();
    if (!email) {
      setNewsletterStatus("error");
      setNewsletterMessage("Informe um e-mail válido.");
      return;
    }

    setNewsletterStatus("loading");
    setNewsletterMessage(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as NewsletterResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.error || data.message || "Cadastro inválido.");
      }

      setNewsletterEmail("");
      setNewsletterStatus(data.demo ? "demo" : "success");
      setNewsletterMessage(
        data.demo
          ? "Recebemos seu e-mail para a demonstração."
          : "Cadastro realizado com sucesso!",
      );
    } catch (error) {
      setNewsletterStatus("error");
      setNewsletterMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar seu cadastro agora.",
      );
    }
  };

  return (
    <footer
      style={{ backgroundColor: "#1D1E27" }}
      aria-labelledby="footer-label"
    >
      <h2 id="footer-label" className="sr-only">
        Rodapé
      </h2>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-start gap-3 mb-4">
              {/* Logo textual igual navbar */}
              <div className="flex flex-col leading-none">
                <span className="font-display font-black uppercase tracking-tight text-white text-lg leading-none">
                  Mulheres
                </span>

                <span className="-mt-1 font-display font-black uppercase tracking-tight text-white text-sm sm:text-base leading-none">
                  <span className="inline-flex items-baseline gap-1 sm:gap-1.5">
                    <span>Que</span>
                    <span className="text-accent">Codam</span>
                  </span>
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Juntas programando o futuro. Transformando vidas através da
              educação em tecnologia.
            </p>
            <div className="flex items-center gap-3">
              {[
                {
                  Icon: Instagram,
                  label: "Instagram",
                  href: "https://www.instagram.com/mulheresquecodam.oficial?igsh=ZDNzOXo4ODl6OGk3",
                },
                {
                  Icon: Linkedin,
                  label: "LinkedIn",
                  href: "https://www.linkedin.com/in/mulheresquecodam?utm_source=share_via&utm_content=profile&utm_medium=member_android",
                },
                {
                  Icon: Twitter,
                  label: "X (Twitter)",
                  href: "https://x.com/mulheresqcodam",
                },
                {
                  Icon: Mail,
                  label: "E-mail",
                  href: "mailto:mulheresquecodam@gmail.com",
                },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  aria-label={label}
                  className="
                    w-9 h-9 rounded-lg flex items-center justify-center
                    text-gray-400 hover:text-white hover:bg-white/10
                    transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                  "
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5">
              Plataforma
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/projetos"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Projetos ativos
                </a>
              </li>

              <li>
                <a
                  href="/#sobreNos"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Como funciona
                </a>
              </li>

              <li>
                <a
                  href="/transparencia"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Transparência
                </a>
              </li>

              <li>
                <a
                  href="/contato"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Contato
                </a>
              </li>

              <li>
                <a
                  href="/admin"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Admin demo
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-white">
              Legal
            </h3>

            <ul className="space-y-3">
              {[
                { label: "Termos de Uso", href: "/termos" },
                { label: "Política de Privacidade", href: "/privacidade" },
                { label: "Política de Cookies", href: "/cookies" },
                { label: "FAQ", href: "/#faq" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-gray-400 transition hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5">
              Newsletter
            </h3>

            <p className="text-gray-400 text-xs mb-3">
              Receba atualizações de impacto:
            </p>

            <form
              className="flex"
              onSubmit={(event) => {
                void handleNewsletterSubmit(event);
              }}
            >
              <input
                type="email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder="seu@email.com"
                aria-label="E-mail para newsletter"
                className="flex-1 bg-white/10  rounded-l-lg px-3 py-2 text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={newsletterStatus === "loading"}
                className="px-3 py-2 rounded-r-lg text-white text-xs font-bold bg-[var(--color-accent)] hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              >
                {newsletterStatus === "loading" ? "..." : "OK"}
              </button>
            </form>

            {newsletterMessage ? (
              <p
                className={`mt-2 text-xs leading-5 ${
                  newsletterStatus === "error"
                    ? "text-red-300"
                    : newsletterStatus === "demo"
                      ? "text-blue-200"
                      : "text-green-300"
                }`}
              >
                {newsletterMessage}
              </p>
            ) : null}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © 2026 Mulheres que Codam. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Plataforma online
            </span>
            <span>Com tecnologia Stellar</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
