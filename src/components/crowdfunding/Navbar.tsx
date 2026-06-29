import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { usePrivyWalletAbstraction } from "../../hooks/usePrivyWalletAbstraction";

type NavItem = {
  label: string;
  href: string;
};

const WALLET_PENDING_TIMEOUT_MS = 12000;

export default function Navbar() {
  const location = useLocation();
  const privyWallet = usePrivyWalletAbstraction();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletActionPending, setWalletActionPending] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Projetos", href: "/projetos" },
      { label: "Transparencia", href: "/transparencia" },
      { label: "Como funciona", href: "/#como-funciona" },
      { label: "Sobre", href: "/#sobreNos" },
    ],
    [],
  );

  const isPageActive = (path: string) => location.pathname === path;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const usesPrivyWallet = privyWallet.isUsingPrivy;
  const hasConnectedWallet = privyWallet.authenticated;
  const privyWalletStatusLabel =
    privyWallet.activeWalletType === "evm"
      ? "Carteira EVM conectada"
      : "Conta conectada";
  const privyWalletAddressLabel =
    privyWallet.shortEvmAddress ?? "Conta conectada";
  const connectedWalletLabel = privyWalletAddressLabel;
  const isWalletButtonDisabled =
    walletActionPending || (usesPrivyWallet && !privyWallet.ready);
  const connectWalletLabel = usesPrivyWallet
    ? walletActionPending
      ? "Abrindo..."
      : "Entrar / Conectar carteira"
    : "Entrar / Conectar carteira";
  const disconnectWalletLabel = "Sair da conta";

  const handleConnect = async () => {
    if (walletActionPending) return;

    setWalletActionPending(true);
    const timeout = window.setTimeout(() => {
      setWalletActionPending(false);
    }, WALLET_PENDING_TIMEOUT_MS);

    try {
      if (usesPrivyWallet) {
        await Promise.resolve(privyWallet.login());
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
      }
    } finally {
      window.clearTimeout(timeout);
      setWalletActionPending(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[rgba(245,240,232,0.94)] py-3 font-[var(--font-body)] backdrop-blur">
      <div className="mx-auto grid max-w-[92rem] grid-cols-[auto_1fr_auto] items-center gap-6 px-6 lg:px-10">
        <Link
          to="/"
          className="group inline-flex min-w-fit items-center"
          aria-label="Voltar para a Home"
        >
          <span className="hidden flex-col leading-none lg:flex">
            <span className="font-[var(--font-heading)] text-lg font-black uppercase tracking-[0.08em] text-[var(--color-primary)]">
              Ponteia
            </span>
            <span className="mt-1 font-[var(--font-heading)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              Impacto com transparencia
            </span>
          </span>

          <span className="flex items-center lg:hidden">
            <span className="font-[var(--font-heading)] text-2xl font-black uppercase text-[var(--color-primary)]">
              Ponte<span className="text-[var(--color-accent)]">ia</span>
            </span>
          </span>
        </Link>

        <div className="hidden justify-center lg:flex">
          <div className="flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  isPageActive(item.href)
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden min-w-fit items-center gap-3 lg:flex">
          {!hasConnectedWallet ? (
            <button
              type="button"
              onClick={() => void handleConnect()}
              disabled={isWalletButtonDisabled}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[var(--color-border)] bg-transparent px-5 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] disabled:opacity-60"
            >
              {connectWalletLabel}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                <span className="flex flex-col leading-tight">
                  <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">
                    {privyWalletStatusLabel}
                  </span>
                  <span className="text-xs font-bold text-[var(--color-primary)]">
                    {connectedWalletLabel}
                  </span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => void handleDisconnect()}
                className="text-xs text-[var(--color-text-muted)] underline transition hover:text-[var(--color-primary)]"
              >
                Sair
              </button>
            </div>
          )}

          <Link
            to="/projetos"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-[var(--color-white)] transition hover:bg-[var(--color-primary-dark)]"
          >
            Conhecer projetos
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="justify-self-end p-2 text-[var(--color-primary)] lg:hidden"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-primary)] transition-all duration-300 ease-in-out lg:hidden ${
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
            <div className="space-y-3">
              <div className="rounded-sm border border-white/15 bg-white/10 px-4 py-3">
                <p className="text-xs font-semibold text-white/65">
                  {privyWalletStatusLabel}
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--color-white)]">
                  {connectedWalletLabel}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleDisconnect()}
                disabled={walletActionPending}
                className="w-full rounded-full border border-white/20 py-4 font-semibold text-[var(--color-white)] transition hover:bg-white/10 disabled:opacity-60"
              >
                {disconnectWalletLabel}
              </button>
            </div>
          )}

          <Link
            to="/projetos"
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-white)] py-4 font-semibold text-[var(--color-black)] transition hover:bg-[var(--color-accent-light)]"
          >
            Conhecer projetos
          </Link>
        </div>
      </div>
    </nav>
  );
}
