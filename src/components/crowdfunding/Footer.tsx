import { Link } from "react-router-dom";
import { Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#1D1E27" }} aria-labelledby="footer-label">
      <h2 id="footer-label" className="sr-only">Rodapé</h2>

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
              Juntas programando o futuro. Transformando vidas através da educação em tecnologia.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/mulheresquecodam.oficial?igsh=ZDNzOXo4ODl6OGk3" },
                { Icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/mulheresquecodam?utm_source=share_via&utm_content=profile&utm_medium=member_android" },
                { Icon: Twitter, label: "X (Twitter)", href: "https://x.com/SEU_PERFIL" },
                { Icon: Mail, label: "E-mail", href: "mailto:contato@mulheresquecodam.org" },
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
              <li><Link to="/projetos" className="text-gray-400 hover:text-white text-sm">Projetos Ativos</Link></li>
              <li><Link to="/#sobre" className="text-gray-400 hover:text-white text-sm">Como Funciona</Link></li>
              <li><Link to="/transparencia" className="text-gray-400 hover:text-white text-sm">Transparência</Link></li>
              <li><Link to="/contato" className="text-gray-400 hover:text-white text-sm">Contato</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5">
              Legal
            </h3>
            <ul className="space-y-3">
              {["Termos de Uso", "Política de Privacidade", "Política de Cookies", "FAQ"].map((label) => (
                <li key={label}>
                  <button className="text-gray-400 hover:text-white text-sm">
                    {label}
                  </button>
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

            <div className="flex">
              <input
                type="email"
                placeholder="seu@email.com"
                className="flex-1 bg-white/10 border border-white/20 rounded-l-lg px-3 py-2 text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-3 py-2 rounded-r-lg text-white text-xs font-bold bg-orange-500 hover:opacity-90 transition-opacity">
                OK
              </button>
            </div>
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
              Plataforma Online
            </span>
            <span>Powered by Stellar Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
