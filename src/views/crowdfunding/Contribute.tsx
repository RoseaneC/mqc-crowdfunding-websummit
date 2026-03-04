import { useState, useEffect } from "react";
import { Buffer } from "buffer";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDonations } from "../../providers/DonationProvider";
import { useWallet } from "../../hooks/useWallet";
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

export default function Contribute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addDonation } = useDonations();
  const { address, balances, network, signTransaction } = useWallet();

  // Captura os dados passados pela página de projetos
  const projetoId = searchParams.get("projeto") || "1";
  const projetoNomeParam = searchParams.get("nome")?.trim() ?? "";
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [projectMedia, setProjectMedia] = useState<ProjectMediaItemDTO | null>(
    null,
  );

  const [tipoDoador, setTipoDoador] = useState("PF");
  const [valorXLM, setValorXLM] = useState("0");
  const [identificacao, setIdentificacao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cotacaoXLM = 0.5432;
  const valorBRL = (Number(valorXLM) * cotacaoXLM).toFixed(2);

  const formatarEntrada = (valor: string) => {
    const limpo = valor.replace(/\D/g, "");
    if (tipoDoador === "PF") {
      return limpo
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      return limpo
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
  };

  const handleIdentificacaoChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIdentificacao(formatarEntrada(e.target.value));
  };

  const calcularAbatimento = () => {
    const brl = Number(valorBRL);
    if (tipoDoador === "PF") {
      return (brl * 0.06).toFixed(2).replace(".", ",");
    }
    return (brl * 0.04).toFixed(2).replace(".", ",");
  };

  const handleConfirmarDoacao = async () => {
    if (!address) {
      alert("Conecte sua carteira antes de continuar.");
      return;
    }
    if (!identificacao) {
      alert(`Informe seu ${tipoDoador === "PF" ? "CPF" : "CNPJ"}.`);
      return;
    }
    if (Number(valorXLM) <= 0) {
      alert("Informe um valor de doação válido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const donorDocHash = await hashStringHex(
        identificacao.replace(/\D/g, ""),
      );
      const prepared = await prepareDonation({
        projectId: Number(projetoId),
        donorType: tipoDoador as "PF" | "PJ",
        donorDocHash,
        amountXlm: Number(valorXLM),
        walletAddress: address,
      });

      const chainResult = await executeOnChainDonation({
        walletAddress: address,
        projectId: Number(projetoId),
        donorType: tipoDoador as "PF" | "PJ",
        donorDocHash,
        amountXlm: Number(valorXLM),
        signTransaction,
      });

      await submitDonation({
        donationId: prepared.donationId,
        txHash: chainResult.txHash,
        nftId: chainResult.nftId,
        contractDonationId: String(chainResult.contractDonationId),
      });
      const projectName =
        project?.title || projetoNomeParam || `Campanha #${projetoId}`;

      await addDonation({
        id: String(prepared.donationId),
        projectId: projetoId,
        projectName,
        amount: valorXLM,
        amountBRL: valorBRL,
        timestamp: Date.now(),
        nftId: chainResult.nftId,
        donorType: tipoDoador as "PF" | "PJ",
        walletAddress: address,
        txHash: chainResult.txHash,
      });

      void navigate(
        `/sucesso?donationId=${prepared.donationId}&txHash=${chainResult.txHash}&nftId=${chainResult.nftId}&xlm=${valorXLM}&tipo=${tipoDoador}&projeto=${encodeURIComponent(projectName)}`,
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
    void Promise.all([listProjects(), listProjectMedia()])
      .then(([projects, media]) => {
        const selected = projects.find((item) => String(item.id) === projetoId);
        setProject(selected ?? null);
        const selectedMedia = media.find((item) => item.id === projetoId);
        setProjectMedia(selectedMedia ?? null);
      })
      .catch(() => {});
  }, [projetoId]);

  const progressPercent = project
    ? Math.min(
        100,
        Math.round(
          (Number(project.raisedXlm) / Number(project.targetXlm)) * 100,
        ),
      )
    : 0;
  const displayProjectName =
    project?.title || projetoNomeParam || `Campanha #${projetoId}`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-200">
      <main className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-64 relative flex items-end p-6 bg-[#002B99]">
              {projectMedia?.img ? (
                <img
                  src={projectMedia.img}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                  alt={displayProjectName}
                />
              ) : null}
              <div className="relative z-10 space-y-3">
                <span className="bg-yellow-400 text-[#002B99] text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  {project?.taxCategory ?? "Educacao & Tecnologia"}
                </span>
                <h2 className="text-white font-black text-3xl leading-tight tracking-tight uppercase">
                  Apoiando:
                  <br />
                  <span className="text-yellow-400 italic">
                    {displayProjectName}
                  </span>
                </h2>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <p className="text-sm text-slate-500 font-medium leading-relaxed uppercase tracking-widest">
                {project?.description ??
                  "Sua doacao financia bolsas de estudo integrais para mulheres em tecnologia."}
              </p>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-[#002B99]">
                  <span>Meta do Projeto</span>
                  <span className="text-slate-400">
                    {progressPercent}% alcancado
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-3">
                <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="material-icons text-green-600 text-sm">
                    verified
                  </span>
                </div>
                <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                  Projeto com captacao habilitada na plataforma
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#002B99] p-8 rounded-3xl text-white space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full opacity-20 -mr-10 -mt-10 blur-2xl"></div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-yellow-400 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner">
                <span className="material-icons text-[#002B99]">savings</span>
              </div>
              <h3 className="font-black text-lg uppercase tracking-wider text-yellow-400">
                Benefício Fiscal
              </h3>
            </div>

            <div className="space-y-5 relative z-10">
              <div className="flex items-center gap-4 bg-blue-900/40 p-4 rounded-2xl border border-blue-800">
                <div className="bg-blue-100 text-[#002B99] w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0">
                  PF
                </div>
                <p className="text-sm text-blue-100 font-medium leading-tight">
                  Abatimento de até{" "}
                  <span className="font-black text-white text-base">6%</span> no
                  Imposto de Renda devido para Pessoas Físicas.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-blue-900/40 p-4 rounded-2xl border border-blue-800">
                <div className="bg-slate-700 text-white w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0">
                  PJ
                </div>
                <p className="text-sm text-blue-100 font-medium leading-tight">
                  Abatimento de até{" "}
                  <span className="font-black text-white text-base">4%</span>{" "}
                  para Pessoas Jurídicas (Lucro Real).
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-slate-100">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Realizar Doação
            </h1>
            <p className="text-slate-500 text-base">
              Complete os dados abaixo para contribuir via Stellar (XLM).
            </p>
          </div>

          <div className="space-y-10">
            <div className="border-2 border-orange-100 bg-orange-50/50 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-orange-100 shrink-0">
                  <span className="material-icons text-orange-500 text-3xl">
                    account_balance_wallet
                  </span>
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-800 leading-none mb-1">
                    Carteira Freighter
                  </h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    Wallet oficial conforme Requisito DN-01
                  </p>
                </div>
              </div>
              {!address ? (
                <button
                  onClick={() => void connectWallet()}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_8px_20px_rgba(249,115,22,0.25)] active:scale-95"
                >
                  Conectar Carteira
                </button>
              ) : (
                <div className="w-full sm:w-auto bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                    Carteira Conectada
                  </p>
                  <p className="text-xs font-bold text-slate-700 mt-1">
                    {shortAddress(address)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {balances?.xlm?.balance ?? "-"} XLM
                    {network ? ` • ${network}` : ""}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Tipo de Doador
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTipoDoador("PF")}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${
                    tipoDoador === "PF"
                      ? "border-[#002B99] bg-blue-50/50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`material-icons text-3xl mb-3 ${
                      tipoDoador === "PF" ? "text-[#002B99]" : "text-slate-400"
                    }`}
                  >
                    person
                  </span>
                  <span
                    className={`font-black text-sm tracking-wide ${
                      tipoDoador === "PF" ? "text-[#002B99]" : "text-slate-500"
                    }`}
                  >
                    Pessoa Física
                  </span>
                </button>
                <button
                  onClick={() => setTipoDoador("PJ")}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${
                    tipoDoador === "PJ"
                      ? "border-[#002B99] bg-blue-50/50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`material-icons text-3xl mb-3 ${
                      tipoDoador === "PJ" ? "text-[#002B99]" : "text-slate-400"
                    }`}
                  >
                    domain
                  </span>
                  <span
                    className={`font-black text-sm tracking-wide ${
                      tipoDoador === "PJ" ? "text-[#002B99]" : "text-slate-500"
                    }`}
                  >
                    Pessoa Jurídica
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                {tipoDoador === "PF" ? "CPF" : "CNPJ"}
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-icons text-slate-400">
                  badge
                </span>
                <input
                  type="text"
                  value={identificacao}
                  onChange={handleIdentificacaoChange}
                  placeholder={
                    tipoDoador === "PF"
                      ? "000.000.000-00"
                      : "00.000.000/0000-00"
                  }
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#002B99] text-base font-bold text-slate-700 transition-all placeholder:font-normal"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    Valor da Doação
                  </label>
                  <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#002B99] transition-all">
                    <div className="flex flex-col text-[10px] font-black text-[#002B99] pr-4 border-r border-slate-200">
                      <span>XLM</span>
                      <span className="material-icons text-base mt-1">
                        currency_exchange
                      </span>
                    </div>
                    <input
                      type="number"
                      value={valorXLM}
                      onChange={(e) => setValorXLM(e.target.value)}
                      className="w-full bg-transparent font-black text-3xl text-slate-900 outline-none"
                    />
                    <span className="text-slate-400 font-black tracking-widest uppercase text-sm">
                      XLM
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-widest">
                    Taxa de rede estimada:{" "}
                    <span className="text-slate-600">0.00001 XLM</span>
                  </p>
                </div>

                <div className="space-y-4 md:border-l border-slate-200 md:pl-8 h-full flex flex-col justify-center pt-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Aproximadamente
                  </label>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-slate-400 text-xl font-bold">R$</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                      {valorBRL.replace(".", ",")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    1 XLM = R$ 0,54
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4 shadow-sm">
              <div className="bg-[#002B99] text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md">
                <span className="material-icons text-sm">info</span>
              </div>
              <div className="space-y-1 pt-1">
                <h5 className="font-black text-sm text-[#002B99] uppercase tracking-widest">
                  Incentivo Fiscal Ativo
                </h5>
                <p className="text-xs text-blue-900 font-medium leading-relaxed">
                  Baseado no seu perfil ({tipoDoador}), esta doação pode gerar
                  um abatimento de aprox.{" "}
                  <span className="font-black text-[#002B99] bg-white px-2 py-0.5 rounded">
                    R$ {calcularAbatimento()}
                  </span>{" "}
                  no seu próximo IR.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                void handleConfirmarDoacao();
              }}
              disabled={isSubmitting}
              className="w-full bg-[#002B99] hover:bg-blue-800 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(0,43,153,0.25)] active:scale-95 group text-sm uppercase tracking-widest mt-4"
            >
              {isSubmitting ? "Processando..." : "Confirmar Doação"}
              <span className="material-icons text-lg group-hover:translate-x-2 transition-transform">
                bolt
              </span>
            </button>

            <p className="text-[9px] text-center text-slate-400 max-w-2xl mx-auto leading-relaxed uppercase font-bold tracking-widest">
              Ao prosseguir, você concorda com nossos Termos de Uso. A dedução
              fiscal está sujeita às regras da Receita Federal.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
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
  donorType: "PF" | "PJ";
  donorDocHash: string;
  amountXlm: number;
  signTransaction: ReturnType<typeof useWallet>["signTransaction"];
}) {
  const client = createCrowdfundingClient(input.walletAddress);
  try {
    await client.get_project({ project_id: BigInt(input.projectId) });
  } catch {
    throw new Error(
      "Projeto ainda nao sincronizado no contrato local. Rode o sync on-chain dos projetos e tente novamente.",
    );
  }

  const assembled = await client.donate({
    donor: input.walletAddress,
    project_id: BigInt(input.projectId),
    donor_type: input.donorType === "PF" ? 1 : 2,
    donor_doc_hash: Buffer.from(input.donorDocHash, "hex"),
    amount_stroops: BigInt(Math.round(input.amountXlm * 10_000_000)),
  });

  const sent = await assembled.signAndSend({
    signTransaction: input.signTransaction,
  });

  const sentTx = sent as {
    result?: unknown;
    sendTransactionResponse?: { hash?: string };
    getTransactionResponse?: { txHash?: string };
  };
  const txHash =
    sentTx.getTransactionResponse?.txHash ??
    sentTx.sendTransactionResponse?.hash ??
    "";
  const txResult = sentTx.result;
  if (!txHash || !Array.isArray(txResult) || txResult.length < 2) {
    throw new Error("Falha ao confirmar transacao on-chain.");
  }

  return {
    txHash,
    contractDonationId: Number(txResult[0]),
    nftId: Number(txResult[1]),
  };
}
