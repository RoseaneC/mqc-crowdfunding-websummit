import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTransparencySummary } from "../../util/crowdfundingApi";

export default function Transparency() {
  const [summary, setSummary] = useState({
    totalXlm: 0,
    projectXlm: 0,
    feeXlm: 0,
    approvedProjects: 0,
    uniqueDonors: 0,
  });

  useEffect(() => {
    void getTransparencySummary()
      .then((response) => {
        setSummary({
          totalXlm: response.totalXlm,
          projectXlm: response.projectXlm,
          feeXlm: response.feeXlm,
          approvedProjects: response.approvedProjects,
          uniqueDonors: response.uniqueDonors,
        });
      })
      .catch(() => {});
  }, []);

  const steps = [
    {
      number: "01",
      title: "Apoio registrado",
      text: "A pessoa apoiadora escolhe um projeto e contribui por PIX ou moeda digital estavel na Celo.",
    },
    {
      number: "02",
      title: "Recurso direcionado",
      text: "O valor vai para a organizacao responsavel, conforme os dados informados no projeto aprovado.",
    },
    {
      number: "03",
      title: "Evidencias publicadas",
      text: "Projetos podem compartilhar registros, comprovantes e atualizacoes para acompanhar o impacto.",
    },
  ];

  const trustNotes = [
    "Projetos podem passar por analise antes de receber apoio publico.",
    "Contribuicoes digitais confirmadas podem ser verificadas na Celo.",
    "PIX e feito diretamente para a organizacao responsavel pelo projeto.",
    "A prestacao de contas organiza evidencias, relatorios e atualizacoes.",
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-[var(--font-body)] text-[var(--color-text)]">
      <section
        id="transparencia"
        className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-primary-dark)] px-4 py-24 text-[#f8f3ea]"
      >
        <div className="absolute inset-y-0 left-0 w-2 bg-[var(--color-accent)]" />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d89a4b]">
            Transparencia Ponteia
          </p>
          <h1 className="mt-6 max-w-4xl font-[var(--font-heading)] text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Acompanhe como recursos viram impacto.
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-8 text-[#f8f3ea]/78 sm:text-lg">
            A Ponteia organiza projetos, formas de apoio e evidencias para que
            pessoas e empresas contribuam com mais clareza. A tecnologia aparece
            como infraestrutura de confianca, nao como barreira.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <MetricCard
            label="Total acompanhado"
            value={`${summary.totalXlm.toLocaleString("pt-BR")} USDGLO`}
          />
          <MetricCard
            label="Liquido em projetos"
            value={`${summary.projectXlm.toLocaleString("pt-BR")} USDGLO`}
          />
          <MetricCard
            label="Taxa da plataforma"
            value={`${summary.feeXlm.toLocaleString("pt-BR")} USDGLO`}
          />
          <MetricCard
            label="Projetos aprovados"
            value={summary.approvedProjects.toLocaleString("pt-BR")}
          />
          <MetricCard
            label="Apoiadores unicos"
            value={summary.uniqueDonors.toLocaleString("pt-BR")}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-dark)]">
              Como a informacao circula
            </p>
            <h2 className="mt-4 font-[var(--font-heading)] text-3xl font-semibold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl">
              Do apoio ao acompanhamento, tudo precisa ser legivel.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
              O objetivo da transparencia e permitir que qualquer pessoa entenda
              para onde foi o recurso, quem executa o projeto e quais evidencias
              foram publicadas.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-sm border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-[0_16px_42px_rgba(28,26,23,0.05)]"
              >
                <span className="font-[var(--font-heading)] text-4xl font-semibold text-[var(--color-accent)]">
                  {step.number}
                </span>
                <h3 className="mt-5 font-[var(--font-heading)] text-lg font-semibold text-[var(--color-text)]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div className="rounded-sm border border-[var(--color-border)] bg-[var(--color-primary-dark)] p-8 text-[#f8f3ea] shadow-[0_22px_64px_rgba(7,21,14,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d89a4b]">
              Prestacao de contas
            </p>
            <h2 className="mt-5 font-[var(--font-heading)] text-3xl font-semibold leading-tight sm:text-4xl">
              Evidencias ajudam a transformar confianca em acompanhamento.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#f8f3ea]/78 sm:text-base">
              Cada projeto pode publicar comprovantes, fotos, relatorios e links
              que mostram sua execucao. Isso cria uma memoria publica do
              impacto, sem prometer metricas que ainda nao existem.
            </p>
          </div>

          <div className="space-y-4">
            {trustNotes.map((note) => (
              <div
                key={note}
                className="flex gap-4 rounded-sm border border-[var(--color-border)] bg-[var(--color-white)] p-5"
              >
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
                <p className="text-sm leading-7 text-[var(--color-text-muted)]">
                  {note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="font-[var(--font-heading)] text-3xl font-semibold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl">
          Transparencia sem complicar a doacao.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
          Voce pode apoiar pelo banco de sempre via PIX ou usar contribuicoes
          digitais estaveis. A Ponteia organiza o caminho para que projetos
          prestem contas com clareza.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/projetos"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-[#f8f3ea] transition hover:bg-[var(--color-primary-dark)]"
          >
            Conhecer projetos
          </Link>
          <Link
            to="/#contato"
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-border-strong)] px-7 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
          >
            Falar com a Ponteia
          </Link>
        </div>
      </section>
    </div>
  );
}

function MetricCard(props: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-[var(--color-border)] bg-[var(--color-white)] p-5 shadow-[0_14px_38px_rgba(28,26,23,0.05)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
        {props.label}
      </p>
      <p className="mt-3 font-[var(--font-heading)] text-xl font-semibold text-[var(--color-text)]">
        {props.value}
      </p>
    </div>
  );
}
