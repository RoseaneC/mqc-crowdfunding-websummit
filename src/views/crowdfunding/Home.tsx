import { Link } from "react-router-dom";

const partners = [
  { name: "Blockchain Rio", src: "/images/logos-parceiros/logo_rio.webp" },
  {
    name: "Instituto Caldeira",
    src: "/images/logos-parceiros/logo_caldeira.png",
  },
  {
    name: "Instituto da Criança",
    src: "/images/logos-parceiros/logo_crianca.png",
  },
  { name: "ITS", src: "/images/logos-parceiros/logo_its.png" },
  { name: "Stellar", src: "/images/logos-parceiros/logo_stella.png" },
];

export default function Home() {
  return (
    <div className="min-h-screen font-body bg-background-light">
      {/* HERO */}
      <header className="relative overflow-hidden bg-[#070039] pt-20 sm:pt-24 lg:pt-28 pb-14 sm:pb-16">
        {/* FUNDO DO HERO - sempre azul sólido */}
        <div className="absolute inset-0 -z-20 bg-[#0f00a1]" />

        {/* (Opcional) textura/volume bem sutil, mas ainda tudo no azul */}
        <div className="absolute -z-20 right-[-160px] top-[-160px] h-[480px] w-[480px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -z-20 left-[-200px] bottom-[-200px] h-[560px] w-[560px] rounded-full bg-white/5 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* LEFT */}
            <div className="w-full">
              <h1 className="font-display font-black uppercase leading-[0.92] tracking-tight">
                {/* Como o fundo agora é sempre azul, faz sentido o texto ser sempre branco */}
                <span className="block text-5xl sm:text-6xl lg:text-7xl text-white">
                  Mulheres
                </span>

                <span className="block text-4xl sm:text-5xl lg:text-6xl text-white">
                  Que <span className="text-accent">Codam</span>
                </span>
              </h1>

              <p className="mt-5 sm:mt-6 text-base sm:text-lg font-medium text-white/85 max-w-xl">
                Juntas Programando o Futuro.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/projetos"
                  className="
                    inline-flex items-center justify-center gap-2
                    rounded-xl px-6 py-4
                    font-semibold text-base sm:text-lg
                    bg-orange-500 text-white
                    shadow-[0_16px_35px_rgba(249,115,22,0.26)]
                    transition-transform duration-200
                    hover:-translate-y-0.5 hover:brightness-110
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40
                    w-full sm:w-auto
                  "
                >
                  <span aria-hidden>🤝</span>
                  Doar via plataforma
                </Link>

                <Link
                  to="/projetos"
                  className="
                    inline-flex items-center justify-center
                    rounded-xl px-6 py-4
                    font-semibold text-base sm:text-lg
                    bg-[#0f00a1] text-white
                    shadow-[0_16px_35px_rgba(11,45,179,0.16)]
                    transition-transform duration-200
                    hover:-translate-y-0.5 hover:brightness-110
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30
                    w-full sm:w-auto
                    border border-white/15
                  "
                >
                  Conhecer Projetos
                </Link>
              </div>
            </div>

            {/* RIGHT - IMAGE */}
            <div className="w-full">
              <div className="relative mx-auto w-full max-w-2xl">
                {/* Halo único (sem dark/light), apenas um brilho sutil */}
                <div
                  className="
                    absolute -z-10
                    inset-y-[-140px] right-[-260px] left-[10%]
                    rounded-[999px]
                    blur-3xl
                    opacity-100
                    bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.16),transparent_60%)]
                  "
                />

                <div className="relative overflow-hidden rounded-3xl border-[6px] border-white/30 shadow-[0_25px_60px_rgba(2,6,23,0.18)] transform rotate-[2deg] bg-white/5">
                  <div className="aspect-[16/10]">
                    <img
                      src="/images/home-page/alunas.jpg"
                      alt="Mulheres tech diverse group"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="absolute -z-10 right-[-70px] bottom-[-80px] h-[280px] w-[280px] rounded-full bg-white/10 blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FAIXA DE PARCEIROS */}
      <section
        aria-label="Nossos parceiros"
        className="
          relative overflow-hidden
          border-y border-slate-200/70
          bg-white
        "
      >
        {/* fades nas laterais */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="marquee">
            <div className="marquee__track">
              {[...partners, ...partners, ...partners].map((p, idx) => (
                <div
                  key={`${p.name}-${idx}`}
                  className="marquee__item"
                  title={p.name}
                >
                  <img
                    src={p.src}
                    alt={p.name}
                    className={
                      p.name === "ITS"
                        ? "h-12 sm:h-16 lg:h-20 w-auto object-contain opacity-95 transition-opacity scale-[1.22] sm:scale-[1.28] origin-center"
                        : "h-12 sm:h-16 lg:h-20 w-auto object-contain opacity-95 transition-opacity"
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" className="py-20 bg-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2 mb-4">
              Como funciona?
            </h2>
            <span className="dark-text tracking-wider text-sm">
              Transparência total em cada etapa. Utilizamos a rede Stellar para
              garantir que sua contribuição chegue ao destino.
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* CARD 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-md border-b-4 border-primary hover:-translate-y-1 transition-all duration-300 group text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl">
                  search_check
                </span>
              </div>

              <h3 className="text-xl font-display font-bold text-gray-900 mb-3">
                1. Escolha um projeto
              </h3>

              <p className="text-gray-600 font-medium leading-relaxed">
                Navegue por causas de educação tech em diferentes comunidades do
                Brasil e escolha qual apoiar.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-md border-b-4 border-secondary hover:-translate-y-1 transition-all duration-300 group text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary text-3xl">
                  currency_exchange
                </span>
              </div>

              <h3 className="text-xl font-display font-bold text-gray-900 mb-3">
                2. Doação em XLM
              </h3>

              <p className="text-gray-600 font-medium leading-relaxed">
                Sua doação é processada via XLM (Stellar), garantindo taxas
                mínimas e rastreabilidade total.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-md border-b-4 border-accent hover:-translate-y-1 transition-all duration-300 group text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-accent text-3xl">
                  token
                </span>
              </div>

              <h3 className="text-xl font-display font-bold text-gray-900 mb-3">
                3. NFT de Impacto
              </h3>

              <p className="text-gray-600 font-medium leading-relaxed">
                Receba um NFT exclusivo que serve como certificado digital de
                impacto e dá acesso à nossa comunidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-gray-900 text-center mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            <details className="group bg-background-light rounded-xl p-4 border border-gray-100">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900 font-bold list-none">
                <h3 className="text-lg">O que é a plataforma?</h3>
                <span className="material-icons-outlined group-open:-rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-gray-700">
                Uma plataforma de crowdfunding baseada na blockchain Stellar
                conectando doadores a projetos de impacto social voltados para
                mulheres.
              </p>
            </details>

            <details className="group bg-background-light rounded-xl p-4 border border-gray-100">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900 font-bold list-none">
                <h3 className="text-lg">
                  Preciso entender blockchain para doar?
                </h3>
                <span className="material-icons-outlined group-open:-rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-gray-700">
                Não A interface foi desenhada sem jargões complexos Você só
                precisa conectar uma carteira compatível e seguir as instruções.
              </p>
            </details>

            <details className="group bg-background-light rounded-xl p-4 border border-gray-100">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900 font-bold list-none">
                <h3 className="text-lg">Minha doação pode ser deduzida?</h3>
                <span className="material-icons-outlined group-open:-rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-gray-700">
                Sim dependendo da categoria fiscal do projeto e do seu tipo de
                declaração informamos os percentuais durante o fluxo de doação.
              </p>
            </details>

            <details className="group bg-background-light rounded-xl p-4 border border-gray-100">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900 font-bold list-none">
                <h3 className="text-lg">
                  O que é o Certificado Digital de Impacto?
                </h3>
                <span className="material-icons-outlined group-open:-rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-gray-700">
                É um NFT intransferível cunhado na rede Stellar que serve como
                prova imutável e transparente do seu apoio ao projeto.
              </p>
            </details>

            <details className="group bg-background-light rounded-xl p-4 border border-gray-100">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900 font-bold list-none">
                <h3 className="text-lg">Empresas podem doar?</h3>
                <span className="material-icons-outlined group-open:-rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-gray-700">
                Sim aceitamos doações de Pessoas Jurídicas com taxas reduzidas e
                possibilidade de abatimento via Lucro Real.
              </p>
            </details>

            <details className="group bg-background-light rounded-xl p-4 border border-gray-100">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900 font-bold list-none">
                <h3 className="text-lg">Como funciona dedução PF e PJ?</h3>
                <span className="material-icons-outlined group-open:-rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-gray-700">
                PF pode deduzir até seis porcento no IRPF completo PJ pode
                deduzir de um a quatro porcento dependendo da lei de incentivo.
              </p>
            </details>

            <details className="group bg-background-light rounded-xl p-4 border border-gray-100">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900 font-bold list-none">
                <h3 className="text-lg">Como ONGs enviam projetos?</h3>
                <span className="material-icons-outlined group-open:-rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-gray-700">
                Representantes devem acessar a rota de cadastro preencher os
                dados do projeto definir a carteira Stellar e submeter para
                revisão administrativa.
              </p>
            </details>

            <details className="group bg-background-light rounded-xl p-4 border border-gray-100">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900 font-bold list-none">
                <h3 className="text-lg">Quais documentos são necessários?</h3>
                <span className="material-icons-outlined group-open:-rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-gray-700">
                Documentação legal da ONG CNPJ ativo e certificados
                governamentais relativos às tags fiscais escolhidas.
              </p>
            </details>

            <details className="group bg-background-light rounded-xl p-4 border border-gray-100">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900 font-bold list-none">
                <h3 className="text-lg">O que é Stellar?</h3>
                <span className="material-icons-outlined group-open:-rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-gray-700">
                Stellar é uma rede blockchain de código aberto otimizada para
                pagamentos rápidos seguros e com taxas mínimas.
              </p>
            </details>

            <details className="group bg-background-light rounded-xl p-4 border border-gray-100">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900 font-bold list-none">
                <h3 className="text-lg">Por que usar blockchain?</h3>
                <span className="material-icons-outlined group-open:-rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-gray-700">
                A blockchain garante que os fundos cheguem diretamente ao
                projeto de forma transparente atomatizando a divisão de taxas e
                criando registros imutáveis.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
