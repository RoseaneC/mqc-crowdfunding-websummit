import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../../providers/ThemeProvider";

export default function AdminLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navItems = [
    { name: "Visão Geral", path: "/admin", icon: "dashboard" },
    { name: "Aprovação de Projetos", path: "/admin/projetos", icon: "folder_open" },
    { name: "Conformidade MROSC", path: "/admin/mrosc", icon: "assignment_turned_in" },
    { name: "Relatórios e Analítico", path: "/admin/relatorios", icon: "bar_chart" },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex font-sans text-slate-900 dark:text-slate-100">

      {/* Barra Lateral Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed h-full z-10">
        <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#002B99] dark:bg-blue-600 rounded text-white flex items-center justify-center font-black">{"</>"}</div>
            <span className="font-bold text-[#002B99] dark:text-blue-400 text-sm uppercase tracking-wide">Admin MQC</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${isActive ? "bg-blue-50 dark:bg-blue-900/30 text-[#002B99] dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"}`}>
                <span className="material-icons text-[20px]">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium text-sm"
          >
            <span className="material-icons text-[20px]">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
            {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          </button>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium text-sm">
            <span className="material-icons text-[20px]">logout</span>
            Sair da conta
          </Link>
        </div>
      </aside>

      {/* Fundo escuro mobile */}
      {menuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setMenuOpen(false)}></div>
      )}

      {/* Menu Mobile */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 z-50 transform transition-transform lg:hidden ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
         <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-700">
          <span className="font-bold text-[#002B99] dark:text-blue-400">Admin MQC</span>
          <button onClick={() => setMenuOpen(false)}>
            <span className="material-icons text-slate-600 dark:text-slate-300">close</span>
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm ${location.pathname === item.path ? "bg-blue-50 dark:bg-blue-900/30 text-[#002B99] dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>
              <span className="material-icons text-[20px]">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium text-sm"
          >
            <span className="material-icons text-[20px]">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
            {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-x-hidden">
        {/* Cabeçalho Superior */}
        <header className="h-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-500 dark:text-slate-400" onClick={() => setMenuOpen(true)}>
              <span className="material-icons">menu</span>
            </button>
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 w-64 lg:w-96">
              <span className="material-icons text-slate-400 dark:text-slate-500 text-lg mr-2">search</span>
              <input type="text" placeholder="Buscar projetos, ONGs..." className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 relative">
              <span className="material-icons">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-slate-200 dark:border-slate-700 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">AS</div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">Ana Silva</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Dinâmico */}
        <div className="p-4 sm:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
