import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { usePrivyWalletAbstraction } from "../../hooks/usePrivyWalletAbstraction";

type NavItem = {
  label: string;
  href: string;
};

type ThemeMode = "light" | "dark";

const WALLET_PENDING_TIMEOUT_MS = 12000;
const THEME_STORAGE_KEY = "ponteia-theme";

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark";
}

function readPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (isThemeMode(storedTheme)) {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function Navbar() {
  const location = useLocation();
  const privyWallet = usePrivyWalletAbstraction();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletActionPending, setWalletActionPending] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => readPreferredTheme());

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Projetos", href: "/projetos" },
      { label: "Sobre nós", href: "/#sobreNos" },
      { label: "Parceiros", href: "/#parceiros" },
      { label: "Contato", href: "/contato" },
      { label: "Transparência", href: "/transparencia" },
    ],
    [],
  );

  const isPageActive = (path: string) => location.pathname === path;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!location.hash) return;

    const targetId = decodeURIComponent(location.hash.slice(1));
    const scrollToTarget = window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);

    return () => window.clearTimeout(scrollToTarget);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

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
  const nextTheme = theme === "dark" ? "light" : "dark";
  const themeAriaLabel = "Alternar tema claro e escuro";

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

  const handleToggleTheme = () => {
    setTheme(nextTheme);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[var(--color-primary-dark)] py-3 font-[var(--font-body)] text-[#f8f3ea] shadow-[0_12px_34px_rgba(7,21,14,0.16)]">
      <div className="mx-auto grid max-w-[92rem] grid-cols-[auto_1fr_auto] items-center gap-6 px-6 lg:px-10">
        <Link
          to="/"
          className="group inline-flex min-w-fit items-center"
          aria-label="Voltar para a Home"
        >
          <span className="hidden flex-col leading-none lg:flex">
            <span className="font-[var(--font-heading)] text-lg font-black uppercase tracking-[0.08em] text-[#f8f3ea]">
              Ponteia
            </span>
            <span className="mt-1 font-[var(--font-heading)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d89a4b]">
              Impacto com transparencia
            </span>
          </span>

          <span className="flex items-center lg:hidden">
            <span className="font-[var(--font-heading)] text-2xl font-black uppercase text-[#f8f3ea]">
              Ponte<span className="text-[#d89a4b]">ia</span>
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
                    ? "text-[#d89a4b]"
                    : "text-[#f8f3ea]/78 hover:text-[#d89a4b]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden min-w-fit items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={handleToggleTheme}
            aria-label={themeAriaLabel}
            title={theme === "dark" ? "Tema escuro" : "Tema claro"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-[#f8f3ea] transition hover:border-[#d89a4b] hover:bg-white/10 hover:text-[#d89a4b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d89a4b]"
          >
            <ThemeIcon theme={theme} />
          </button>

          {!hasConnectedWallet ? (
            <button
              type="button"
              onClick={() => void handleConnect()}
              disabled={isWalletButtonDisabled}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/15 bg-transparent px-5 py-2 text-sm font-medium text-[#f8f3ea] transition hover:border-[#d89a4b] hover:bg-white/10 disabled:opacity-60"
            >
              {connectWalletLabel}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                <span className="flex flex-col leading-tight">
                  <span className="text-[10px] font-semibold text-[#f8f3ea]/65">
                    {privyWalletStatusLabel}
                  </span>
                  <span className="text-xs font-bold text-[#f8f3ea]">
                    {connectedWalletLabel}
                  </span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => void handleDisconnect()}
                className="text-xs text-[#f8f3ea]/65 underline transition hover:text-[#d89a4b]"
              >
                Sair
              </button>
            </div>
          )}

          <Link
            to="/projetos"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#d89a4b] px-5 py-2 text-sm font-semibold text-[#07150e] transition hover:bg-[#f0b969]"
          >
            Conhecer projetos
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="justify-self-end p-2 text-[#f8f3ea] lg:hidden"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-white/10 bg-[var(--color-primary-dark)] transition-all duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-6 px-6 py-8">
          <button
            type="button"
            onClick={handleToggleTheme}
            aria-label={themeAriaLabel}
            title={theme === "dark" ? "Tema escuro" : "Tema claro"}
            className="inline-flex h-11 w-11 items-center justify-center self-start rounded-full border border-white/15 text-[#f8f3ea] transition hover:border-[#d89a4b] hover:bg-white/10 hover:text-[#d89a4b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d89a4b]"
          >
            <ThemeIcon theme={theme} />
          </button>

          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`border-b border-white/10 pb-2 text-lg font-bold transition-colors ${
                isPageActive(item.href)
                  ? "text-[#d89a4b]"
                  : "text-[#f8f3ea] hover:text-[#d89a4b]"
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
              className="w-full rounded-full border border-white/25 py-4 font-semibold text-[#f8f3ea] transition hover:border-[#d89a4b] hover:bg-white/10 disabled:opacity-60"
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
                className="w-full rounded-full border border-white/20 py-4 font-semibold text-[#f8f3ea] transition hover:bg-white/10 disabled:opacity-60"
              >
                {disconnectWalletLabel}
              </button>
            </div>
          )}

          <Link
            to="/projetos"
            className="inline-flex w-full items-center justify-center rounded-full bg-[#d89a4b] py-4 font-semibold text-[#07150e] transition hover:bg-[#f0b969]"
          >
            Conhecer projetos
          </Link>
        </div>
      </div>
    </nav>
  );
}

function ThemeIcon(props: { theme: ThemeMode }) {
  if (props.theme === "dark") {
    return (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.75v2.1M12 19.15v2.1M4.85 4.85l1.48 1.48M17.67 17.67l1.48 1.48M2.75 12h2.1M19.15 12h2.1M4.85 19.15l1.48-1.48M17.67 6.33l1.48-1.48" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M20.25 14.25A8.25 8.25 0 0 1 9.75 3.75a8.25 8.25 0 1 0 10.5 10.5Z" />
    </svg>
  );
}
