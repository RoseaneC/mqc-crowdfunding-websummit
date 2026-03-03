import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../providers/ThemeProvider";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { connectWallet, disconnectWallet } from "../../util/wallet";

type NavItem = {
  label: string;
  href: string;
};

export default function Navbar() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { address, balances, network, isPending } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletActionPending, setWalletActionPending] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Sobre nós", href: "/dashboard" },
      { label: "Projetos", href: "/projetos" },
      { label: "Parceiros", href: "/transparencia" },
      { label: "Contato", href: "/contato" },
    ],
    []
  );

  const isPageActive = (path: string) => location.pathname === path;

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = theme === "dark";
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;
  const xlmBalance = balances?.xlm?.balance ?? "-";

  const handleConnect = async () => {
    setWalletActionPending(true);
    try {
      await connectWallet();
    } finally {
      // Keep a short delay so users can see transition feedback.
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
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur dark:bg-slate-950/55">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-1 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="group inline-flex items-center gap-3"
          aria-label="Voltar para a Home"
        >
          <div className="flex flex-col leading-none">
            {/* Linha 1 */}
            <span className="font-display font-black uppercase tracking-tight text-primary dark:text-white text-lg leading-none">
              Mulheres
            </span>

            {/* Linha 2: QUE + CODAM juntos */}
            <span className="-mt-1 font-display font-black uppercase tracking-tight text-primary dark:text-white text-sm sm:text-base leading-none">
              <span className="inline-flex items-baseline gap-1 sm:gap-1.5">
                <span>Que</span>
                <span className="text-accent">Codam</span>
              </span>
            </span>
          </div>
        </Link>

        {/* Links desktop */}
        <div className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => {
            const active = isPageActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={[
                  "text-sm font-semibold tracking-wide transition-colors",
                  "text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white",
                  active ? "text-primary dark:text-white" : "",
                ].join(" ")}
              >
                <span className="relative">
                  {item.label}
                  <span
                    className={[
                      "absolute -bottom-2 left-0 h-0.5 w-full rounded-full transition-opacity",
                      "bg-accent",
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-40",
                    ].join(" ")}
                    aria-hidden
                  />
                </span>
              </Link>
            );
          })}
        </div>

        {/* Ações (toggle + CTA + hamburger) */}
        <div className="flex items-center gap-3">
          {/* Wallet status desktop */}
          <div className="hidden md:flex items-center gap-2">
            {!address ? (
              <button
                type="button"
                onClick={() => void handleConnect()}
                disabled={walletActionPending}
                className="
                  inline-flex items-center justify-center rounded-xl px-4 py-2
                  text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700
                  disabled:opacity-60 transition
                "
              >
                {walletActionPending || isPending ? "Conectando..." : "Conectar Carteira"}
              </button>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/40">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {shortAddress}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {xlmBalance} XLM
                  </span>
                  {network ? (
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {network}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => void handleDisconnect()}
                  disabled={walletActionPending}
                  className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition disabled:opacity-60"
                >
                  Desconectar
                </button>
              </>
            )}
          </div>

          {/* CTA Faça parte */}
          <Link
            to="/dashboard"
            className="
              hidden sm:inline-flex items-center justify-center
              rounded-xl px-4 py-2
              text-sm font-semibold
              bg-primary text-white
              hover:brightness-110
              transition
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
            "
          >
            Faça parte
          </Link>

          {/* Toggle tema */}
          <button
            type="button"
            onClick={toggleTheme}
            className="
              inline-flex items-center justify-center
              rounded-xl p-2
              bg-slate-50 text-slate-600
              hover:bg-slate-100
              border border-slate-200
              transition
              dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:border-slate-800
              focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50
            "
            aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Hamburger (mobile) */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="
              lg:hidden inline-flex items-center justify-center
              rounded-xl p-2
              bg-slate-50 text-slate-700
              hover:bg-slate-100
              border border-slate-200
              transition
              dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:border-slate-800
              focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50
            "
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Menu mobile dropdown */}
      <div
        className={[
          "lg:hidden overflow-hidden border-t border-slate-200/70 dark:border-slate-800/70",
          mobileOpen ? "max-h-96" : "max-h-0",
          "transition-[max-height] duration-300 ease-in-out",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex flex-col gap-2">
          {!address ? (
            <button
              type="button"
              onClick={() => void handleConnect()}
              disabled={walletActionPending}
              className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition"
            >
              {walletActionPending || isPending ? "Conectando..." : "Conectar Carteira"}
            </button>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/40 space-y-2">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Carteira conectada: {shortAddress}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-200">
                Saldo: {xlmBalance} XLM
              </p>
              <button
                type="button"
                onClick={() => void handleDisconnect()}
                disabled={walletActionPending}
                className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition disabled:opacity-60"
              >
                Desconectar
              </button>
            </div>
          )}

          {/* CTA no mobile */}
          <Link
            to="/dashboard"
            className="
              inline-flex items-center justify-center
              rounded-xl px-4 py-3
              text-sm font-semibold
              bg-primary text-white
              hover:brightness-110 transition
            "
          >
            Faça parte
          </Link>

          {navItems.map((item) => {
            const active = isPageActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={[
                  "rounded-xl px-4 py-3 text-sm font-semibold transition",
                  "bg-slate-50 text-slate-700 hover:bg-slate-100",
                  "dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
                  active ? "ring-2 ring-accent/50" : "",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
