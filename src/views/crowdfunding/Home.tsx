import { Link } from "react-router-dom";
import Image from "next/image";
import AdesivoImg from "../../images/home-page/adesivo_mqc.jpg";

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
      <header className="relative overflow-hidden bg-[var(--color-primary)] px-4 py-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,0,161,0.85),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.10),rgba(0,0,0,0.42))]" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/35 to-transparent" />

        <div className="relative mx-auto max-w-6xl text-center">
          <h1 className="mx-auto mt-8 max-w-5xl font-[var(--font-body)] text-5xl font-light leading-tight tracking-tight text-[var(--color-white)] sm:text-6xl lg:text-7xl">
            Onde ideias se tornam impacto real.
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/70">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/projetos"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-8 py-4 text-base font-bold text-[var(--color-white)] transition hover:bg-[var(--color-accent-dark)]"
            >
              Explorar projetos
            </Link>

            <Link
              to="/sobre"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-8 py-4 text-base font-bold text-[var(--color-white)] transition hover:bg-white/10"
            >
              Saiba mais
            </Link>
          </div>

          <div
            id="sobre-hero"
            className="mt-20 grid gap-10 border-t border-white/15 pt-12 text-left lg:grid-cols-[0.8fr_1.2fr]"
          >
            <div>
              <p className="text-sm font-[var(--font-heading)] tracking-[0.25em] text-[var(--color-accent)]">
                Sobre o Programa
              </p>
            </div>

            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="max-w-3xl text-2xl font-light leading-relaxed text-[var(--color-white)] sm:text-3xl">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Integer vitae sapien vel justo porta facilisis. Donec impacto,
                  tecnologia e futuro caminham juntos para transformar
                  trajetórias.
                </p>

                <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-[var(--color-accent)]/15 blur-2xl" />

                <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur">
                  <Image
                    src={AdesivoImg}
                    alt="Adesivo Mulheres que Codam"
                    className="h-auto w-full rounded-[1.5rem] object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FAIXA DE PARCEIROS */}
      <section
        aria-label="Nossos parceiros"
        className="relative w-full overflow-hidden border-y border-[var(--color-border)] bg-[var(--color-white)]"
      >
        <div className="mx-auto max-w-7xl px-4 pt-6 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-black)]">
            Nossos parceiros
          </p>
        </div>

        {/* fades nas laterais */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--color-white)] to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--color-white)] to-transparent sm:w-28" />

        <div className="w-full py-8">
          <div className="marquee">
            <div className="marquee__track">
              {[...partners, ...partners, ...partners, ...partners].map(
                (p, idx) => {
                  const repeatedKey = `${p.name}-${p.src}-${idx}`;
                  return (
                    <div
                      key={repeatedKey}
                      className="marquee__item"
                      title={p.name}
                    >
                      <img
                        src={p.src}
                        alt={p.name}
                        className={
                          p.name === "ITS"
                            ? "h-12 w-auto scale-[1.22] object-contain opacity-95 transition-opacity sm:h-16 sm:scale-[1.28] lg:h-20"
                            : "h-12 w-auto object-contain opacity-95 transition-opacity sm:h-16 lg:h-20"
                        }
                      />
                    </div>
                  );
                },
              )}
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
