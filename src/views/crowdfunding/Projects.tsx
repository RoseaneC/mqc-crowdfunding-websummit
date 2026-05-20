import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ProjectDTO } from "../../util/crowdfundingApi";
import HeroProjectsImg from "../../images/projects-page/foto_ideiathon1.jpg";

import MqcCardImg from "../../images/projects-page/cards/mqc-edicao-2.jpeg";
import EloMeCardImg from "../../images/projects-page/cards/elo-me.png";
import StellarbridgeCardImg from "../../images/projects-page/cards/stellarbridge.png";
import KarnCardImg from "../../images/projects-page/cards/karn.png";
import VizinhancaCardImg from "../../images/projects-page/cards/vizinhanca-cuidadora.png";
import Web3CardImg from "../../images/projects-page/cards/web3-lideranca.jpeg";
import FormacaoCardImg from "../../images/projects-page/cards/formacaoMulheres.jpeg";

type ProjectsApiResponse =
  | ProjectDTO[]
  | {
      value?: ProjectDTO[];
      data?: ProjectDTO[];
      projects?: ProjectDTO[];
      items?: ProjectDTO[];
      Count?: number;
    };

type ProjectAxis =
  | "Todos"
  | "Educação"
  | "Saúde"
  | "Tokenização"
  | "DeFi"
  | "Social";

const axisFilters: ProjectAxis[] = [
  "Todos",
  "Educação",
  "Saúde",
  "Tokenização",
  "DeFi",
  "Social",
];

