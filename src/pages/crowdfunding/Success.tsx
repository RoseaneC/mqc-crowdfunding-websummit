import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getDonationReceipt,
  listNftCatalog,
  type NftCatalogItemDTO,
} from "../../util/crowdfundingApi";

export default function Success() {
  const [searchParams] = useSearchParams();
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [receiptTxHash, setReceiptTxHash] = useState<string | null>(searchParams.get("txHash"));
  const [catalog, setCatalog] = useState<NftCatalogItemDTO[]>([]);

  const donationId = Number(searchParams.get("donationId") ?? "0");
  const valorDoadoXLM = Number(searchParams.get("xlm")) || 100;
  const tipo = searchParams.get("tipo") || "PF";
  const nftId = Number(searchParams.get("nftId")) || 1;
  const projetoNome = searchParams.get("projeto") || "Bootcamp Fullstack Periferia";

  const cotacaoXLM = 0.5432;
  const valorTotalBRL = valorDoadoXLM * cotacaoXLM;

  const taxaAdminPct = tipo === "PF" ? 0.07 : 0.05;
  const valorTaxa = valorTotalBRL * taxaAdminPct;
  const valorLiquido = valorTotalBRL - valorTaxa;

  const nftData = useMemo(() => {
    if (catalog.length === 0) {
      return {
        id: 1,
        name: "Genesis Supporter",
        color: "bg-[#002B99]",
        gradient: "from-blue-600 to-indigo-900",
        icon: "code",
        rarity: "COMUM",
        description: "Bloco de origem da rede de suporte.",
        thanks: "Sinergia",
      } as NftCatalogItemDTO;
    }
    return catalog.find((item) => item.id === nftId) ?? catalog[0];
  }, [catalog, nftId]);

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
      })
      .catch(() => {});
  }, [donationId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      <main className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-6 bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-12 text-center space-y-4">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              Impacto Confirmado
            </h1>
            <p className="text-slate-500 dark:text-emerald-400 font-bold uppercase text-[10px] tracking-[0.3em]">
              Sua contribuicao para {projetoNome} foi registrada
            </p>
          </div>

          <div className="p-12 space-y-8">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">VALOR TOTAL DOADO</p>
              <h2 className="text-5xl font-black text-[#002B99] dark:text-blue-400 tracking-tighter mt-2">
                R$ {valorTotalBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-xs font-black text-slate-400 mt-2">~ {valorDoadoXLM.toFixed(2)} XLM</p>
            </div>

            <div className="space-y-4 text-xs font-black uppercase tracking-widest">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Hash Transaction</span>
                <span className="text-[#002B99] dark:text-blue-400 font-mono">
                  {receiptTxHash ? shortHash(receiptTxHash) : "PENDENTE"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Data e Hora</span>
                <span className="text-slate-900 dark:text-white">{formatDate(confirmedAt)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Taxas Operacionais ({tipo === "PF" ? "7%" : "5%"})</span>
                <span className="text-rose-500">- R$ {valorTaxa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between gap-4">
                <span className="text-slate-400">Valor Liquido no Projeto</span>
                <span className="text-emerald-600 text-xl">R$ {valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
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

        <div className="lg:col-span-6 bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className={`aspect-square bg-gradient-to-br ${nftData.gradient} text-white flex flex-col items-center justify-center p-12 text-center space-y-4`}>
            <span className="material-icons text-7xl">{nftData.icon}</span>
            <h3 className="text-5xl font-black uppercase leading-none tracking-tighter">{nftData.name}</h3>
            <h4 className="text-2xl font-black uppercase tracking-[0.2em] opacity-70">ID #{nftId.toString().padStart(2, "0")}</h4>
            <p className="text-[11px] font-black tracking-[0.4em] uppercase opacity-90">DOACAO: {valorDoadoXLM.toFixed(2)} XLM</p>
          </div>

          <div className="p-10 space-y-6 text-center">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Seu Impact NFT</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-black uppercase tracking-[0.3em]">
              Este colecionavel digital intransferivel prova que voce ajudou a transformar {projetoNome} em realidade.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">COLECAO GENESIS v2</span>
                <span className="text-[10px] font-black uppercase text-orange-500 tracking-[0.3em]">RARIDADE: {nftData.rarity}</span>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none mt-2">
                MULHERES QUE CODAM • {projetoNome}
              </p>
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
