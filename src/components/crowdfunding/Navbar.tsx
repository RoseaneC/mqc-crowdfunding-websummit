import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { connectWallet, disconnectWallet } from "../../util/wallet";

import Image from "next/image";
import LogoImg from "../../images/home-page/logo1_mqc.png";

type NavItem = {
  label: string;
  href: string;
};

export default function Navbar() {
  const location = useLocation();
  const { address, isPending } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletActionPending, setWalletActionPending] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Sobre nós", href: "/dashboard" },
      { label: "Projetos", href: "/projetos" },
      { label: "Parceiros", href: "/transparencia" },
      { label: "Contato", href: "/contato" },
    ],
    [],
  );

  const isPageActive = (path: string) => location.pathname === path;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  const handleConnect = async () => {
    setWalletActionPending(true);

    try {
      await connectWallet();
    } finally {
      setTimeout(() => setWalletActionPending(false), 400);
    }
  };

  const handleDisconnect = async () => {
    setWalletActionPending(true);

    try {
      await disconnectWallet();
    } finally {
      setWalletActionPending(false);
    }
  };

  return (
    <nav className="z-50 bg-[var(--color-primary)] py-2 overflow-visible font-[var(--font-body)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo Container */}
        <Link
          to="/"
          className="group inline-flex items-center"
          aria-label="Voltar para a Home"
        >
          {/* Logo Imagem: Desktop */}
          <div className="hidden lg:block">
            <Image
              src={LogoImg}
              alt="Mulheres Que Codam"
              width={180}
              height={50}
              className="h-12 w-auto object-contain scale-[1.8] origin-left"
              priority
            />
          </div>

          {/* Logo Sigla: Mobile */}
          <div className="lg:hidden flex items-center">
            <span className="font-[var(--font-heading)] font-black uppercase tracking-tighter text-[var(--color-white)] text-2xl">
              MQ<span className="text-[var(--color-accent)]">C</span>
            </span>
          </div>
        </Link>

        {/* Menu e Wallet */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  isPageActive(item.href)
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-white)] hover:text-[var(--color-accent)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            {!address ? (
              <button
                type="button"
                onClick={() => void handleConnect()}
                disabled={walletActionPending}
                className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-6 py-2 text-sm font-semibold text-[var(--color-white)] transition hover:bg-[var(--color-accent-dark)] disabled:opacity-60"
              >
                {walletActionPending || isPending
                  ? "Conectando..."
                  : "Conectar carteira"}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                  <span className="text-xs font-bold text-[var(--color-white)]">
                    {shortAddress}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDisconnect()}
                  className="text-xs text-white/70 underline transition hover:text-[var(--color-white)]"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden p-2 text-[var(--color-white)]"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden bg-[var(--color-primary-dark)] transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-6 px-6 py-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`border-b border-white/10 pb-2 text-lg font-bold transition-colors ${
                isPageActive(item.href)
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-white)] hover:text-[var(--color-accent)]"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {!address ? (
            <button
              type="button"
              onClick={() => void handleConnect()}
              disabled={walletActionPending}
              className="w-full rounded-lg bg-[var(--color-accent)] py-4 font-semibold text-[var(--color-white)] transition hover:bg-[var(--color-accent-dark)] disabled:opacity-60"
            >
              {walletActionPending || isPending
                ? "Conectando..."
                : "Conectar carteira"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleDisconnect()}
              disabled={walletActionPending}
              className="w-full rounded-lg border border-white/20 py-4 font-semibold text-[var(--color-white)] transition hover:bg-white/10 disabled:opacity-60"
            >
              Sair da carteira
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
