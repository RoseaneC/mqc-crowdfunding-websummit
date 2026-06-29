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
            label="Total acompanhado"
            value={`${summary.totalXlm.toLocaleString("pt-BR")} USDGLO`}
          />
          <MetricCard
            label="Líquido em projetos"
            value={`${summary.projectXlm.toLocaleString("pt-BR")} USDGLO`}
          />
          <MetricCard
            label="Taxa da Plataforma"
            value={`${summary.feeXlm.toLocaleString("pt-BR")} USDGLO`}
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
                Faça sua contribuição em USDGLO na rede Celo ou use PIX quando o
                projeto disponibilizar uma chave fiduciária direta.
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
                2. Recursos são direcionados
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-bold">
                Os recursos apoiam a execução do projeto aprovado, conforme
                meta, organização responsável e plano de impacto informado.
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
                3. Evidências são publicadas
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-bold">
                A organização responsável compartilha comprovantes, relatórios e
                evidências para facilitar acompanhamento e prestação de contas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO CERTIFICADO DE IMPACTO */}
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
                <span className="text-yellow-400">COMPROVADO</span>
              </h3>
              <p className="mt-8 text-xs font-black tracking-[0.4em] uppercase opacity-60">
                Evidências e prestação de contas
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-orange-500 font-black text-[11px] uppercase tracking-[0.4em]">
                Transparência Radical
              </span>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                O que é a{" "}
                <span className="text-[#002B99]">prestação de contas?</span>
              </h2>
            </div>
            <p className="text-lg text-slate-500 leading-relaxed font-medium">
              Cada projeto pode publicar registros, comprovantes, fotos,
              relatórios e links de evidência. A ideia é permitir que pessoas
              apoiadoras acompanhem como os recursos geram impacto real.
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
                    Transparente
                  </h4>
                  <p className="text-slate-500 text-sm">
                    Informações de projeto, meta, recebimento e evidências ficam
                    organizadas para consulta.
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
                    Auditável
                  </h4>
                  <p className="text-slate-500 text-sm">
                    Doações em USDGLO podem ser verificadas na rede Celo quando
                    houver transação confirmada.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/contribuir"
              className="inline-flex items-center gap-4 bg-[#002B99] hover:bg-blue-800 text-white font-black px-10 py-5 rounded-2xl text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95"
            >
              Apoiar projetos{" "}
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
              Os recursos líquidos vão para a organização responsável pelo
              projeto apoiado, conforme as informações cadastradas, a modalidade
              de doação escolhida e as evidências de prestação de contas.
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
