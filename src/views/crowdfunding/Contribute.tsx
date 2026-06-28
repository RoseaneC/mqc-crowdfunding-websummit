import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePrivyWalletAbstraction } from "../../hooks/usePrivyWalletAbstraction";
import {
  listProjectMedia,
  listProjects,
  type ProjectDTO,
  type ProjectFundingAsset,
  type ProjectMediaItemDTO,
} from "../../util/crowdfundingApi";
import {
  calculateProjectDonationMetrics,
  formatDonationAmount,
  formatDonationProgress,
  getDonationCampaignMessage,
} from "../../util/donationMetrics";
import { formatDemoCurrencyLabel } from "../../util/projectDemoMetadata";
import { isCeloUsdgloEnabled } from "../../util/celoConfig";
import { validateCeloWallet } from "../../util/usdgloCelo";

import MqcCardImg from "../../images/projects-page/cards/mqc-edicao-2.jpeg";
import EloMeCardImg from "../../images/projects-page/cards/elo-me.png";
import KarnCardImg from "../../images/projects-page/cards/karn.png";
import VizinhancaCardImg from "../../images/projects-page/cards/vizinhanca-cuidadora.png";
import Web3CardImg from "../../images/projects-page/cards/web3-lideranca.jpeg";
import FormacaoCardImg from "../../images/projects-page/cards/formacaoMulheres.jpeg";

type DonorType = "PF" | "PJ";
type CurrencyCode = "USDGLO" | "PIX" | "BRZ";

type CurrencyOption = {
  code: CurrencyCode;
  name: string;
  description: string;
  brlRate: number;
};

const currencyOptions: CurrencyOption[] = [
  {
    code: "USDGLO",
    name: "USDGLO",
    description: "Pagamentos em USDGLO usam carteira EVM na rede Celo.",
    brlRate: 5.2,
  },
  {
    code: "PIX",
    name: "PIX",
    description:
      "Doações via PIX são feitas diretamente para a organização responsável pelo projeto, fora da blockchain.",
    brlRate: 1,
  },
  {
    code: "BRZ",
    name: "BRZ",
    description: "Opção informativa para futura integração fiduciária.",
    brlRate: 1,
  },
];

const projectImages: Record<string, string> = {
  "1": MqcCardImg.src,
  "2": EloMeCardImg.src,
  "4": KarnCardImg.src,
  "5": VizinhancaCardImg.src,
  "6": Web3CardImg.src,
  "8": FormacaoCardImg.src,
};

