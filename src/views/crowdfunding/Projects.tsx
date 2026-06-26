import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import type {
  ProjectDTO,
  ProjectFundingAsset,
} from "../../util/crowdfundingApi";
import {
  calculateProjectDonationMetrics,
  formatDonationAmount,
  formatDonationProgress,
  getDonationCampaignMessage,
} from "../../util/donationMetrics";
import {
  allowedOdsNumbers,
  defaultAcceptedDemoCurrencies,
  demoCurrencyLabels,
  formatDemoCurrencyLabel,
  odsNameByNumber,
  projectThemeFilters,
  webSummitDemoCurrencyNote,
  type OdsNumber,
  type ProjectTheme,
  type ProjectThemeFilter,
} from "../../util/projectDemoMetadata";
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

const fallbackOdsByTheme: Record<ProjectTheme, OdsNumber[]> = {
  "Transição energética justa": [7],
  "Equidade de gênero": [5, 8, 10],
  "Segurança alimentar": [2],
  "Inclusão produtiva": [8, 9, 10],
  "Educação de qualidade": [4],
};

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

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatResultsCount(count: number) {
  return count === 1 ? "1 projeto encontrado" : `${count} projetos encontrados`;
}

function isAllowedOds(value: number): value is OdsNumber {
  return allowedOdsNumbers.includes(value as OdsNumber);
}

function isProjectFundingAsset(value: string): value is ProjectFundingAsset {
  if (value === "USDGLO" || value === "PIX") return true;
  return Object.prototype.hasOwnProperty.call(demoCurrencyLabels, value);
}

function inferProjectTheme(project: ProjectDTO): ProjectTheme {
  const content = normalizeText(
    `${project.title} ${project.description} ${project.taxCategory} ${project.metadataUri}`,
  );

  if (
    content.includes("energia") ||
    content.includes("sustentabilidade") ||
    content.includes("energetic")
  ) {
    return "Transição energética justa";
  }

  if (
    content.includes("alimentar") ||
    content.includes("alimento") ||
    content.includes("fome") ||
    content.includes("soberania")
  ) {
    return "Segurança alimentar";
  }

  if (
    content.includes("genero") ||
    content.includes("protecao") ||
    content.includes("autonomia economica")
  ) {
    return "Equidade de gênero";
  }

  if (
    content.includes("empregabilidade") ||
    content.includes("renda") ||
    content.includes("inovacao") ||
    content.includes("capacitacao") ||
    content.includes("empreendedorismo") ||
    content.includes("inclusao")
  ) {
    return "Inclusão produtiva";
  }

  return "Educação de qualidade";
}

function getProjectTheme(project: ProjectDTO): ProjectTheme {
  return project.eixoTematico ?? inferProjectTheme(project);
}

function getProjectOds(project: ProjectDTO): OdsNumber[] {
  const odsFromProject = project.ods?.filter(isAllowedOds) ?? [];

  if (odsFromProject.length > 0) {
    return odsFromProject;
  }

  return fallbackOdsByTheme[getProjectTheme(project)];
}

function getProjectOdsNames(project: ProjectDTO): string[] {
  if (project.odsNames && project.odsNames.length > 0) {
    return project.odsNames;
  }

  return getProjectOds(project).map((ods) => odsNameByNumber[ods]);
}

function getProjectPrimaryCurrency(project: ProjectDTO): ProjectFundingAsset {
  return project.moedaPrincipal ?? "USDC";
}

function getProjectAcceptedCurrencies(
  project: ProjectDTO,
): ProjectFundingAsset[] {
  const acceptedCurrencies =
    project.moedasAceitas?.filter(isProjectFundingAsset) ?? [];

  if (acceptedCurrencies.length > 0) {
    return acceptedCurrencies;
  }

  return defaultAcceptedDemoCurrencies;
}

function formatMetricCurrencyLabel(
  currency: string | undefined,
  fallback: ProjectFundingAsset,
) {
  const normalized = currency?.trim().toUpperCase();

  if (normalized === "XLM") return "XLM";
  if (normalized === "USDC" || normalized === "BRZ") {
    return formatDemoCurrencyLabel(normalized);
  }
  if (normalized === "USDGLO") return "USDGLO";
  if (normalized === "PIX") return "PIX";

  return formatProjectFundingAssetLabel(fallback);
}

