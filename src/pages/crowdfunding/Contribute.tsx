import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDonations } from "../../providers/DonationProvider";
import { useWallet } from "../../hooks/useWallet";
import { connectWallet } from "../../util/wallet";
import { prepareDonation, submitDonation } from "../../util/crowdfundingApi";

export default function Contribute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addDonation } = useDonations();
  const { address, balances, network } = useWallet();

  // Captura os dados passados pela página de projetos
  const projetoId = searchParams.get("projeto") || "1";
  const projetoNome = searchParams.get("nome") || "Bootcamp Fullstack Periferia";

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
    e: React.ChangeEvent<HTMLInputElement>
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

      // Placeholder until full contract invocation is wired from generated client.
      const txHash = `stellar_${crypto.randomUUID().replace(/-/g, "")}`;
      const nftId = Math.floor(Math.random() * 10_000) + 1;

      await submitDonation({
        donationId: prepared.donationId,
        txHash,
        nftId,
      });
      await addDonation({
        id: String(prepared.donationId),
        projectId: projetoId,
        projectName: projetoNome,
        amount: valorXLM,
        amountBRL: valorBRL,
        timestamp: Date.now(),
        nftId,
        donorType: tipoDoador as "PF" | "PJ",
        walletAddress: address,
        txHash,
      });

      navigate(
        `/sucesso?donationId=${prepared.donationId}&txHash=${txHash}&nftId=${nftId}&xlm=${valorXLM}&tipo=${tipoDoador}&projeto=${projetoNome}`,
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">

      <main className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="h-64 relative flex items-end p-6 bg-[#002B99]">
              <img
                src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80"
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                alt="Mulheres estudando"
              />
              <div className="relative z-10 space-y-3">
                <span className="bg-yellow-400 text-[#002B99] text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  Educação & Tecnologia
                </span>
                <h2 className="text-white font-black text-3xl leading-tight tracking-tight uppercase">
                  Apoiando:<br />
                  <span className="text-yellow-400 italic">{projetoNome}</span>
                </h2>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed uppercase tracking-widest">
                Sua doação financia bolsas de estudo integrais para mulheres de
                periferia em desenvolvimento Full Stack.
              </p>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-[#002B99] dark:text-blue-400">
                  <span>Meta do Projeto</span>
                  <span className="text-slate-400">75% alcançado</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-3/4 rounded-full"></div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="material-icons text-green-600 dark:text-green-400 text-sm">
                    verified
                  </span>
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                  Projeto aprovado na Lei Rouanet (Art. 18)
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

        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 lg:p-12 border border-slate-100 dark:border-slate-700">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Realizar Doação
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">
              Complete os dados abaixo para contribuir via Stellar (XLM).
            </p>
          </div>

          <div className="space-y-10">
            <div className="border-2 border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-orange-100 dark:border-orange-900/50 shrink-0">
                  <span className="material-icons text-orange-500 text-3xl">
                    account_balance_wallet
                  </span>
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-800 dark:text-white leading-none mb-1">
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
                <div className="w-full sm:w-auto bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
                    Carteira Conectada
                  </p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
                    {shortAddress(address)}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
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
                      ? "border-[#002B99] bg-blue-50/50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`material-icons text-3xl mb-3 ${
                      tipoDoador === "PF"
                        ? "text-[#002B99] dark:text-blue-400"
                        : "text-slate-400"
                    }`}
                  >
                    person
                  </span>
                  <span
                    className={`font-black text-sm tracking-wide ${
                      tipoDoador === "PF"
                        ? "text-[#002B99] dark:text-blue-400"
                        : "text-slate-500"
                    }`}
                  >
                    Pessoa Física
                  </span>
                </button>
                <button
                  onClick={() => setTipoDoador("PJ")}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${
                    tipoDoador === "PJ"
                      ? "border-[#002B99] bg-blue-50/50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`material-icons text-3xl mb-3 ${
                      tipoDoador === "PJ"
                        ? "text-[#002B99] dark:text-blue-400"
                        : "text-slate-400"
                    }`}
                  >
                    domain
                  </span>
                  <span
                    className={`font-black text-sm tracking-wide ${
                      tipoDoador === "PJ"
                        ? "text-[#002B99] dark:text-blue-400"
                        : "text-slate-500"
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
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#002B99] text-base font-bold text-slate-700 dark:text-white transition-all placeholder:font-normal"
                />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    Valor da Doação
                  </label>
                  <div className="flex items-center gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#002B99] transition-all">
                    <div className="flex flex-col text-[10px] font-black text-[#002B99] dark:text-blue-400 pr-4 border-r border-slate-200 dark:border-slate-700">
                      <span>XLM</span>
                      <span className="material-icons text-base mt-1">
                        currency_exchange
                      </span>
                    </div>
                    <input
                      type="number"
                      value={valorXLM}
                      onChange={(e) => setValorXLM(e.target.value)}
                      className="w-full bg-transparent font-black text-3xl text-slate-900 dark:text-white outline-none"
                    />
                    <span className="text-slate-400 font-black tracking-widest uppercase text-sm">
                      XLM
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-widest">
                    Taxa de rede estimada:{" "}
                    <span className="text-slate-600 dark:text-slate-300">
                      0.00001 XLM
                    </span>
                  </p>
                </div>

                <div className="space-y-4 md:border-l border-slate-200 dark:border-slate-700 md:pl-8 h-full flex flex-col justify-center pt-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Aproximadamente
                  </label>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-slate-400 text-xl font-bold">R$</span>
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {valorBRL.replace(".", ",")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    1 XLM = R$ 0,54
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-2xl flex items-start gap-4 shadow-sm">
              <div className="bg-[#002B99] text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md">
                <span className="material-icons text-sm">info</span>
              </div>
              <div className="space-y-1 pt-1">
                <h5 className="font-black text-sm text-[#002B99] dark:text-blue-400 uppercase tracking-widest">
                  Incentivo Fiscal Ativo
                </h5>
                <p className="text-xs text-blue-900 dark:text-blue-300 font-medium leading-relaxed">
                  Baseado no seu perfil ({tipoDoador}), esta doação pode gerar
                  um abatimento de aprox.{" "}
                  <span className="font-black text-[#002B99] dark:text-blue-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded">
                    R$ {calcularAbatimento()}
                  </span>{" "}
                  no seu próximo IR.
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirmarDoacao}
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
