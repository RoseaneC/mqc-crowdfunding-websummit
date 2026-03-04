import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getDonationReceipt,
  listNftCatalog,
  type NftCatalogItemDTO,
} from "../../util/crowdfundingApi";
import { resolveNftGradient } from "../../util/nftVisuals";
import {
  buildNftTokenExplorerUrl,
  buildTransactionExplorerUrl,
  getExplorerLabel,
} from "../../util/explorerLinks";

export default function Success() {
  const [searchParams] = useSearchParams();
  const initialProjectName = searchParams.get("projeto")?.trim() ?? "";
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [receiptTxHash, setReceiptTxHash] = useState<string | null>(
    searchParams.get("txHash"),
  );
  const [projectName, setProjectName] = useState(initialProjectName);
  const [catalog, setCatalog] = useState<NftCatalogItemDTO[]>([]);

  const donationId = Number(searchParams.get("donationId") ?? "0");
  const valorDoadoXLM = Number(searchParams.get("xlm")) || 0;
  const tipo = searchParams.get("tipo") || "PF";
  const nftId = Number(searchParams.get("nftId")) || 0;
  const projetoNome =
    projectName ||
    (donationId ? `Campanha #${donationId}` : "Campanha apoiada");

  const cotacaoXLM = 0.5432;
  const valorTotalBRL = valorDoadoXLM * cotacaoXLM;

  const taxaAdminPct = tipo === "PF" ? 0.07 : 0.05;
  const valorTaxa = valorTotalBRL * taxaAdminPct;
  const valorLiquido = valorTotalBRL - valorTaxa;

  const nftData = useMemo(() => {
    if (catalog.length === 0) return null;
    return catalog.find((item) => item.id === nftId) ?? null;
  }, [catalog, nftId]);
  const nftGradient = nftData
    ? resolveNftGradient(nftData.gradient)
    : "from-slate-700 to-slate-900";
  const txExplorerUrl = buildTransactionExplorerUrl(receiptTxHash);
  const nftExplorerUrl = buildNftTokenExplorerUrl(nftId);
  const explorerLabel = getExplorerLabel();

  useEffect(() => {
    void listNftCatalog()
      .then(setCatalog)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!donationId) return;
    void getDonationReceipt(donationId)
      .then((receipt) => {
        setConfirmedAt(receipt.confirmedAt);
        setReceiptTxHash(receipt.txHash);
        if (receipt.projectName) {
          setProjectName(receipt.projectName);
        }
      })
      .catch(() => {});
  }, [donationId]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-6 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-emerald-50 p-12 text-center space-y-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              Impacto Confirmado
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
              Sua contribuicao para {projetoNome} foi registrada
            </p>
          </div>

          <div className="p-12 space-y-8">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
                VALOR TOTAL DOADO
              </p>
              <h2 className="text-5xl font-black text-[#002B99] tracking-tighter mt-2">
                R${" "}
                {valorTotalBRL.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </h2>
              <p className="text-xs font-black text-slate-400 mt-2">
                ~ {valorDoadoXLM.toFixed(2)} XLM
              </p>
            </div>

            <div className="space-y-4 text-xs font-black uppercase tracking-widest">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Hash Transaction</span>
                {txExplorerUrl ? (
                  <a
                    href={txExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#002B99] font-mono hover:underline inline-flex items-center gap-1"
                    title={`Abrir no ${explorerLabel}`}
                  >
                    {receiptTxHash ? shortHash(receiptTxHash) : "PENDENTE"}
                    <span className="material-icons text-sm">open_in_new</span>
                  </a>
                ) : (
                  <span className="text-[#002B99] font-mono">
                    {receiptTxHash ? shortHash(receiptTxHash) : "PENDENTE"}
                  </span>
                )}
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Data e Hora</span>
                <span className="text-slate-900">
                  {formatDate(confirmedAt)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">
                  Taxas Operacionais ({tipo === "PF" ? "7%" : "5%"})
                </span>
                <span className="text-rose-500">
                  - R${" "}
                  {valorTaxa.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="pt-4 border-t border-slate-200 flex justify-between gap-4">
                <span className="text-slate-400">Valor Liquido no Projeto</span>
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
              Acessar Meu Dashboard
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
                NFT Mintado
              </div>

              <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-[1.5rem] border border-white/25 flex items-center justify-center">
                <span className="material-icons text-6xl">
                  {nftData ? nftData.icon : "hourglass_empty"}
                </span>
              </div>

              <h3 className="text-5xl font-black uppercase leading-none tracking-tighter drop-shadow-md">
                {nftData ? nftData.name : "NFT em processamento"}
              </h3>
              <h4 className="text-2xl font-black uppercase tracking-[0.2em] opacity-80">
                {nftData
                  ? `ID #${nftId.toString().padStart(2, "0")}`
                  : "Aguardando indexacao"}
              </h4>
              <p className="text-[11px] font-black tracking-[0.35em] uppercase opacity-95">
                DOACAO: {valorDoadoXLM.toFixed(2)} XLM
              </p>
            </div>
          </div>

          <div className="p-10 space-y-7 text-center">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
              Seu Impact NFT
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed font-black uppercase tracking-[0.3em]">
              Este colecionavel digital intransferivel prova que voce ajudou a
              transformar {projetoNome} em realidade.
            </p>
            <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 text-left space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
                  COLECAO DO PROJETO
                </span>
                <span className="text-[10px] font-black uppercase text-orange-500 tracking-[0.3em]">
                  {nftData
                    ? `RARIDADE: ${nftData.rarity}`
                    : "RARIDADE: PENDENTE"}
                </span>
              </div>
              <p className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none mt-2">
                MULHERES QUE CODAM • {projetoNome}
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
                    Ver NFT no {explorerLabel}
                    <span className="material-icons text-sm">open_in_new</span>
                  </a>
                ) : (
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    NFT indisponível no explorer
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
