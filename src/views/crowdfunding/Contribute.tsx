import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Buffer } from "buffer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDonations } from "../../providers/DonationProvider";
import { useWallet } from "../../hooks/useWallet";
import { usePrivyWalletAbstraction } from "../../hooks/usePrivyWalletAbstraction";
import { connectWallet } from "../../util/wallet";
import { createCrowdfundingClient } from "../../contracts/crowdfunding_core";
import {
  listProjectMedia,
  listProjects,
  prepareDonation,
  submitDonation,
  type ProjectDTO,
  type ProjectMediaItemDTO,
} from "../../util/crowdfundingApi";
import {
  formatDemoCurrencyLabel,
  webSummitDemoCurrencyNote,
  type DemoCurrencyCode,
} from "../../util/projectDemoMetadata";
import {
  getStellarUsdcMainnetConfig,
  prepareStellarUsdcMainnetPayment,
  submitStellarUsdcMainnetSignedXdr,
} from "../../util/stellarUsdcMainnet";

import MqcCardImg from "../../images/projects-page/cards/mqc-edicao-2.jpeg";
import EloMeCardImg from "../../images/projects-page/cards/elo-me.png";
import StellarbridgeCardImg from "../../images/projects-page/cards/stellarbridge.png";
import KarnCardImg from "../../images/projects-page/cards/karn.png";
import VizinhancaCardImg from "../../images/projects-page/cards/vizinhanca-cuidadora.png";
import Web3CardImg from "../../images/projects-page/cards/web3-lideranca.jpeg";
import FormacaoCardImg from "../../images/projects-page/cards/formacaoMulheres.jpeg";

type DonorType = "PF" | "PJ";
type CurrencyCode = DemoCurrencyCode;

type CurrencyOption = {
  code: CurrencyCode;
  name: string;
  description: string;
  brlRate: number;
  xlmRate: number;
  status: "active" | "soon";
};