const projectImages: Record<string, string> = {
  "1": MqcCardImg.src,
  "2": EloMeCardImg.src,
  "3": StellarbridgeCardImg.src,
  "4": KarnCardImg.src,
  "5": VizinhancaCardImg.src,
  "6": Web3CardImg.src,
  "8": FormacaoCardImg.src,
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

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getProjectAxis(project: ProjectDTO): ProjectAxis {
  const content = normalizeText(
    `${project.title} ${project.description} ${project.taxCategory} ${project.metadataUri}`,
  );

  if (
    content.includes("saude") ||
    content.includes("health") ||
    content.includes("clinico")
  ) {
    return "Saúde";
  }

  if (
    content.includes("token") ||
    content.includes("nft") ||
    content.includes("sbt") ||
    content.includes("recibo")
  ) {
    return "Tokenização";
  }

  if (
    content.includes("defi") ||
    content.includes("financa") ||
    content.includes("financeiro")
  ) {
    return "DeFi";
  }

  if (
    content.includes("social") ||
    content.includes("comunidade") ||
    content.includes("cuidadora") ||
    content.includes("inclusao")
  ) {
    return "Social";
  }

  return "Educação";
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [query, setQuery] = useState("");
  const [selectedAxis, setSelectedAxis] = useState<ProjectAxis>("Todos");
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

  const approvedProjects = useMemo(() => {
    return projects.filter((project) => project.status === "APPROVED");
  }, [projects]);

  const axisCounts = useMemo(() => {
    const counts = new Map<ProjectAxis, number>();

    axisFilters.forEach((axis) => counts.set(axis, 0));
    counts.set("Todos", approvedProjects.length);

    approvedProjects.forEach((project) => {
      const axis = getProjectAxis(project);
      counts.set(axis, (counts.get(axis) ?? 0) + 1);
    });

    return counts;
  }, [approvedProjects]);

  const filtered = useMemo(() => {
    const normalized = normalizeText(query.trim());

    return approvedProjects.filter((project) => {
      const axis = getProjectAxis(project);

      const matchesAxis = selectedAxis === "Todos" || axis === selectedAxis;

      const matchesSearch =
        !normalized ||
        normalizeText(project.title).includes(normalized) ||
        normalizeText(project.description).includes(normalized) ||
        normalizeText(project.taxCategory).includes(normalized) ||
        normalizeText(project.metadataUri).includes(normalized) ||
        normalizeText(axis).includes(normalized);

      return matchesAxis && matchesSearch;
    });
  }, [approvedProjects, query, selectedAxis]);

  return (
    <div className="min-h-screen bg-[#fbfcff] font-[var(--font-body)] text-[var(--color-text)]">
      <header className="relative min-h-[520px] overflow-hidden bg-[var(--color-primary)]">
        <img
          src={HeroProjectsImg.src}
          alt="Mulheres participantes do programa Mulheres Que Codam"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,0,112,0.92)_0%,rgba(15,0,161,0.72)_48%,rgba(15,0,161,0.32)_100%)]" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[rgba(251,252,255,0.50)] to-transparent" />

        <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-center px-4 py-24 text-center sm:px-6 sm:text-left lg:px-8">
          <div className="max-w-4xl">
            <h1 className="mb-6 font-[var(--font-body)] text-4xl font-light leading-[1.05] tracking-tight text-[var(--color-white)] sm:text-5xl lg:text-6xl">
              Juntas
              <br />
              <span className="font-medium text-[var(--color-accent)]">
                programando o futuro.
              </span>
            </h1>

            <p className="max-w-2xl text-base font-normal leading-8 text-white/80 sm:text-lg">
              Apoie projetos feitos mulheres de comunidades periféricas através
              da educação tecnológica.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <section className="-mt-16 rounded-[1.75rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.88)] px-5 py-5 shadow-[0_18px_50px_rgba(15,0,161,0.08)] backdrop-blur sm:px-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="mt-2 font-[var(--font-body)] text-2xl font-medium tracking-tight text-[var(--color-text)]">
                  Projetos aprovados
                </h2>
              </div>

              <p className="text-sm text-[var(--color-text-muted)]">
                <span className="font-medium text-[var(--color-text)]">
                  {filtered.length}
                </span>{" "}
                projeto{filtered.length === 1 ? "" : "s"} encontrado
                {filtered.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-[var(--color-text-soft)]">
                  search
                </span>

                <input
                  className="block w-full rounded-full bg-[var(--color-white)] py-3 pl-12 pr-4 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-soft)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/10"
                  placeholder="Buscar por projeto, eixo ou descrição..."
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {axisFilters.map((axis) => {
                  const isActive = selectedAxis === axis;

                  return (
                    <button
                      key={axis}
                      type="button"
                      onClick={() => setSelectedAxis(axis)}
                      className={[
                        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition",
                        isActive
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-white)]"
                          : "border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
                      ].join(" ")}
                    >
                      <span>{axis}</span>

                      <span
                        className={[
                          "text-[10px]",
                          isActive
                            ? "text-white/70"
                            : "text-[var(--color-text-soft)]",
                        ].join(" ")}
                      >
                        {axisCounts.get(axis) ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project) => {
                const progress = percent(
                  Number(project.raisedXlm),
                  Number(project.targetXlm),
                );

                const projectImage =
                  projectImages[String(project.id)] ?? HeroProjectsImg.src;

                return (
                  <article
                    key={project.id}
                    className="group flex min-h-[520px] flex-col overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-white)] shadow-[0_18px_50px_rgba(15,0,161,0.06)] transition-shadow duration-300 hover:shadow-[0_24px_70px_rgba(15,0,161,0.12)]"
                  >
                    <div className="relative h-48 overflow-hidden bg-[var(--color-primary)]">
                      <img
                        src={projectImage}
                        alt={`Imagem do projeto ${project.title}`}
                        className="h-full w-full transform-gpu object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,0,112,0.04),rgba(10,0,112,0.38))]" />
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-text-soft)]">
                          {project.taxCategory}
                        </p>

                        <h3 className="mt-4 font-[var(--font-body)] text-xl font-medium leading-tight tracking-tight text-[var(--color-text)]">
                          {project.title}
                        </h3>

                        <p className="mt-5 text-sm leading-7 text-[var(--color-text-muted)]">
                          {project.description}
                        </p>
                      </div>

                      <div className="mt-8">
                        <div className="flex items-end justify-between gap-5">
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-soft)]">
                              Arrecadado
                            </p>

                            <p className="mt-1 text-lg font-semibold text-[var(--color-text)]">
                              {formatXlm(project.raisedXlm)} XLM
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-soft)]">
                              Meta
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[var(--color-primary)]">
                              {progress}%
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
                          <div
                            className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-700"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-4">
                          <p className="text-xs leading-5 text-[var(--color-text-soft)]">
                            Apoie este projeto e acompanhe o impacto gerado.
                          </p>

                          <Link
                            to={`/contribuir?projeto=${project.id}&nome=${encodeURIComponent(
                              project.title,
                            )}`}
                            className="shrink-0 rounded-full bg-[var(--color-black)] px-5 py-2.5 text-xs font-semibold text-[var(--color-white)] transition hover:bg-[var(--color-primary)]"
                          >
                            Apoiar
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
