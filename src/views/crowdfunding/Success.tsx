import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getDonationReceipt,
  listNftCatalog,
  type DonationReceiptDTO,
  type NftCatalogItemDTO,
} from "../../util/crowdfundingApi";
import { resolveNftGradient } from "../../util/nftVisuals";
import {
  buildNftTokenExplorerUrl,
  buildTransactionExplorerUrl,
  getExplorerLabel,
  isValidTxHash,
} from "../../util/explorerLinks";
import {
  formatDemoCurrencyLabel,
  type DemoCurrencyCode,
} from "../../util/projectDemoMetadata";

export default function Success() {
  const [searchParams] = useSearchParams();
  const initialProjectName = searchParams.get("projeto")?.trim() ?? "";
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [receiptTxHash, setReceiptTxHash] = useState<string | null>(
    searchParams.get("txHash"),
  );
  const [projectName, setProjectName] = useState(initialProjectName);
  const [catalog, setCatalog] = useState<NftCatalogItemDTO[]>([]);
  const [receipt, setReceipt] = useState<DonationReceiptDTO | null>(null);
  const [receiptNotice, setReceiptNotice] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const donationId = searchParams.get("donationId")?.trim() ?? "";
  const valorDoadoXLM = Number(searchParams.get("xlm")) || 0;
  const moeda = parseDemoCurrency(searchParams.get("moeda"));
  const receiptAmount = Number(receipt?.amount);
  const valorSimulado =
    (Number.isFinite(receiptAmount) && receiptAmount > 0
      ? receiptAmount
      : Number(searchParams.get("valor"))) || valorDoadoXLM;
  const mainnetAsset =
    receipt?.asset ?? searchParams.get("asset")?.toUpperCase() ?? moeda;
  const paymentNetwork = parsePaymentNetwork(
    receipt?.network ?? searchParams.get("rede"),
  );
  const isCeloMainnetPayment = paymentNetwork === "celo-mainnet";
  const isStellarMainnetPayment = paymentNetwork === "stellar-mainnet";
  const isStellarTestnetPayment =
    paymentNetwork === "stellar-testnet" || paymentNetwork === "demo";
  const isUsdcMainnetPayment =
    isStellarMainnetPayment && mainnetAsset === "USDC";
  const isXlmMainnetPayment = isStellarMainnetPayment && mainnetAsset === "XLM";
  const moedaLabel = getSuccessAssetLabel({
    asset: mainnetAsset,
    moeda,
    paymentNetwork,
  });
  const technicalSettlementLabel = getTechnicalSettlementLabel({
    asset: mainnetAsset,
    moeda,
    paymentNetwork,
  });
  const nftId = Number(searchParams.get("nftId")) || 0;
  const donorWallet =
    receipt?.walletAddress || searchParams.get("wallet")?.trim() || null;
  const destinationWallet =
    receipt?.destinationAddress || searchParams.get("destino")?.trim() || null;
  const receiptCreatedAt = receipt?.createdAt ?? confirmedAt;
  const projetoNome =
    projectName ||
    (donationId ? `Campanha #${donationId}` : "Campanha apoiada");

  const cotacaoXLM = 0.5432;
  const valorTotalBRL = isCeloMainnetPayment
    ? valorSimulado * 5.2
    : isUsdcMainnetPayment
      ? valorSimulado * 5.2
      : isXlmMainnetPayment
        ? valorSimulado * cotacaoXLM
        : valorDoadoXLM * cotacaoXLM;

  const taxaAdminPct = 0.007;
  const valorTaxa = valorTotalBRL * taxaAdminPct;
  const valorLiquido = valorTotalBRL - valorTaxa;

  const nftData = useMemo(() => {
    if (catalog.length === 0) return null;
    return catalog.find((item) => item.id === nftId) ?? null;
  }, [catalog, nftId]);
  const nftGradient = nftData
    ? resolveNftGradient(nftData.gradient)
    : "from-slate-700 to-slate-900";
  const stellarExpertSegment = getStellarExpertSegment(paymentNetwork);
  const stellarTxHash =
    stellarExpertSegment && isValidTxHash(receiptTxHash)
      ? receiptTxHash?.trim()
      : null;
  const txExplorerUrl = stellarTxHash
    ? `https://stellar.expert/explorer/${stellarExpertSegment}/tx/${stellarTxHash}`
    : buildTransactionExplorerUrl(receiptTxHash);
  const nftExplorerUrl = buildNftTokenExplorerUrl(nftId);
  const explorerLabel = stellarExpertSegment
    ? "explorador da rede"
    : getExplorerLabel();
  const isReceiptConfirmed =
    receipt?.status === "CONFIRMED" ||
    Boolean(receiptTxHash && isCeloMainnetPayment);
  const receiptStatusLabel = isReceiptConfirmed
    ? isCeloMainnetPayment
      ? "Confirmado na Celo"
      : "Registro confirmado"
    : "Pendente";
  const formattedDateTime = formatDate(receiptCreatedAt);
  const fullTransactionLink = txExplorerUrl ?? null;

  useEffect(() => {
    void listNftCatalog()
      .then(setCatalog)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!donationId) return;
    let active = true;
    let attempts = 0;
    let timeout: number | undefined;

    async function loadReceipt() {
      attempts += 1;

      try {
        const nextReceipt = await getDonationReceipt(donationId);
        if (!active) return;

        setReceipt(nextReceipt);
        setConfirmedAt(nextReceipt.confirmedAt ?? nextReceipt.createdAt);
        setReceiptTxHash(nextReceipt.txHash);
        setReceiptNotice(null);
        if (nextReceipt.projectName) {
          setProjectName(nextReceipt.projectName);
        }
      } catch {
        if (!active) return;

        if (attempts < 6) {
          timeout = window.setTimeout(() => {
            void loadReceipt();
          }, 1500);
          return;
        }

        setReceiptNotice(
          "Registro salvo. Atualize a página em instantes se os detalhes ainda não aparecerem.",
        );
      }
    }

    void loadReceipt();

    return () => {
      active = false;
      if (timeout) window.clearTimeout(timeout);
    };
  }, [donationId]);

  const handleCopy = async (key: string, value: string | null | undefined) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      setReceiptNotice("Não foi possível copiar automaticamente.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-6 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-emerald-50 p-12 text-center space-y-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              Impacto Confirmado
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
              Sua contribuição para {projetoNome} foi registrada
            </p>
          </div>

          <div className="p-12 space-y-8">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
                {isCeloMainnetPayment || isStellarMainnetPayment
                  ? "VALOR TOTAL CONFIRMADO"
                  : "VALOR TOTAL SIMULADO"}
              </p>
              <h2 className="text-5xl font-black text-[#002B99] tracking-tighter mt-2">
                {valorSimulado.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                {moedaLabel}
              </h2>
              {isCeloMainnetPayment ? (
                <p className="text-xs font-black text-slate-400 mt-2">
                  Liquidação: {moedaLabel} na Celo Mainnet
                </p>
              ) : isStellarMainnetPayment ? (
                <p className="text-xs font-black text-slate-400 mt-2">
                  Liquidação registrada em rede principal
                </p>
              ) : isStellarTestnetPayment ? (
                <p className="text-xs font-black text-slate-400 mt-2">
                  Equivalente técnico: {valorDoadoXLM.toFixed(2)}{" "}
                  {technicalSettlementLabel}
                </p>
              ) : (
                <p className="text-xs font-black text-slate-400 mt-2">
                  Liquidação registrada em ambiente demonstrativo
                </p>
              )}
            </div>

            <div className="space-y-4 text-xs font-black uppercase tracking-widest">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Status</span>
                <span
                  className={
                    isReceiptConfirmed ? "text-emerald-600" : "text-orange-500"
                  }
                >
                  {receiptStatusLabel}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">ID do comprovante</span>
                <CopyValue
                  copyKey="donation-id"
                  label={
                    donationId || String(receipt?.id ?? "") || "Não disponível"
                  }
                  value={donationId || String(receipt?.id ?? "") || null}
                  copiedKey={copiedKey}
                  onCopy={handleCopy}
                />
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Hash da transação</span>
                <CopyValue
                  copyKey="tx-hash"
                  label={receiptTxHash ? shortHash(receiptTxHash) : "PENDENTE"}
                  value={receiptTxHash}
                  copiedKey={copiedKey}
                  onCopy={handleCopy}
                  href={txExplorerUrl}
                  title={`Abrir no ${explorerLabel}`}
                />
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Data e Hora</span>
                <CopyValue
                  copyKey="date-time"
                  label={formattedDateTime}
                  value={
                    formattedDateTime !== "PENDENTE" ? formattedDateTime : null
                  }
                  copiedKey={copiedKey}
                  onCopy={handleCopy}
                />
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Wallet apoiadora</span>
                <CopyValue
                  copyKey="donor-wallet"
                  label={
                    donorWallet ? shortHash(donorWallet) : "Não disponível"
                  }
                  value={donorWallet}
                  copiedKey={copiedKey}
                  onCopy={handleCopy}
                />
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Wallet recebedora</span>
                <CopyValue
                  copyKey="destination-wallet"
                  label={
                    destinationWallet
                      ? shortHash(destinationWallet)
                      : "Não disponível"
                  }
                  value={destinationWallet}
                  copiedKey={copiedKey}
                  onCopy={handleCopy}
                />
              </div>
              {fullTransactionLink ? (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Explorer</span>
                  <CopyValue
                    copyKey="explorer-link"
                    label={
                      isCeloMainnetPayment
                        ? "Ver transação na Celo"
                        : "Ver transação"
                    }
                    value={fullTransactionLink}
                    copiedKey={copiedKey}
                    onCopy={handleCopy}
                    href={fullTransactionLink}
                    title={`Abrir no ${explorerLabel}`}
                  />
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Rede</span>
                <span className="text-slate-900">
                  {formatNetworkLabel(paymentNetwork)}
                </span>
              </div>
              {receiptNotice ? (
                <p className="rounded-2xl bg-orange-50 px-4 py-3 text-[11px] leading-5 text-orange-700 normal-case tracking-normal">
                  {receiptNotice}
                </p>
              ) : null}
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">
                  Taxas Operacionais (0,7%)
                </span>
                <span className="text-rose-500">
                  - R${" "}
                  {valorTaxa.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="pt-4 border-t border-slate-200 flex justify-between gap-4">
                <span className="text-slate-400">Valor líquido no projeto</span>
                <span className="text-emerald-600 text-xl">
                  R${" "}
                  {valorLiquido.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="block w-full bg-[#002B99] hover:bg-blue-800 text-white font-black py-4 rounded-2xl text-center text-[11px] uppercase tracking-[0.3em]"
            >
              Acessar meu painel
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div
            className={`relative aspect-square bg-slate-900 bg-gradient-to-br ${nftGradient} overflow-hidden text-white`}
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/20 rounded-full blur-3xl -mr-24 -mt-24" />
            <div className="absolute bottom-0 left-0 w-[26rem] h-[26rem] bg-black/30 rounded-full blur-[90px] -ml-32 -mb-32" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />

            <div className="relative h-full flex flex-col items-center justify-center p-10 text-center space-y-5 z-10">
              <div className="absolute top-8 right-8 bg-white text-slate-900 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-2">
                <span className="material-icons text-sm">stars</span>
                Registro emitido
              </div>

              <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-[1.5rem] border border-white/25 flex items-center justify-center">
                <span className="material-icons text-6xl">
                  {nftData ? nftData.icon : "receipt_long"}
                </span>
              </div>

              <h3 className="text-5xl font-black uppercase leading-none tracking-tighter drop-shadow-md">
                {nftData ? nftData.name : "Registro confirmado"}
              </h3>
              <h4 className="text-2xl font-black uppercase tracking-[0.2em] opacity-80">
                {nftData
                  ? `ID #${nftId.toString().padStart(2, "0")}`
                  : donationId
                    ? `Comprovante #${donationId}`
                    : "Comprovante emitido"}
              </h4>
              <p className="text-[11px] font-black tracking-[0.35em] uppercase opacity-95">
                CONTRIBUIÇÃO: {valorSimulado.toFixed(2)} {moedaLabel}
              </p>
            </div>
          </div>

          <div className="p-10 space-y-7 text-center">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
              Seu comprovante de impacto
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed font-black uppercase tracking-[0.3em]">
              Este registro de impacto comprova que você ajudou a transformar{" "}
              {projetoNome} em realidade.
            </p>
            <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 text-left space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
                  COLEÇÃO DO PROJETO
                </span>
                <span className="text-[10px] font-black uppercase text-orange-500 tracking-[0.3em]">
                  {nftData
                    ? `RARIDADE: ${nftData.rarity}`
                    : "REGISTRO OFF-CHAIN"}
                </span>
              </div>
              <p className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none mt-2">
                PONTEIA • {projetoNome}
              </p>
              <div className="pt-3 border-t border-slate-200">
                {nftExplorerUrl ? (
                  <a
                    href={nftExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-black uppercase tracking-[0.2em] text-[#002B99] hover:underline inline-flex items-center gap-1"
                    title={`Abrir NFT no ${explorerLabel}`}
                  >
                    Ver registro no {explorerLabel}
                    <span className="material-icons text-sm">open_in_new</span>
                  </a>
                ) : (
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Registro indisponível no explorer
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function parseDemoCurrency(value: string | null): DemoCurrencyCode {
  if (value === "BRZ" || value === "XLM") return value;
  return "BRZ";
}

function CopyValue(props: {
  copyKey: string;
  label: string;
  value: string | null | undefined;
  copiedKey: string | null;
  onCopy: (key: string, value: string | null | undefined) => Promise<void>;
  href?: string | null;
  title?: string;
}) {
  const content = props.href ? (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-[#002B99] hover:underline inline-flex items-center gap-1"
      title={props.title}
    >
      {props.label}
      <span className="material-icons text-sm">open_in_new</span>
    </a>
  ) : (
    <span className="font-mono text-slate-900">{props.label}</span>
  );

  return (
    <span className="flex max-w-[60%] flex-wrap items-center justify-end gap-2 text-right">
      {content}
      {props.value ? (
        <button
          type="button"
          onClick={() => void props.onCopy(props.copyKey, props.value)}
          className="rounded-full border border-slate-200 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 transition hover:border-[#002B99] hover:text-[#002B99]"
        >
          {props.copiedKey === props.copyKey ? "Copiado" : "Copiar"}
        </button>
      ) : null}
    </span>
  );
}

type PaymentNetwork =
  | "celo-mainnet"
  | "stellar-mainnet"
  | "stellar-testnet"
  | "demo";

function parsePaymentNetwork(value: string | null): PaymentNetwork {
  if (value === "celo-mainnet") {
    return value;
  }

  if (value === "stellar-mainnet" || value === "stellar-testnet") {
    return value;
  }

  return "demo";
}

function getSuccessAssetLabel(input: {
  asset: string;
  moeda: DemoCurrencyCode;
  paymentNetwork: PaymentNetwork;
}) {
  if (input.asset === "CELO") return "CELO";
  if (input.asset === "USDC") return "USDC";
  if (input.paymentNetwork === "celo-mainnet" || input.asset === "USDGLO") {
    return "USDGLO";
  }

  if (input.paymentNetwork === "stellar-mainnet") {
    return "Ativo legado";
  }

  if (input.paymentNetwork === "stellar-testnet" || input.moeda === "XLM") {
    return input.asset === "USDGLO" ? "USDGLO" : "Ativo legado";
  }

  return formatDemoCurrencyLabel(input.moeda);
}

function getTechnicalSettlementLabel(input: {
  asset: string;
  moeda: DemoCurrencyCode;
  paymentNetwork: PaymentNetwork;
}) {
  if (input.paymentNetwork === "celo-mainnet" || input.asset === "USDGLO") {
    return `${getSuccessAssetLabel(input)} Celo Mainnet`;
  }

  if (input.paymentNetwork === "stellar-mainnet") {
    return "registro em rede principal";
  }

  return "ambiente legado";
}

function formatNetworkLabel(value: PaymentNetwork) {
  if (value === "celo-mainnet") return "Celo Mainnet";
  if (value === "stellar-mainnet") return "Rede principal legada";
  if (value === "stellar-testnet") return "Rede de teste legada";
  return "Demonstração";
}

function getStellarExpertSegment(paymentNetwork: PaymentNetwork) {
  if (paymentNetwork === "stellar-mainnet") return "public";
  if (paymentNetwork !== "stellar-testnet") return null;
  return "testnet";
}

function shortHash(hash: string) {
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
}

function formatDate(value: string | null) {
  if (!value) return "PENDENTE";
  const date = new Date(value);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
