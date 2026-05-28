import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] bg-slate-50 flex items-center">
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-[12px] font-black tracking-[0.3em] uppercase text-slate-400">
          Erro 404
        </p>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mt-3">
          Página não encontrada
        </h1>
        <p className="mt-4 text-slate-600">
          O caminho acessado não existe nesta versão da plataforma.
        </p>
        <Link
          to="/"
          className="inline-flex mt-8 rounded-xl bg-[#002B99] hover:bg-blue-800 text-white font-black px-6 py-3 text-sm uppercase tracking-wider"
        >
          Voltar para início
        </Link>
      </main>
    </div>
  );
}
