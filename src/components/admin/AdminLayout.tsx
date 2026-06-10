import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../providers/AuthProvider";

const ADMIN_DEMO_NOTICE =
  "Ambiente de demonstração: ações administrativas simuladas até conexão com banco de dados de produção.";

export default function AdminLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const isDemoAdmin = !user;

  const navItems = [
    { name: "Visão Geral", path: "/admin", icon: "dashboard" },
    {
      name: "Aprovação de Projetos",
      path: "/admin/projetos",
      icon: "folder_open",
    },
    {
      name: "Conformidade MROSC",
      path: "/admin/mrosc",
      icon: "assignment_turned_in",
    },
    {
      name: "Relatórios e Analítico",
      path: "/admin/relatorios",
      icon: "bar_chart",
    },
  ];
  const visibleNavItems =
    isDemoAdmin || hasRole("SUPERADMIN")
      ? navItems
      : navItems.filter((item) =>
          ["/admin", "/admin/projetos"].includes(item.path),
        );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Barra Lateral Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-10">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#002B99] rounded text-white flex items-center justify-center font-black">
              {"</>"}
            </div>
            <span className="font-bold text-[#002B99] text-sm uppercase tracking-wide">
              Admin MQC
            </span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${isActive ? "bg-blue-50 text-[#002B99]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <span className="material-icons text-[20px]">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium text-sm"
          >
            <span className="material-icons text-[20px]">logout</span>
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Fundo escuro mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* Menu Mobile */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform lg:hidden ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <span className="font-bold text-[#002B99]">Admin MQC</span>
          <button onClick={() => setMenuOpen(false)}>
            <span className="material-icons text-slate-600">close</span>
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {visibleNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm ${location.pathname === item.path ? "bg-blue-50 text-[#002B99]" : "text-slate-500"}`}
            >
              <span className="material-icons text-[20px]">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 space-y-2">
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium text-sm"
          >
            <span className="material-icons text-[20px]">logout</span>
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-x-hidden">
        {/* Cabeçalho Superior */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-slate-500"
              onClick={() => setMenuOpen(true)}
            >
              <span className="material-icons">menu</span>
            </button>
            <p className="hidden sm:block text-sm font-semibold text-slate-500">
              Painel Administrativo
            </p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-slate-200 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                {(user?.name ?? "A")
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0] ?? "")
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900 leading-none">
                  {user?.name ?? "Admin"}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                  {isDemoAdmin
                    ? "Admin demo"
                    : hasRole("SUPERADMIN")
                      ? "Super Admin"
                      : "Usuária"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Dinâmico */}
        <div className="p-4 sm:p-8 flex-1">
          {isDemoAdmin ? (
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-semibold leading-6 text-blue-900">
              {ADMIN_DEMO_NOTICE}
            </div>
          ) : null}

          <Outlet />
        </div>
      </main>
    </div>
  );
}
