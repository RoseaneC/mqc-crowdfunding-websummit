import { Instagram, Linkedin, Mail, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{ backgroundColor: "var(--color-primary-dark)" }}
      aria-labelledby="footer-label"
    >
      <h2 id="footer-label" className="sr-only">
        Rodape
      </h2>

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex flex-col leading-none">
                <span className="font-display text-lg font-black uppercase leading-none tracking-tight text-white">
                  Ponteia
                </span>
                <span className="mt-1 font-display text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
                  Impacto com transparencia
                </span>
              </div>
            </div>

            <p className="mb-6 max-w-xs text-sm leading-relaxed text-gray-300">
              Conectando recursos a projetos de impacto com apoio via PIX,
              moedas digitais estaveis e prestacao de contas.
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
                  className="flex h-9 w-9 items-center justify-center rounded-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-white">
              Plataforma
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Projetos ativos", href: "/projetos" },
                { label: "Como funciona", href: "/#como-funciona" },
                { label: "Transparencia", href: "/transparencia" },
                { label: "Contato", href: "/contato" },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-gray-300 transition hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-white">
              Legal
            </h3>

            <ul className="space-y-3">
              {[
                { label: "Termos de Uso", href: "/termos" },
                { label: "Politica de Privacidade", href: "/privacidade" },
                { label: "Politica de Cookies", href: "/cookies" },
                { label: "FAQ", href: "/#faq" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-gray-300 transition hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-white">
              Newsletter
            </h3>

            <p className="mb-3 text-xs text-gray-300">
              Receba atualizacoes de impacto:
            </p>

            <div className="flex">
              <input
                type="email"
                placeholder="seu@email.com"
                className="flex-1 rounded-l-sm bg-white/10 px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <button className="rounded-r-sm bg-[var(--color-accent)] px-3 py-2 text-xs font-bold text-[var(--color-black)] transition-opacity hover:opacity-90">
                OK
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            © 2026 Ponteia. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
              Plataforma online
            </span>
            <span>Celo, USDGLO e PIX</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
