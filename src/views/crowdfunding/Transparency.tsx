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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* HERO SECTION - REQUISITO VISUAL IMAGE_D719D8 */}
      <section className="bg-[#002B99] py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-[100px] -mt-20 -ml-20"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-[100px] -mb-20 -mr-20"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <span className="bg-yellow-400 text-[#002B99] text-[10px] font-black px-6 py-1.5 rounded-full uppercase tracking-[0.3em] shadow-lg">
            Decodificando o Sistema
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase">
            Como sua doação <br />
            <span className="text-yellow-400">transforma vidas</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed opacity-90">
            Utilizamos tecnologia blockchain para garantir transparência total.
            Entenda o fluxo da sua contribuição desde a saída da sua carteira
            até o impacto real.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="Total Simulado"
            value={`${summary.totalXlm.toLocaleString("pt-BR")} USDC`}
          />
          <MetricCard
            label="Líquido em projetos"
            value={`${summary.projectXlm.toLocaleString("pt-BR")} USDC`}
          />
          <MetricCard
            label="Taxa da Plataforma"
            value={`${summary.feeXlm.toLocaleString("pt-BR")} USDC`}
          />
          <MetricCard
            label="Projetos Aprovados"
            value={summary.approvedProjects.toLocaleString("pt-BR")}
          />
          <MetricCard
            label="Doadores únicos"
            value={summary.uniqueDonors.toLocaleString("pt-BR")}
          />
        </div>
      </section>

      {/* FLUXO DA DOAÇÃO */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-black text-[#002B99] tracking-tighter uppercase">
            O Fluxo da Doação
          </h2>
          <div className="w-20 h-1.5 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Passo 1 */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 text-center space-y-6 group hover:border-[#002B99] transition-all">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto transition-transform group-hover:rotate-12">
              <span className="material-icons text-[#002B99] text-4xl">
                payments
              </span>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-black uppercase tracking-tight">
                1. Você Contribui
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-bold">
                Faça sua contribuição simulada em USDC, BRZ ou XLM Testnet. A
                liquidação real depende da integração final com carteira e
                contratos Stellar.
              </p>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 text-center space-y-6 group hover:border-[#002B99] transition-all">
            <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto transition-transform group-hover:rotate-12">
              <span className="material-icons text-orange-500 text-4xl">
                school
              </span>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-black uppercase tracking-tight">
                2. Bolsas são Geradas
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-bold">
                Os recursos são direcionados diretamente para financiar
                bootcamps de programação e kits de tecnologia para alunas em
                comunidades periféricas.
              </p>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 text-center space-y-6 group hover:border-[#002B99] transition-all">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto transition-transform group-hover:rotate-12">
              <span className="material-icons text-emerald-600 text-4xl">
                verified
              </span>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-black uppercase tracking-tight">
                3. Você Recebe um NFT
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-bold">
                Como comprovante imutável do seu impacto social, você recebe um
                NFT de Impacto exclusivo em sua carteira digital Stellar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO NFT DE IMPACTO - REQUISITO VISUAL IMAGE_D719D8 */}
      <section className="bg-slate-100 py-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-orange-500 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-[#002B99] aspect-[3/4] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col justify-center items-center text-white p-12 border-8 border-white/10">
              <div className="absolute top-10 left-10 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
              <span className="material-icons text-8xl mb-8">stars</span>
              <h3 className="text-6xl font-black uppercase tracking-tighter leading-none text-center">
                IMPACTO
                <br />
                <span className="text-yellow-400">NFT</span>
              </h3>
              <p className="mt-8 text-xs font-black tracking-[0.4em] uppercase opacity-60">
                Certificado Digital de Doação
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-orange-500 font-black text-[11px] uppercase tracking-[0.4em]">
                Transparência Radical
              </span>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                O que é o{" "}
                <span className="text-[#002B99]">NFT de Impacto?</span>
              </h2>
            </div>
            <p className="text-lg text-slate-500 leading-relaxed font-medium">
              Não é arte especulativa. É um recibo digital eterno. Ao contrário
              de recibos de papel que se perdem, o NFT (Token Não Fungível) de
              Impacto é registrado na blockchain da Stellar Network.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <span className="material-icons text-white text-xs">
                    check
                  </span>
                </div>
                <div>
                  <h4 className="font-black uppercase text-sm tracking-widest">
                    Intransferível
                  </h4>
                  <p className="text-slate-500 text-sm">
                    Prova que você fez a diferença. Não pode ser vendido.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <span className="material-icons text-white text-xs">
                    check
                  </span>
                </div>
                <div>
                  <h4 className="font-black uppercase text-sm tracking-widest">
                    Rastreável
                  </h4>
                  <p className="text-slate-500 text-sm">
                    Você pode ver exatamente para qual turma sua doação foi
                    destinada.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/contribuir"
              className="inline-flex items-center gap-4 bg-[#002B99] hover:bg-blue-800 text-white font-black px-10 py-5 rounded-2xl text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95"
            >
              Quero meu NFT de Impacto{" "}
              <span className="material-icons">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ - DÚVIDAS FREQUENTES */}
      <section className="max-w-4xl mx-auto px-4 py-24 space-y-16">
        <h2 className="text-4xl font-black text-center text-slate-900 tracking-tighter uppercase leading-none">
          Dúvidas Frequentes
        </h2>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg">
            <h4 className="text-lg font-black uppercase text-[#002B99] mb-3">
              Preciso entender de criptomoedas para doar?
            </h4>
            <p className="text-slate-500 font-medium">
              Não. A interface reduz a complexidade técnica e orienta cada etapa
              do apoio. A tecnologia blockchain roda nos bastidores para
              reforçar a segurança e a transparência do processo.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg">
            <h4 className="text-lg font-black uppercase text-[#002B99] mb-3">
              Para onde vai o dinheiro?
            </h4>
            <p className="text-slate-500 font-medium">
              100% das doações líquidas vão para o fundo educacional do Mulheres
              que Codam, financiando professoras, computadores e internet para
              alunas em situação de vulnerabilidade.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="bg-[#002B99] py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-tight">
            Construa o futuro com a gente
          </h2>
          <p className="text-blue-100 text-lg opacity-80 uppercase font-bold tracking-widest">
            Sua doação empodera mulheres e reduz a desigualdade de gênero na
            tecnologia.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/contribuir"
              className="bg-yellow-400 text-[#002B99] font-black px-12 py-5 rounded-2xl uppercase tracking-widest hover:bg-yellow-300 transition-all active:scale-95"
            >
              DOAR AGORA
            </Link>
            <Link
              to="/projetos"
              className="border-2 border-white text-white font-black px-12 py-5 rounded-2xl uppercase tracking-widest hover:bg-white hover:text-[#002B99] transition-all active:scale-95"
            >
              Conheça os projetos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard(props: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {props.label}
      </p>
      <p className="text-lg sm:text-xl font-black text-slate-900 mt-2">
        {props.value}
      </p>
    </div>
  );
}
