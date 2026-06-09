import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { usePrivyWalletAbstraction } from "../../hooks/usePrivyWalletAbstraction";
import { connectWallet, disconnectWallet } from "../../util/wallet";

type NavItem = {
  label: string;
  href: string;
};

const WALLET_PENDING_TIMEOUT_MS = 12000;

export default function Navbar() {
  const location = useLocation();
  const { address } = useWallet();
  const privyWallet = usePrivyWalletAbstraction();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletActionPending, setWalletActionPending] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Sobre nós", href: "/#sobreNos" },
      { label: "Projetos", href: "/projetos" },
      { label: "Parceiros", href: "/#parceiros" },
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
  const usesPrivyWallet = privyWallet.isUsingPrivy;
  const hasConnectedWallet = usesPrivyWallet
    ? privyWallet.authenticated
    : Boolean(address);
  const connectedWalletLabel = usesPrivyWallet
    ? (privyWallet.shortWalletAddress ?? "Conta conectada")
    : shortAddress;
  const isWalletButtonDisabled =
    walletActionPending || (usesPrivyWallet && !privyWallet.ready);
  const connectWalletLabel = usesPrivyWallet
    ? walletActionPending
      ? "Abrindo..."
      : "Entrar / Conectar carteira"
    : walletActionPending
      ? "Conectando..."
      : "Conectar carteira";
  const disconnectWalletLabel = usesPrivyWallet
    ? "Sair da conta"
    : "Sair da carteira";

  const handleConnect = async () => {
    if (walletActionPending) return;

    setWalletActionPending(true);
    const timeout = window.setTimeout(() => {
      setWalletActionPending(false);
    }, WALLET_PENDING_TIMEOUT_MS);

    try {
      if (usesPrivyWallet) {
        await Promise.resolve(privyWallet.login());
      } else {
        await connectWallet();
      }
    } finally {
      window.clearTimeout(timeout);
      setTimeout(() => setWalletActionPending(false), 400);
    }
  };

  const handleDisconnect = async () => {
    if (walletActionPending) return;

    setWalletActionPending(true);
    const timeout = window.setTimeout(() => {
      setWalletActionPending(false);
    }, WALLET_PENDING_TIMEOUT_MS);

    try {
      if (usesPrivyWallet) {
        await Promise.resolve(privyWallet.logout());
      } else {
        await disconnectWallet();
      }
    } finally {
      window.clearTimeout(timeout);
      setWalletActionPending(false);
    }
  };

  return (
    <nav className="z-50 bg-[var(--color-primary)] py-3 font-[var(--font-body)]">
      <div className="mx-auto grid max-w-[92rem] grid-cols-[auto_1fr_auto] items-center gap-6 px-6 lg:px-10">
        {/* Logo */}
        <Link
          to="/"
          className="group inline-flex min-w-fit items-center"
          aria-label="Voltar para a Home"
        >
          <span className="hidden flex-col leading-none lg:flex">
            <span className="font-[var(--font-heading)] text-sm font-black uppercase tracking-[0.08em] text-[var(--color-white)]">
              Mulheres
            </span>
            <span className="font-[var(--font-heading)] text-lg font-black uppercase tracking-[0.04em] text-[var(--color-white)]">
              Que <span className="text-[var(--color-accent)]">Codam</span>
            </span>
          </span>

          <span className="flex items-center lg:hidden">
            <span className="font-[var(--font-heading)] text-2xl font-black uppercase text-[var(--color-white)]">
              MQ<span className="text-[var(--color-accent)]">C</span>
            </span>
          </span>
        </Link>

        {/* Menu centralizado */}
        <div className="hidden justify-center lg:flex">
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
        <div className="hidden min-w-fit items-center gap-3 lg:flex">
          {!hasConnectedWallet ? (
            <button
              type="button"
              onClick={() => void handleConnect()}
              disabled={isWalletButtonDisabled}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/25 bg-transparent px-5 py-2 text-sm font-medium text-[var(--color-white)] transition hover:border-[var(--color-accent)] hover:bg-white/10 disabled:opacity-60"
            >
              {connectWalletLabel}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                <span className="text-xs font-bold text-[var(--color-white)]">
                  {connectedWalletLabel}
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
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--color-white)] px-5 py-2 text-sm font-semibold text-[var(--color-black)] transition hover:bg-[var(--color-accent)]"
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

          {!hasConnectedWallet ? (
            <button
              type="button"
              onClick={() => void handleConnect()}
              disabled={isWalletButtonDisabled}
              className="w-full rounded-full border border-white/25 py-4 font-semibold text-[var(--color-white)] transition hover:border-[var(--color-accent)] hover:bg-white/10 disabled:opacity-60"
            >
              {connectWalletLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleDisconnect()}
              disabled={walletActionPending}
              className="w-full rounded-full border border-white/20 py-4 font-semibold text-[var(--color-white)] transition hover:bg-white/10 disabled:opacity-60"
            >
              {disconnectWalletLabel}
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