const currencyOptions: CurrencyOption[] = [
  {
    code: "USDC",
    name: "USDC",
    description: "Moeda principal de contribuição da demonstração",
    brlRate: 5.2,
    xlmRate: 5.2 / 0.5432,
    status: "active",
  },
  {
    code: "BRZ",
    name: "BRZ",
    description: "Stablecoin de real para o contexto Web Summit",
    brlRate: 1,
    xlmRate: 1 / 0.5432,
    status: "active",
  },
  {
    code: "XLM",
    name: "XLM Testnet",
    description: "Apenas para teste na rede de teste Stellar",
    brlRate: 0.5432,
    xlmRate: 1,
    status: "active",
  },
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

type DonationSignTransaction = ReturnType<typeof useWallet>["signTransaction"];

type DonationAssembledTransaction = {
  signAndSend: (input: {
    signTransaction: DonationSignTransaction;
  }) => Promise<unknown>;
};

type CrowdfundingClientLike = {
  get_project: (input: { project_id: bigint }) => Promise<unknown>;
  donate: (input: {
    donor: string;
    project_id: bigint;
    donor_type: number;
    donor_doc_hash: Buffer;
    amount_stroops: bigint;
  }) => Promise<DonationAssembledTransaction>;
};

type SentDonationTransaction = {
  result?: unknown;
  sendTransactionResponse?: {
    hash?: string;
  };
  getTransactionResponse?: {
    txHash?: string;
  };
};

export default function Contribute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addDonation } = useDonations();
  const { address, balances, network, signTransaction } = useWallet();
  const privyWallet = usePrivyWalletAbstraction();

  const projetoId = searchParams.get("projeto") || "1";
  const projetoNomeParam = searchParams.get("nome")?.trim() ?? "";

  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [projectMedia, setProjectMedia] = useState<ProjectMediaItemDTO | null>(
    null,
  );

  const [tipoDoador, setTipoDoador] = useState<DonorType>("PF");
  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyCode>("USDC");
  const [contributionValue, setContributionValue] = useState("100");
  const [identificacao, setIdentificacao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayProjectName =
    project?.title || projetoNomeParam || `Campanha #${projetoId}`;

  const projectImage =
    projectImages[projetoId] ?? projectMedia?.img ?? MqcCardImg.src;

  const currency = useMemo(() => {
    return (
      currencyOptions.find((option) => option.code === selectedCurrency) ??
      currencyOptions[0]
    );
  }, [selectedCurrency]);
  const projectCurrency = project?.moedaPrincipal ?? "USDC";
  const projectCurrencyLabel = formatDemoCurrencyLabel(projectCurrency);
  const stellarUsdcConfig = useMemo(() => getStellarUsdcMainnetConfig(), []);

  const numericContribution = Number(contributionValue || 0);
  const amountBRL = numericContribution * currency.brlRate;
  const amountXlm = numericContribution * currency.xlmRate;
  const valorBRL = amountBRL.toFixed(2);
  const isStellarUsdcMainnetConfigured =
    selectedCurrency === "USDC" && stellarUsdcConfig.enabled;
  const hasPrivyStellarAddress = Boolean(
    privyWallet.stellarAddress?.startsWith("G"),
  );
  const hasPaymentStellarAddress = Boolean(address?.startsWith("G"));
  const canUseStellarUsdcMainnet =
    isStellarUsdcMainnetConfigured && hasPaymentStellarAddress;
  const isStellarUsdcMainnetBlocked =
    isStellarUsdcMainnetConfigured && !canUseStellarUsdcMainnet;
  const showStellarUsdcMainnetInfo = selectedCurrency === "USDC";
  const submitButtonLabel = isSubmitting
    ? "Processando..."
    : isStellarUsdcMainnetBlocked
      ? "Conecte Freighter para USDC Stellar"
      : "Confirmar doação";

  const progressPercent = project
    ? Math.min(
        100,
        Math.round(
          (Number(project.raisedXlm) / Number(project.targetXlm)) * 100,
        ),
      )
    : 0;

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

  const handleIdentificacaoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIdentificacao(formatDocument(event.target.value, tipoDoador));
  };

  const handlePrivyLogin = () => {
    void Promise.resolve()
      .then(() => privyWallet.login())
      .catch(() => undefined);
  };

  const handleConfirmarDoacao = async () => {
    if (isStellarUsdcMainnetBlocked) {
      alert(
        "Para concluir a doação em USDC Stellar, conecte sua carteira Freighter.",
      );
      return;
    }

    if (!canUseStellarUsdcMainnet && !address) {
      alert("Conecte sua carteira antes de continuar.");
      return;
    }

    if (!identificacao) {
      alert(`Informe seu ${tipoDoador === "PF" ? "CPF" : "CNPJ"}.`);
      return;
    }

    if (!isDocumentValid) {
      alert(`Informe um ${tipoDoador === "PF" ? "CPF" : "CNPJ"} válido.`);
      return;
    }

    if (numericContribution <= 0) {
      alert("Informe um valor de doação válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const donorDocHash = await hashStringHex(
        identificacao.replace(/\D/g, ""),
      );

      if (canUseStellarUsdcMainnet) {
        const paymentStellarAddress = address;

        if (!paymentStellarAddress?.startsWith("G")) {
          throw new Error(
            "Para concluir a doação em USDC Stellar, conecte sua carteira Freighter.",
          );
        }

        const preparedPayment = await prepareStellarUsdcMainnetPayment({
          sourcePublicKey: paymentStellarAddress,
          amount: numericContribution,
          projectId: Number(projetoId),
          donorType: tipoDoador,
        });
        const signedPayment = await signTransaction(
          preparedPayment.transaction.toXDR(),
          {
            networkPassphrase: preparedPayment.networkPassphrase,
            address: paymentStellarAddress,
          },
        );

        if (
          signedPayment.signerAddress &&
          signedPayment.signerAddress !== paymentStellarAddress
        ) {
          throw new Error(
            "A assinatura não corresponde à carteira de pagamento Stellar conectada.",
          );
        }

        const paymentResult = await submitStellarUsdcMainnetSignedXdr({
          preparedPayment,
          signerPublicKey: paymentStellarAddress,
          signedTxXdr: signedPayment.signedTxXdr,
        });
        const donationId = Date.now();

        await addDonation({
          id: donationId,
          projectId: projetoId,
          projectName: displayProjectName,
          amount: paymentResult.amount,
          amountBRL: valorBRL,
          timestamp: donationId,
          nftId: 0,
          donorType: tipoDoador,
          walletAddress: paymentStellarAddress,
          txHash: paymentResult.txHash,
        });

        void navigate(
          `/sucesso?donationId=${donationId}&txHash=${paymentResult.txHash}&nftId=0&xlm=0&moeda=USDC&valor=${numericContribution}&tipo=${tipoDoador}&rede=stellar-mainnet&projeto=${encodeURIComponent(
            displayProjectName,
          )}`,
        );
        return;
      }

      if (!address) {
        throw new Error("Conecte sua carteira antes de continuar.");
      }

      const prepared = await prepareDonation({
        projectId: Number(projetoId),
        donorType: tipoDoador,
        donorDocHash,
        amountXlm,
        walletAddress: address,
      });

      const chainResult = await executeOnChainDonation({
        walletAddress: address,
        projectId: Number(projetoId),
        donorType: tipoDoador,
        donorDocHash,
        amountXlm,
        signTransaction,
      });

      await submitDonation({
        donationId: prepared.donationId,
        txHash: chainResult.txHash,
        nftId: chainResult.nftId,
        contractDonationId: String(chainResult.contractDonationId),
      });

      await addDonation({
        id: String(prepared.donationId),
        projectId: projetoId,
        projectName: displayProjectName,
        amount: amountXlm.toFixed(7),
        amountBRL: valorBRL,
        timestamp: Date.now(),
        nftId: chainResult.nftId,
        donorType: tipoDoador,
        walletAddress: address,
        txHash: chainResult.txHash,
      });

      void navigate(
        `/sucesso?donationId=${prepared.donationId}&txHash=${chainResult.txHash}&nftId=${chainResult.nftId}&xlm=${amountXlm.toFixed(
          7,
        )}&moeda=${selectedCurrency}&valor=${numericContribution}&tipo=${tipoDoador}&projeto=${encodeURIComponent(
          displayProjectName,
        )}`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao processar doação.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
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
      } catch {
        setProject(null);
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
            onClick={() => {
              void navigate("/projetos");
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)]"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            Voltar para projetos
          </button>

          <span className="hidden rounded-full border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-2 text-xs font-medium text-[var(--color-text-muted)] sm:inline-flex">
            Ambiente de contribuição
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
                      Demonstração Stellar
                    </span>
                  </div>

                  <h1 className="font-[var(--font-heading)] text-4xl font-bold leading-tight tracking-tight text-[var(--color-white)] sm:text-5xl">
                    {displayProjectName}
                  </h1>

                  <p className="mt-5 max-w-2xl text-base leading-8 text-white/78">
                    {project?.description ??
                      "Projeto selecionado na plataforma Mulheres Que Codam para receber apoio financeiro e fortalecer iniciativas lideradas por mulheres."}
                  </p>
                </div>
              </div>
            </div>

            <aside className="bg-[var(--color-white)] p-6 sm:p-8">
              <div className="rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
                  Progresso da campanha
                </p>

                <div className="mt-5 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-semibold text-[var(--color-text)]">
                      {progressPercent}%
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      alcançado
                    </p>
                  </div>

                  <div>
                    <p className="text-2xl font-semibold text-[var(--color-text)]">
                      {Number(project?.raisedXlm ?? 0).toLocaleString("pt-BR", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {projectCurrencyLabel} captados
                    </p>
                  </div>

                  <div>
                    <p className="text-2xl font-semibold text-[var(--color-text)]">
                      {Number(project?.targetXlm ?? 0).toLocaleString("pt-BR", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {projectCurrencyLabel} meta
                    </p>
                  </div>
                </div>

                <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-[0_16px_45px_rgba(15,0,161,0.08)]">
                <div className="border-b border-[var(--color-border)] pb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">
                    Contribuição
                  </p>

                  <h2 className="mt-2 font-[var(--font-heading)] text-2xl font-semibold text-[var(--color-text)]">
                    Apoiar projeto
                  </h2>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-soft)]">
                      Tipo de doador
                    </label>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {(["PF", "PJ"] as DonorType[]).map((type) => {
                        const isActive = tipoDoador === type;

                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setTipoDoador(type)}
                            className={[
                              "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                              isActive
                                ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                                : "border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]",
                            ].join(" ")}
                          >
                            {type === "PF"
                              ? "Pessoa Física"
                              : "Pessoa Jurídica"}
                          </button>
                        );
                      })}
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

                    <div className="mt-3 rounded-2xl bg-[var(--color-surface)] p-4">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-[var(--color-text-muted)]">
                          Conversão estimada
                        </span>

                        <span className="font-semibold text-[var(--color-text)]">
                          R${" "}
                          {amountBRL.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-4 text-xs">
                        <span className="text-[var(--color-text-soft)]">
                          {isStellarUsdcMainnetConfigured
                            ? "Valor a enviar na Mainnet"
                            : "Equivalente técnico na Testnet"}
                        </span>

                        <span className="font-medium text-[var(--color-primary)]">
                          {isStellarUsdcMainnetConfigured
                            ? `${numericContribution.toFixed(7)} USDC`
                            : `${amountXlm.toFixed(4)} XLM Testnet`}
                        </span>
                      </div>

                      <p className="mt-3 rounded-xl bg-[var(--color-accent-light)] px-3 py-2 text-xs leading-5 text-[var(--color-primary-dark)]">
                        {isStellarUsdcMainnetConfigured
                          ? "Pagamentos em USDC Mainnet usam a carteira de pagamento Stellar conectada. BRZ segue informativo e XLM permanece como teste/Testnet."
                          : webSummitDemoCurrencyNote}
                      </p>
                    </div>
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

                  {privyWallet.isUsingPrivy ? (
                    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
                            Carteira via Privy
                          </p>

                          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                            Privy é usado para login social e identificação da
                            apoiadora. Para pagamentos em USDC na Stellar
                            Mainnet, conecte uma carteira Stellar compatível,
                            como Freighter.
                          </p>
                        </div>

                        {!privyWallet.authenticated ? (
                          <button
                            type="button"
                            onClick={handlePrivyLogin}
                            disabled={!privyWallet.ready}
                            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-white)] transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
                          >
                            Entrar com Privy
                          </button>
                        ) : null}
                      </div>

                      {privyWallet.authenticated ? (
                        <div className="mt-3 grid gap-3">
                          <div className="rounded-xl bg-[var(--color-surface)] px-3 py-2">
                            <p className="text-xs font-semibold text-[var(--color-text-soft)]">
                              Carteira EVM conectada
                            </p>

                            <p className="mt-1 text-xs font-semibold text-[var(--color-text)]">
                              EVM{" "}
                              {privyWallet.shortEvmAddress ?? "Conta conectada"}
                            </p>
                          </div>

                          {hasPrivyStellarAddress ? (
                            <div className="rounded-xl border border-[var(--color-accent)]/45 bg-[var(--color-accent-light)] px-3 py-3">
                              <p className="text-xs font-semibold text-[var(--color-primary)]">
                                Carteira Stellar do Privy detectada
                              </p>

                              <p className="mt-1 text-xs font-semibold text-[var(--color-text)]">
                                Privy Stellar {privyWallet.shortStellarAddress}
                              </p>

                              <p className="mt-2 text-xs leading-5 text-[var(--color-primary-dark)]">
                                Esta carteira não será usada automaticamente
                                para pagamento. Para a doação em USDC Stellar,
                                use a carteira de pagamento conectada abaixo.
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {showStellarUsdcMainnetInfo ? (
                        <div className="mt-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
                            USDC Stellar Mainnet
                          </p>

                          <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                            {isStellarUsdcMainnetConfigured
                              ? "Fluxo real preparado para USDC na Stellar Mainnet com assinatura da carteira de pagamento Stellar."
                              : "USDC permanece em modo demonstração/Testnet até a configuração pública de Mainnet estar completa."}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
                      Carteira de pagamento Stellar
                    </p>

                    {address ? (
                      <>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-success)]">
                          Carteira de pagamento conectada
                        </p>

                        <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                          {shortAddress(address)}
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                          {balances?.xlm?.balance ?? "-"} XLM Testnet
                          {network ? ` • ${network}` : ""}
                        </p>

                        {!hasPaymentStellarAddress ? (
                          <p className="mt-3 rounded-xl bg-[var(--color-accent-light)] px-3 py-2 text-xs leading-5 text-[var(--color-primary-dark)]">
                            Para concluir a doação em USDC Stellar, conecte uma
                            carteira Freighter com endereço Stellar válido.
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                          {isStellarUsdcMainnetConfigured
                            ? "Conecte sua carteira Freighter para pagar com USDC na Stellar Mainnet."
                            : "Conecte sua carteira Stellar para continuar no modo de demonstração/Testnet."}
                        </p>

                        {isStellarUsdcMainnetConfigured &&
                        privyWallet.authenticated ? (
                          <p className="mt-3 rounded-xl bg-[var(--color-accent-light)] px-3 py-2 text-xs leading-5 text-[var(--color-primary-dark)]">
                            Para concluir a doação em USDC Stellar, conecte sua
                            carteira Freighter.
                          </p>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => void connectWallet()}
                          className="mt-4 w-full rounded-full bg-[var(--color-black)] px-6 py-4 text-sm font-semibold text-[var(--color-white)] transition hover:bg-[var(--color-primary)]"
                        >
                          {isStellarUsdcMainnetConfigured
                            ? "Conectar Freighter"
                            : "Conectar carteira"}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void handleConfirmarDoacao();
                    }}
                    disabled={isSubmitting || isStellarUsdcMainnetBlocked}
                    className="w-full rounded-full bg-[var(--color-primary)] px-6 py-4 text-sm font-semibold text-[var(--color-white)] shadow-[0_12px_34px_rgba(15,0,161,0.25)] transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitButtonLabel}
                  </button>

                  <p className="text-center text-[11px] leading-5 text-[var(--color-text-soft)]">
                    Ao prosseguir, você concorda com os Termos de Uso. A
                    conversão é estimada e poderá variar conforme a integração
                    de ativos.
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
                  text: "A plataforma usa infraestrutura Stellar para registrar e acompanhar operações com mais rastreabilidade.",
                  icon: "account_tree",
                },
                {
                  title: "Recibo digital",
                  text: "A doação pode gerar registros digitais e comprovantes associados ao projeto apoiado.",
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
              captação e responde pela execução da iniciativa. A plataforma atua
              como ponte tecnológica para doações, transparência e
              acompanhamento de impacto.
            </p>

            {project?.ngoWallet ? (
              <div className="mt-5 rounded-2xl bg-[var(--color-surface)] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-soft)]">
                      Carteira da organização
                    </p>

                    <p className="mt-2 text-sm font-medium text-[var(--color-text)]">
                      {shortAddress(project.ngoWallet)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void navigator.clipboard.writeText(project.ngoWallet)
                    }
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-2 text-xs font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-primary)]"
                  >
                    <span className="material-symbols-outlined text-base">
                      content_copy
                    </span>
                    Copiar
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
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

async function hashStringHex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const buffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const bytes = Array.from(new Uint8Array(digest));

  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function shortAddress(value: string): string {
  if (value.length <= 14) return value;

  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

async function executeOnChainDonation(input: {
  walletAddress: string;
  projectId: number;
  donorType: DonorType;
  donorDocHash: string;
  amountXlm: number;
  signTransaction: DonationSignTransaction;
}) {
  const client = createCrowdfundingClient(
    input.walletAddress,
  ) as CrowdfundingClientLike;

  try {
    await client.get_project({ project_id: BigInt(input.projectId) });
  } catch {
    throw new Error(
      "Projeto ainda não sincronizado no contrato local. Rode o sync on-chain dos projetos e tente novamente.",
    );
  }

  const assembled = await client.donate({
    donor: input.walletAddress,
    project_id: BigInt(input.projectId),
    donor_type: input.donorType === "PF" ? 1 : 2,
    donor_doc_hash: Buffer.from(input.donorDocHash, "hex"),
    amount_stroops: BigInt(Math.round(input.amountXlm * 10_000_000)),
  });

  const sent = (await assembled.signAndSend({
    signTransaction: input.signTransaction,
  })) as SentDonationTransaction;

  const txHash =
    sent.getTransactionResponse?.txHash ??
    sent.sendTransactionResponse?.hash ??
    "";

  const txResult = sent.result;

  if (!txHash || !Array.isArray(txResult) || txResult.length < 2) {
    throw new Error("Falha ao confirmar transação on-chain.");
  }

  return {
    txHash,
    contractDonationId: Number(txResult[0]),
    nftId: Number(txResult[1]),
  };
}
