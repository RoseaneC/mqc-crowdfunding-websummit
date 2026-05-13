import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
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
      { label: "Sobre nós", href: "/#sobreNos" },
      { label: "Projetos", href: "/projetos" },
      { label: "Parceiros", href: "#" },
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
    <nav className="z-50 bg-[var(--color-primary)] py-3 font-[var(--font-body)]">
      <div className="relative mx-auto flex max-w-[92rem] items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link
          to="/"
          className="group inline-flex items-center"
          aria-label="Voltar para a Home"
        >
          <div className="hidden lg:block">
            <Image
              src={LogoImg}
              alt="Mulheres Que Codam"
              width={180}
              height={50}
              className="h-9 w-auto origin-left scale-[3] object-contain"
              priority
            />
          </div>

          <div className="flex items-center lg:hidden">
            <span className="font-[var(--font-heading)] text-2xl font-black uppercase tracking-tighter text-[var(--color-white)]">
              MQ<span className="text-[var(--color-accent)]">C</span>
            </span>
          </div>
        </Link>

        {/* Menu centralizado */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 lg:flex">
          <div className="flex items-center gap-10">
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
        </div>

        {/* Ações desktop */}
        <div className="hidden items-center gap-3 lg:flex">
          {!address ? (
            <button
              type="button"
              onClick={() => void handleConnect()}
              disabled={walletActionPending}
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-transparent px-5 py-2 text-sm font-medium text-[var(--color-white)] transition hover:border-[var(--color-accent)] hover:bg-white/10 disabled:opacity-60"
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

          <Link
            to="/contato"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-white)] px-5 py-2 text-sm font-semibold text-[var(--color-black)] transition hover:bg-[var(--color-accent)]"
          >
            Faça parte
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="justify-self-end p-2 text-[var(--color-white)] lg:hidden"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden bg-[var(--color-primary-dark)] transition-all duration-300 ease-in-out lg:hidden ${
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
              className="w-full rounded-full border border-white/25 py-4 font-semibold text-[var(--color-white)] transition hover:border-[var(--color-accent)] hover:bg-white/10 disabled:opacity-60"
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
              className="w-full rounded-full border border-white/20 py-4 font-semibold text-[var(--color-white)] transition hover:bg-white/10 disabled:opacity-60"
            >
              Sair da carteira
            </button>
          )}

          <Link
            to="/contato"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-white)] py-4 font-semibold text-[var(--color-black)] transition hover:bg-[var(--color-accent)]"
          >
            Faça parte
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
