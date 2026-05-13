import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ProjectDTO } from "../../util/crowdfundingApi";

type ProjectsApiResponse =
  | ProjectDTO[]
  | {
      value?: ProjectDTO[];
      data?: ProjectDTO[];
      projects?: ProjectDTO[];
      items?: ProjectDTO[];
      Count?: number;
    };

function unwrapProjects(response: ProjectsApiResponse): ProjectDTO[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.value)) return response.value;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.projects)) return response.projects;
  if (Array.isArray(response.items)) return response.items;

  return [];
}

function percent(raised: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((raised / target) * 100));
}

function formatXlm(value: number | string) {
  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/projects", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(
            text || `Falha ao carregar projetos. Status: ${response.status}`,
          );
        }

        const data = (await response.json()) as ProjectsApiResponse;
        const unwrappedProjects = unwrapProjects(data);

        setProjects(unwrappedProjects);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Falha ao carregar projetos";

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadProjects();
  }, []);

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
    <div className="min-h-screen bg-[var(--color-surface)] font-[var(--font-body)] text-[var(--color-text)]">
      <header className="relative overflow-hidden bg-[var(--color-primary)]">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-[var(--color-accent)] opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-[var(--color-accent-light)] opacity-20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:text-left lg:px-8">
          <h1 className="mb-4 font-[var(--font-body)] text-4xl font-light leading-tight tracking-tight text-[var(--color-white)] sm:text-6xl">
            Decodificando o sistema,
            <br />
            <span className="text-[var(--color-accent)]">
              construindo o futuro.
            </span>
          </h1>

          <p className="max-w-3xl text-base font-normal leading-8 text-white/75 sm:text-lg">
            Apoie projetos que empoderam mulheres de comunidades periféricas
            através da educação tecnológica.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-[0_18px_50px_rgba(15,0,161,0.08)]">
          <input
            className="block w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-soft)] focus:border-[var(--color-primary)] focus:bg-[var(--color-white)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/10"
            placeholder="Buscar projetos, tags..."
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <h2 className="mb-10 font-[var(--font-body)] text-3xl font-medium tracking-tight text-[var(--color-text)]">
          Projetos aprovados
        </h2>

        {loading ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-8 text-sm font-medium text-[var(--color-text-muted)]">
            Carregando projetos...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8">
            <p className="text-sm font-semibold text-rose-700">
              Não foi possível carregar os projetos.
            </p>
            <p className="mt-2 break-all text-xs text-rose-600">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-8 text-sm font-medium text-[var(--color-text-muted)]">
            Nenhum projeto encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => {
              const progress = percent(
                Number(project.raisedXlm),
                Number(project.targetXlm),
              );

              return (
                <article
                  key={project.id}
                  className="group flex flex-col overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-white)] shadow-[0_18px_50px_rgba(15,0,161,0.08)]"
                >
                  <div className="relative h-52 overflow-hidden bg-[var(--color-primary)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,202,0,0.26),transparent_38%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))]" />

                    <div className="relative flex h-full items-end p-6">
                      <p className="max-w-xs font-[var(--font-body)] text-2xl font-semibold leading-tight text-[var(--color-white)]">
                        {project.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-7">
                    <span className="w-fit rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-primary)]">
                      {project.taxCategory}
                    </span>

                    <h3 className="mb-3 mt-4 font-[var(--font-body)] text-2xl font-medium leading-tight tracking-tight text-[var(--color-text)]">
                      {project.title}
                    </h3>

                    <p className="mb-6 flex-1 text-sm font-normal leading-7 text-[var(--color-text-muted)]">
                      {project.description}
                    </p>

                    <div className="mb-6 space-y-3">
                      <div className="flex items-end justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-soft)]">
                            Arrecadado
                          </span>

                          <span className="font-semibold text-[var(--color-text)]">
                            {formatXlm(project.raisedXlm)} XLM
                          </span>
                        </div>

                        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--color-primary)]">
                          {progress}% da meta
                        </span>
                      </div>

                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
                        <div
                          className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      to={`/contribuir?projeto=${project.id}&nome=${encodeURIComponent(
                        project.title,
                      )}`}
                      className="block w-full rounded-full bg-[var(--color-primary)] px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-white)] transition hover:bg-[var(--color-primary-dark)]"
                    >
                      Apoiar projeto
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