export default function Contribute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const privyWallet = usePrivyWalletAbstraction();

  const projetoId = searchParams.get("projeto") || "1";
  const projetoNomeParam = searchParams.get("nome")?.trim() ?? "";

  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [projectMedia, setProjectMedia] = useState<ProjectMediaItemDTO | null>(
    null,
  );
  const [tipoDoador, setTipoDoador] = useState<DonorType>("PF");
  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyCode>("USDGLO");
  const [contributionValue, setContributionValue] = useState("100");
  const [identificacao, setIdentificacao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pixCopyFeedback, setPixCopyFeedback] = useState<string | null>(null);

  const displayProjectName =
    project?.title || projetoNomeParam || `Campanha #${projetoId}`;
  const projectImage =
    projectImages[projetoId] ?? projectMedia?.img ?? MqcCardImg.src;
  const currency = useMemo(
    () =>
      currencyOptions.find((option) => option.code === selectedCurrency) ??
      currencyOptions[0],
    [selectedCurrency],
  );
  const projectCurrency = normalizePrimaryAsset(project);
  const projectCurrencyLabel = formatProjectFundingAssetLabel(projectCurrency);
  const numericContribution = Number(contributionValue || 0);
  const amountBRL = numericContribution * currency.brlRate;
  const isUsdGloCeloSelected = selectedCurrency === "USDGLO";
  const isPixSelected = selectedCurrency === "PIX";
  const isBrzSelected = selectedCurrency === "BRZ";
  const hasProjectPix = Boolean(project?.pixKey || project?.pixQrCodeUrl);
  const hasValidDestinationWallet = validateCeloWallet(project?.walletAddress);
  const hasValidEvmWallet = validateCeloWallet(privyWallet.evmAddress);
  const projectMetrics = project
    ? calculateProjectDonationMetrics({
        ...project,
        moedaPrincipal: projectCurrency,
        raisedAsset: projectCurrency,
      })
    : null;
  const progressPercent = projectMetrics?.progressPercent ?? 0;
  const raisedCurrencyLabel =
    projectMetrics && projectMetrics.totalRaised > 0
      ? formatMetricCurrencyLabel(projectMetrics.currency, projectCurrency)
      : projectCurrencyLabel;
  const isDocumentValid = useMemo(() => {
    const digits = identificacao.replace(/\D/g, "");
    if (!digits) return false;
    return tipoDoador === "PF" ? isValidCPF(digits) : isValidCNPJ(digits);
  }, [identificacao, tipoDoador]);
  const fiscalBenefit = useMemo(() => {
    const rate = tipoDoador === "PF" ? 0.06 : 0.04;
    return (amountBRL * rate).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [amountBRL, tipoDoador]);
  const submitButtonLabel = isSubmitting
    ? "Processando..."
    : isPixSelected
      ? project?.pixKey
        ? "Copiar chave PIX"
        : project?.pixQrCodeUrl
          ? "Ver QR Code PIX"
          : "PIX ainda não configurado"
      : isUsdGloCeloSelected
        ? !privyWallet.authenticated || !hasValidEvmWallet
          ? "Conectar carteira EVM"
          : "Confirmar doação em USDGLO"
        : "Ver instruções BRZ";

  const handleIdentificacaoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIdentificacao(formatDocument(event.target.value, tipoDoador));
  };

  const handlePrivyLogin = () => {
    void Promise.resolve()
      .then(() => privyWallet.login())
      .catch(() => undefined);
  };

  const handleCopyPixKey = async () => {
    if (!project?.pixKey) return false;
    await navigator.clipboard.writeText(project.pixKey);
    setPixCopyFeedback("Chave PIX copiada");
    window.setTimeout(() => setPixCopyFeedback(null), 2500);
    return true;
  };

  const handleConfirmarDoacao = () => {
    if (isPixSelected) {
      if (project?.pixKey) {
        void handleCopyPixKey();
        return;
      }
      if (project?.pixQrCodeUrl) {
        setPixCopyFeedback("QR Code PIX disponível nesta página.");
        window.setTimeout(() => setPixCopyFeedback(null), 2500);
        return;
      }
      alert("PIX ainda não configurado para este projeto.");
      return;
    }

    if (isBrzSelected) {
      alert(
        "BRZ permanece como opção informativa/futura. Nenhum pagamento foi criado.",
      );
      return;
    }

    if (!privyWallet.authenticated) {
      handlePrivyLogin();
      return;
    }

    if (!isCeloUsdgloEnabled()) {
      alert(
        "Fluxo USDGLO/Celo preparado. Conecte carteira EVM na rede Celo para continuar.",
      );
      return;
    }

    if (!hasValidEvmWallet) {
      alert("Conecte uma carteira EVM via Privy para doar em USDGLO.");
      return;
    }

    if (!hasValidDestinationWallet) {
      alert(
        "Este projeto ainda não possui carteira EVM configurada para receber USDGLO.",
      );
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      alert(
        "Fluxo USDGLO/Celo preparado. A transação real será conectada na próxima etapa; nenhuma doação foi registrada sem txHash.",
      );
    }, 250);
  };

  useEffect(() => {
    setIdentificacao("");
  }, [tipoDoador]);

  useEffect(() => {
    async function loadProjectData() {
      try {
        const projects = await listProjects();
        const selected = projects.find((item) => String(item.id) === projetoId);
        setProject(selected ?? null);
        setSelectedCurrency(normalizePrimaryAsset(selected));
      } catch {
        setProject(null);
        setSelectedCurrency("USDGLO");
      }

      try {
        const media = await listProjectMedia();
        const selectedMedia = media.find((item) => item.id === projetoId);
        setProjectMedia(selectedMedia ?? null);
      } catch {
        setProjectMedia(null);
      }
    }

    void loadProjectData();
  }, [projetoId]);

  return (
    <div className="min-h-screen bg-[var(--color-surface)] font-[var(--font-body)] text-[var(--color-text)]">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => void navigate("/projetos")}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)]"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            Voltar para projetos
          </button>

          <span className="hidden rounded-full border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-2 text-xs font-medium text-[var(--color-text-muted)] sm:inline-flex">
            Celo + USDGLO + PIX
          </span>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-white)] shadow-[0_24px_80px_rgba(15,0,161,0.10)]">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[480px] overflow-hidden bg-[var(--color-primary)]">
              <img
                src={projectImage}
                alt={displayProjectName}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,0,36,0.84)_0%,rgba(15,0,161,0.50)_58%,rgba(15,0,161,0.20)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[rgba(5,0,36,0.92)] to-transparent" />

              <div className="relative z-10 flex min-h-[480px] flex-col justify-end p-8 sm:p-10">
                <div className="max-w-3xl">
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[var(--color-accent)] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                      {project?.taxCategory ?? "Projeto de impacto"}
                    </span>
                    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                      USDGLO Celo Mainnet
                    </span>
                  </div>

                  <h1 className="font-[var(--font-heading)] text-4xl font-bold leading-tight tracking-tight text-[var(--color-white)] sm:text-5xl">
                    {displayProjectName}
                  </h1>

                  <p className="mt-5 max-w-2xl text-base leading-8 text-white/78">
                    {project?.description ??
                      "Apoie projetos de impacto liderados por mulheres com pagamentos em USDGLO na Celo ou PIX direto para a organização."}
                  </p>
                </div>
              </div>
            </div>

            <aside className="bg-[var(--color-white)] p-6 sm:p-8">
              <div className="mx-auto max-w-xl">
                <div className="mb-6 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                  <div className="flex items-end justify-between gap-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-soft)]">
                        Arrecadado
                      </p>
                      <p className="mt-1 text-xl font-bold text-[var(--color-text)]">
                        {formatDonationAmount(projectMetrics?.totalRaised ?? 0)}{" "}
                        {raisedCurrencyLabel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-soft)]">
                        Captado
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--color-primary)]">
                        {formatDonationProgress(progressPercent)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)]">
                    {projectMetrics
                      ? getDonationCampaignMessage(projectMetrics)
                      : "Campanha aberta para primeiras contribuições"}
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-soft)]">
                      Tipo de doador
                    </label>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {(["PF", "PJ"] as DonorType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setTipoDoador(type)}
                          className={[
                            "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                            tipoDoador === type
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-white)]"
                              : "border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]",
                          ].join(" ")}
                        >
                          {type === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-soft)]">
                      {tipoDoador === "PF" ? "CPF" : "CNPJ"}
                    </label>
                    <input
                      type="text"
                      value={identificacao}
                      onChange={handleIdentificacaoChange}
                      placeholder={
                        tipoDoador === "PF"
                          ? "000.000.000-00"
                          : "00.000.000/0000-00"
                      }
                      className={[
                        "mt-3 w-full rounded-2xl border bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-soft)] focus:bg-[var(--color-white)] focus:ring-4",
                        identificacao && !isDocumentValid
                          ? "border-[var(--color-error)] focus:ring-[var(--color-error)]/10"
                          : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10",
                      ].join(" ")}
                    />
                    {identificacao && !isDocumentValid ? (
                      <p className="mt-2 text-xs font-medium text-[var(--color-error)]">
                        {tipoDoador === "PF"
                          ? "CPF inválido."
                          : "CNPJ inválido."}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-soft)]">
                      Valor
                    </label>
                    <div className="mt-3 grid grid-cols-[1fr_142px] gap-3">
                      <div className="flex items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 focus-within:border-[var(--color-primary)] focus-within:bg-[var(--color-white)] focus-within:ring-4 focus-within:ring-[var(--color-primary)]/10">
                        <input
                          type="number"
                          min="0"
                          value={contributionValue}
                          onChange={(event) =>
                            setContributionValue(event.target.value)
                          }
                          className="w-full bg-transparent text-3xl font-semibold text-[var(--color-text)] outline-none"
                        />
                      </div>
                      <select
                        value={selectedCurrency}
                        onChange={(event) =>
                          setSelectedCurrency(
                            event.target.value as CurrencyCode,
                          )
                        }
                        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] px-3 text-sm font-semibold text-[var(--color-primary)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                      >
                        {currencyOptions.map((option) => (
                          <option key={option.code} value={option.code}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                      {currency.description}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[var(--color-primary)]/15 bg-[var(--color-primary-light)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
                      Incentivo fiscal estimado
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-primary-dark)]">
                      Para {tipoDoador}, esta contribuição pode gerar abatimento
                      aproximado de{" "}
                      <span className="font-semibold">R$ {fiscalBenefit}</span>.
                    </p>
                  </div>

                  {isUsdGloCeloSelected ? (
                    <UsdGloPanel
                      authenticated={privyWallet.authenticated}
                      ready={privyWallet.ready}
                      evmAddress={privyWallet.evmAddress}
                      shortEvmAddress={privyWallet.shortEvmAddress}
                      destinationWallet={project?.walletAddress ?? null}
                      onLogin={handlePrivyLogin}
                    />
                  ) : null}

                  {isPixSelected ? (
                    <PixPanel
                      project={project}
                      displayProjectName={displayProjectName}
                      feedback={pixCopyFeedback}
                      onCopy={handleCopyPixKey}
                    />
                  ) : null}

                  {isBrzSelected ? (
                    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
                        BRZ informativo
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                        BRZ está reservado para futura integração fiduciária.
                        Por enquanto, use USDGLO ou PIX para apoiar o projeto.
                      </p>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => void handleConfirmarDoacao()}
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-[var(--color-primary)] px-6 py-4 text-sm font-semibold text-[var(--color-white)] shadow-[0_12px_34px_rgba(15,0,161,0.25)] transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitButtonLabel}
                  </button>

                  <p className="text-center text-[11px] leading-5 text-[var(--color-text-soft)]">
                    USDGLO usa Celo Mainnet/EVM. PIX é uma doação fiduciária
                    direta fora da blockchain.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
          <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-white)] p-8 shadow-[0_14px_40px_rgba(15,0,161,0.05)]">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-dark)]">
              Por que apoiar este projeto?
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Impacto direto",
                  text: "Sua contribuição fortalece iniciativas lideradas por mulheres e amplia oportunidades reais.",
                  icon: "diversity_3",
                },
                {
                  title: "Transparência",
                  text: "A plataforma organiza contribuições, evidências e prestação de contas para acompanhamento de impacto.",
                  icon: "account_tree",
                },
                {
                  title: "Recibo digital",
                  text: "A contribuição pode gerar registros e comprovantes associados ao projeto apoiado.",
                  icon: "verified",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
                >
                  <span className="material-symbols-outlined text-3xl text-[var(--color-primary)]">
                    {item.icon}
                  </span>
                  <h3 className="mt-4 font-[var(--font-heading)] text-base font-semibold text-[var(--color-text)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-white)] p-8 shadow-[0_14px_40px_rgba(15,0,161,0.05)]">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-dark)]">
              Quem realiza
            </p>
            <h2 className="mt-3 font-[var(--font-heading)] text-2xl font-semibold text-[var(--color-text)]">
              {project?.ngoName ?? "Organização responsável"}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-muted)]">
              A organização responsável cadastra as informações, acompanha a
              captação e responde pela execução da iniciativa.
            </p>

            {project?.walletAddress ? (
              <div className="mt-5 rounded-2xl bg-[var(--color-surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-soft)]">
                  Wallet EVM da organização
                </p>
                <p className="mt-2 break-all text-sm font-medium text-[var(--color-text)]">
                  {project.walletAddress}
                </p>
              </div>
            ) : null}

            {hasProjectPix ? (
              <PixPanel
                project={project}
                displayProjectName={displayProjectName}
                feedback={pixCopyFeedback}
                onCopy={handleCopyPixKey}
                compact
              />
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}

function UsdgloCeloStatusMessage(props: {
  destinationWallet: string | null | undefined;
}) {
  if (!validateCeloWallet(props.destinationWallet)) {
    return (
      <p className="mt-3 rounded-xl bg-[var(--color-accent-light)] px-3 py-2 text-xs leading-5 text-[var(--color-primary-dark)]">
        Este projeto ainda não possui carteira EVM configurada para receber
        USDGLO.
      </p>
    );
  }

  if (!isCeloUsdgloEnabled()) {
    return (
      <p className="mt-3 rounded-xl bg-[var(--color-accent-light)] px-3 py-2 text-xs leading-5 text-[var(--color-primary-dark)]">
        Fluxo USDGLO/Celo preparado. Conecte carteira EVM na rede Celo para
        continuar.
      </p>
    );
  }

  return null;
}

function UsdGloPanel(props: {
  authenticated: boolean;
  ready: boolean;
  evmAddress: string | null;
  shortEvmAddress: string | null;
  destinationWallet: string | null;
  onLogin: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
            Carteira EVM via Privy
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            Pagamentos em USDGLO usam carteira EVM na rede Celo.
          </p>
        </div>

        {!props.authenticated ? (
          <button
            type="button"
            onClick={props.onLogin}
            disabled={!props.ready}
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-white)] transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
          >
            Conectar carteira EVM
          </button>
        ) : null}
      </div>

      <div className="mt-3 rounded-xl bg-[var(--color-surface)] px-3 py-3">
        <p className="text-xs font-semibold text-[var(--color-text-soft)]">
          Carteira conectada
        </p>
        <p className="mt-1 text-xs font-semibold text-[var(--color-text)]">
          {props.evmAddress
            ? (props.shortEvmAddress ?? shortAddress(props.evmAddress))
            : "Nenhuma carteira EVM conectada"}
        </p>
      </div>

      <div className="mt-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
          USDGLO Celo Mainnet
        </p>
        <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
          Pagamentos em USDGLO usam carteira EVM na rede Celo.
        </p>
        <p className="mt-2 text-xs font-semibold text-[var(--color-text)]">
          Destino:{" "}
          {validateCeloWallet(props.destinationWallet)
            ? shortAddress(props.destinationWallet ?? "")
            : "não configurado"}
        </p>
        <UsdgloCeloStatusMessage destinationWallet={props.destinationWallet} />
      </div>
    </div>
  );
}

