import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listProjectMedia,
  listProjects,
  type ProjectDTO,
  type ProjectMediaItemDTO,
} from "../../util/crowdfundingApi";

function percent(raised: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((raised / target) * 100));
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [media, setMedia] = useState<ProjectMediaItemDTO[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([listProjects(), listProjectMedia()])
      .then(([projectsRes, mediaRes]) => {
        setProjects(projectsRes);
        setMedia(mediaRes);
        setError(null);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Falha ao carregar projetos";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  const mediaById = useMemo(() => {
    return new Map(media.map((item) => [item.id, item]));
  }, [media]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return projects;
    return projects.filter((project) => {
      return (
        project.title.toLowerCase().includes(normalized) ||
        project.description.toLowerCase().includes(normalized) ||
        project.taxCategory.toLowerCase().includes(normalized)
      );
    });
  }, [projects, query]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200">
      <header className="relative bg-[#002B99] overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-orange-500 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-yellow-400 rounded-full opacity-20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-4 leading-none uppercase">
            Decodificando o sistema,
            <br />
            <span className="text-yellow-400">construindo o futuro.</span>
          </h1>
          <p className="text-lg text-blue-100 font-medium opacity-90 uppercase tracking-widest leading-relaxed max-w-3xl">
            Apoie projetos que empoderam mulheres de comunidades perifericas atraves da educacao tecnologica.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <input
            className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#002B99] font-bold text-sm"
            placeholder="Buscar projetos, tags..."
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-10 uppercase tracking-tighter">
          Projetos Aprovados
        </h2>

        {loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-sm font-bold text-slate-500">
            Carregando projetos...
          </div>
        ) : error ? (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-8">
            <p className="text-rose-700 dark:text-rose-300 text-sm font-bold">
              Nao foi possivel carregar os projetos.
            </p>
            <p className="text-rose-600 dark:text-rose-400 text-xs mt-2 break-all">
              {error}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-sm font-bold text-slate-500">
            Nenhum projeto encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((project) => {
            const meta = mediaById.get(String(project.id));
            const progress = percent(Number(project.raisedXlm), Number(project.targetXlm));
            const accent = progress >= 70 ? "bg-[#002B99]" : "bg-orange-500";
            return (
              <div
                key={project.id}
                className="group bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
              >
                <div className="h-52 bg-slate-200 relative overflow-hidden">
                  <img
                    alt={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    src={meta?.img ?? "/images/projetos/mqc-ideathon.jpeg"}
                  />
                </div>
                <div className="p-7 flex-1 flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg w-fit">
                    {project.taxCategory}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-4 mb-3 tracking-tight leading-none uppercase">
                    {project.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium leading-relaxed flex-1">
                    {project.description}
                  </p>
                  <div className="mb-6 space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Arrecadado
                        </span>
                        <span className="font-black text-slate-900 dark:text-white">
                          {Number(project.raisedXlm).toLocaleString("pt-BR")} XLM
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        {progress}% da Meta
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`${accent} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    to={`/contribuir?projeto=${project.id}&nome=${encodeURIComponent(project.title)}`}
                    className="bg-[#002B99] hover:bg-blue-800 text-white font-black py-4 px-6 rounded-2xl transition-all w-full text-center block text-[10px] uppercase tracking-[0.2em]"
                  >
                    Apoiar Projeto
                  </Link>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </main>
    </div>
  );
}