function formatProjectFundingAssetLabel(asset: ProjectFundingAsset) {
  if (asset === "USDGLO") return "USDGLO";
  if (asset === "PIX") return "PIX";

  return formatDemoCurrencyLabel(asset);
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [query, setQuery] = useState("");
  const [selectedTheme, setSelectedTheme] =
    useState<ProjectThemeFilter>("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/projects", {
          cache: "no-store",
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

  const themeCounts = useMemo(() => {
    const counts = new Map<ProjectThemeFilter, number>();

    projectThemeFilters.forEach((theme) => counts.set(theme, 0));
    counts.set("Todos", approvedProjects.length);

    approvedProjects.forEach((project) => {
      const theme = getProjectTheme(project);
      counts.set(theme, (counts.get(theme) ?? 0) + 1);
    });

    return counts;
  }, [approvedProjects]);

  const filtered = useMemo(() => {
    const normalized = normalizeText(query.trim());

    return approvedProjects.filter((project) => {
      const theme = getProjectTheme(project);
      const ods = getProjectOds(project);
      const odsNames = getProjectOdsNames(project);
      const primaryCurrency = getProjectPrimaryCurrency(project);
      const acceptedCurrencies = getProjectAcceptedCurrencies(project);

      const matchesTheme = selectedTheme === "Todos" || theme === selectedTheme;

      const searchableContent = normalizeText(
        [
          project.title,
          project.description,
          project.taxCategory,
          project.metadataUri,
          theme,
          ...ods.map((item) => `ODS ${item}`),
          ...odsNames,
          formatProjectFundingAssetLabel(primaryCurrency),
          ...acceptedCurrencies.map(formatProjectFundingAssetLabel),
        ].join(" "),
      );

      const matchesSearch =
        !normalized || searchableContent.includes(normalized);

      return matchesTheme && matchesSearch;
    });
  }, [approvedProjects, query, selectedTheme]);

  const hasActiveFilters = query.trim().length > 0 || selectedTheme !== "Todos";

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
              Apoie projetos liderados por mulheres em eixos de impacto
              conectados às ODS, com foco em educação, inclusão produtiva,
              equidade, segurança alimentar e transição energética justa.
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
                  {formatResultsCount(filtered.length)}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="relative w-full lg:max-w-lg">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-soft)]"
                  strokeWidth={2}
                />

                <input
                  className="block h-12 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-white)] py-3 pl-11 pr-4 text-sm font-medium text-[var(--color-text)] shadow-sm transition placeholder:text-[var(--color-text-soft)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/10"
                  placeholder="Buscar por projeto, eixo, ODS ou descrição..."
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:max-w-3xl lg:justify-end">
                {projectThemeFilters.map((theme) => {
                  const isActive = selectedTheme === theme;

                  return (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setSelectedTheme(theme)}
                      className={[
                        "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition",
                        isActive
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-white)]"
                          : "border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
                      ].join(" ")}
                    >
                      <span>{theme}</span>

                      <span
                        className={[
                          "text-[10px]",
                          isActive
                            ? "text-white/70"
                            : "text-[var(--color-text-soft)]",
                        ].join(" ")}
                      >
                        {themeCounts.get(theme) ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-xs leading-6 text-[var(--color-text-muted)]">
              {webSummitDemoCurrencyNote}
            </p>
          </div>
        </section>

        <section className="mt-12">
          {loading ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-8 shadow-[0_18px_50px_rgba(15,0,161,0.05)]">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Carregando projetos aprovados...
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Estamos buscando as iniciativas disponíveis para apoio.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-44 animate-pulse rounded-2xl bg-[var(--color-surface-alt)]"
                  />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8">
              <p className="text-sm font-semibold text-rose-700">
                Não foi possível carregar os projetos.
              </p>
              <p className="mt-2 break-all text-xs text-rose-600">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-8 shadow-[0_18px_50px_rgba(15,0,161,0.05)]">
              <h3 className="font-[var(--font-body)] text-xl font-medium tracking-tight text-[var(--color-text)]">
                {approvedProjects.length === 0
                  ? "Ainda não há projetos aprovados disponíveis."
                  : "Nenhum projeto corresponde à busca."}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
                {approvedProjects.length === 0
                  ? "A equipe está preparando novas iniciativas para publicação. Volte em breve para conhecer os próximos projetos."
                  : "Tente buscar por nome, eixo temático, ODS ou descrição para visualizar outras iniciativas."}
              </p>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSelectedTheme("Todos");
                  }}
                  className="mt-6 rounded-full border border-[var(--color-border)] px-5 py-2 text-sm font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-primary)]"
                >
                  Limpar filtros
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project) => {
                const metrics = calculateProjectDonationMetrics(project);
                const theme = getProjectTheme(project);
                const odsNames = getProjectOdsNames(project);
                const primaryCurrency = getProjectPrimaryCurrency(project);
                const acceptedCurrencies =
                  getProjectAcceptedCurrencies(project);
                const raisedCurrencyLabel =
                  metrics.totalRaised > 0
                    ? formatMetricCurrencyLabel(
                        metrics.currency,
                        primaryCurrency,
                      )
                    : formatProjectFundingAssetLabel(primaryCurrency);
                const projectImage =
                  projectImages[String(project.id)] ?? HeroProjectsImg.src;

                return (
                  <article
                    key={project.id}
                    className="group flex min-h-[600px] flex-col overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-white)] shadow-[0_18px_50px_rgba(15,0,161,0.06)] transition-shadow duration-300 hover:shadow-[0_24px_70px_rgba(15,0,161,0.12)]"
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
                          {theme}
                        </p>

                        <h3 className="mt-4 font-[var(--font-body)] text-xl font-medium leading-tight tracking-tight text-[var(--color-text)]">
                          {project.title}
                        </h3>

                        <p className="mt-5 text-sm leading-7 text-[var(--color-text-muted)]">
                          {project.description}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {odsNames.map((odsName) => (
                            <span
                              key={odsName}
                              className="max-w-full rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-[10px] font-semibold leading-4 text-[var(--color-primary)]"
                            >
                              {odsName}
                            </span>
                          ))}
                        </div>

                        <div className="mt-5 space-y-2 text-xs leading-5 text-[var(--color-text-muted)]">
                          <p>
                            <span className="font-semibold text-[var(--color-text)]">
                              Moeda principal:
                            </span>{" "}
                            {formatProjectFundingAssetLabel(primaryCurrency)}
                          </p>
                          <p>
                            <span className="font-semibold text-[var(--color-text)]">
                              Moedas aceitas na demo:
                            </span>{" "}
                            {acceptedCurrencies
                              .map(formatProjectFundingAssetLabel)
                              .join(", ")}
                          </p>
                          {project.pixKey || project.pixQrCodeUrl ? (
                            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                              <p className="font-semibold text-[var(--color-text)]">
                                PIX direto do projeto
                              </p>
                              {project.pixKey ? (
                                <div className="mt-2 flex items-center justify-between gap-3">
                                  <span className="break-all">
                                    {project.pixKey}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void navigator.clipboard.writeText(
                                        project.pixKey ?? "",
                                      )
                                    }
                                    className="shrink-0 rounded-full border border-[var(--color-border)] px-3 py-1 text-[10px] font-semibold text-[var(--color-primary)]"
                                  >
                                    Copiar
                                  </button>
                                </div>
                              ) : null}
                              {project.pixQrCodeUrl ? (
                                <img
                                  src={project.pixQrCodeUrl}
                                  alt={`QR Code PIX do projeto ${project.title}`}
                                  className="mt-3 h-28 w-28 rounded-lg border border-[var(--color-border)] object-cover"
                                />
                              ) : null}
                              <p className="mt-2 text-[11px] leading-4 text-[var(--color-text-soft)]">
                                Doacao fiduciaria direta fora da blockchain.
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flex items-end justify-between gap-5">
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-soft)]">
                              Arrecadado
                            </p>

                            <p className="mt-1 text-lg font-semibold text-[var(--color-text)]">
                              {formatDonationAmount(metrics.totalRaised)}{" "}
                              {raisedCurrencyLabel} arrecadados
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-soft)]">
                              Captado
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[var(--color-primary)]">
                              {formatDonationProgress(metrics.progressPercent)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
                          <div
                            className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-700"
                            style={{ width: `${metrics.progressPercent}%` }}
                          />
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-4">
                          <p className="text-xs leading-5 text-[var(--color-text-soft)]">
                            {getDonationCampaignMessage(metrics)}
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