function PixPanel(props: {
  project: ProjectDTO | null;
  displayProjectName: string;
  feedback: string | null;
  onCopy: () => Promise<boolean>;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-4",
        props.compact ? "mt-5" : "",
      ].join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
        Doação via PIX
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
        Doações via PIX são feitas diretamente para a organização responsável
        pelo projeto, fora da blockchain.
      </p>

      {props.project?.pixKey || props.project?.pixQrCodeUrl ? (
        <div className="mt-4 grid gap-4">
          {props.project.pixKey ? (
            <div className="rounded-xl bg-[var(--color-surface)] px-3 py-3">
              <p className="text-xs font-semibold text-[var(--color-text-soft)]">
                Chave PIX
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-[var(--color-text)]">
                {props.project.pixKey}
              </p>
              <button
                type="button"
                onClick={() => void props.onCopy()}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-2 text-xs font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-primary)]"
              >
                <span className="material-symbols-outlined text-base">
                  content_copy
                </span>
                Copiar chave PIX
              </button>
            </div>
          ) : null}

          {props.project.pixQrCodeUrl ? (
            <div className="rounded-xl bg-[var(--color-surface)] px-3 py-3">
              <p className="text-xs font-semibold text-[var(--color-text-soft)]">
                QR Code PIX
              </p>
              <img
                src={props.project.pixQrCodeUrl}
                alt={`QR Code PIX do projeto ${props.displayProjectName}`}
                className="mt-3 h-40 w-40 rounded-xl border border-[var(--color-border)] object-cover"
              />
            </div>
          ) : null}

          {props.feedback ? (
            <p className="rounded-xl bg-[var(--color-accent-light)] px-3 py-2 text-xs font-semibold text-[var(--color-primary-dark)]">
              {props.feedback}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-[var(--color-surface)] px-3 py-3 text-sm leading-6 text-[var(--color-text-muted)]">
          PIX ainda não configurado para este projeto.
        </p>
      )}
    </div>
  );
}

function normalizePrimaryAsset(
  project: ProjectDTO | null | undefined,
): CurrencyCode {
  if (project?.moedaPrincipal === "PIX" || project?.goalAsset === "PIX") {
    return "PIX";
  }

  if (project?.moedaPrincipal === "BRZ" || project?.goalAsset === "BRZ") {
    return "BRZ";
  }

  return "USDGLO";
}

function formatDocument(value: string, type: DonorType) {
  const digits = value.replace(/\D/g, "");

  if (type === "PF") {
    return digits
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  return digits
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function isValidCPF(value: string) {
  const cpf = value.replace(/\D/g, "");

  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;

  for (let i = 0; i < 9; i += 1) {
    sum += Number(cpf[i]) * (10 - i);
  }

  let firstDigit = (sum * 10) % 11;
  if (firstDigit === 10) firstDigit = 0;
  if (firstDigit !== Number(cpf[9])) return false;

  sum = 0;

  for (let i = 0; i < 10; i += 1) {
    sum += Number(cpf[i]) * (11 - i);
  }

  let secondDigit = (sum * 10) % 11;
  if (secondDigit === 10) secondDigit = 0;

  return secondDigit === Number(cpf[10]);
}

function isValidCNPJ(value: string) {
  const cnpj = value.replace(/\D/g, "");

  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  const calculateDigit = (base: string, weights: number[]) => {
    const sum = weights.reduce((acc, weight, index) => {
      return acc + Number(base[index]) * weight;
    }, 0);

    const remainder = sum % 11;

    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const firstDigit = calculateDigit(cnpj.slice(0, 12), firstWeights);
  const secondDigit = calculateDigit(cnpj.slice(0, 13), secondWeights);

  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13]);
}

function shortAddress(value: string): string {
  if (value.length <= 14) return value;
  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

function formatMetricCurrencyLabel(
  currency: string | undefined,
  fallback: ProjectFundingAsset,
) {
  const normalized = currency?.trim().toUpperCase();

  if (normalized === "USDGLO") return "USDGLO";
  if (normalized === "PIX") return "PIX";
  if (normalized === "BRZ") return "BRZ";

  return formatProjectFundingAssetLabel(fallback);
}

function formatProjectFundingAssetLabel(asset: ProjectFundingAsset) {
  if (asset === "USDGLO") return "USDGLO";
  if (asset === "PIX") return "PIX";
  if (asset === "BRZ") return "BRZ";

  return formatDemoCurrencyLabel(asset);
}
