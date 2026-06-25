"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Image from "next/image";
import fotoMeninas from "../../images/home-page/meninasJuntas.jpeg";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ProjectDTO } from "../../util/crowdfundingApi";

import HeroProjectsImg from "../../images/projects-page/foto_ideiathon1.jpg";
import MqcCardImg from "../../images/projects-page/cards/mqc-edicao-2.jpeg";
import Web3CardImg from "../../images/projects-page/cards/web3-lideranca.jpeg";
import FormacaoCardImg from "../../images/projects-page/cards/formacaoMulheres.jpeg";

type ProjectsApiResponse =
  | ProjectDTO[]
  | {
      value?: ProjectDTO[];
      data?: ProjectDTO[];
      projects?: ProjectDTO[];
      items?: ProjectDTO[];
      Count?: number;
    };

const partners = [
  { name: "Blockchain Rio", src: "/images/logos-parceiros/logo_rio.webp" },
  {
    name: "Instituto Florescer Caldeira",
    src: "/images/logos-parceiros/florescerCaldeira.png",
  },
  {
    name: "Instituto da Criança",
    src: "/images/logos-parceiros/institutoCrianca.png",
  },
  { name: "ITS", src: "/images/logos-parceiros/logo_its.png" },
  { name: "Stellar", src: "/images/logos-parceiros/logo_stella.png" },
];

const projectImages: Record<string, string> = {
  "1": MqcCardImg.src,
  "6": Web3CardImg.src,
  "8": FormacaoCardImg.src,
};

const featuredProjectIds = ["8", "6", "1"];

function unwrapProjects(response: ProjectsApiResponse): ProjectDTO[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.value)) return response.value;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.projects)) return response.projects;
  if (Array.isArray(response.items)) return response.items;

  return [];
}

export default function Home() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadProjects() {
      setProjectsLoading(true);
      setProjectsError(null);

      try {
        const response = await fetch("/api/projects", {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const text = await response.text();

          throw new Error(
            text || `Falha ao carregar projetos. Status: ${response.status}`,
          );
        }

        const data = (await response.json()) as ProjectsApiResponse;
        const unwrappedProjects = unwrapProjects(data);

        setProjects(unwrappedProjects);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Falha ao carregar projetos";

        setProjectsError(message);
      } finally {
        setProjectsLoading(false);
      }
    }

    void loadProjects();
  }, []);

  const featuredProjects = useMemo(() => {
    const approvedProjects = projects.filter(
      (project) => project.status === "APPROVED",
    );

    const selectedProjects = featuredProjectIds
      .map((id) =>
        approvedProjects.find((project) => String(project.id) === id),
      )
      .filter((project): project is ProjectDTO => Boolean(project));

    return selectedProjects;
  }, [projects]);

  return (
    <div className="min-h-screen font-body bg-background-light">
      {/* HERO */}
      <header className="relative overflow-hidden bg-[var(--color-primary)] px-4 py-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[var(--color-primary)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-primary-light)_0%,rgba(232,230,255,0.45)_18%,transparent_42%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,202,0,0.20)_0%,transparent_28%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.22)_0%,transparent_34%)]" />

        <div className="absolute inset-0 opacity-[0.60] mix-blend-soft-light bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.85)_1px,transparent_0)] bg-[size:14px_14px]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,0,161,0.10),rgba(5,0,36,0.62))]" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/35 to-transparent" />

        <div className="relative mx-auto max-w-6xl text-center">
          <h1 className="mx-auto mt-8 max-w-5xl font-[var(--font-body)] text-5xl font-light leading-tight tracking-tight text-[var(--color-white)] sm:text-6xl lg:text-7xl">
            Apoie mulheres que transformam tecnologia{" "}
            <span className="whitespace-nowrap">
              em{" "}
              <span className="font-medium text-[var(--color-accent)]">
                futuro
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/70">
            O Mulheres que Codam é uma plataforma de cofinanciamento de impacto
            social criada para conectar apoiadores a projetos liderados por
            mulheres.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/projetos"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-7 py-3 text-sm font-semibold text-[var(--color-black)] transition hover:bg-[var(--color-accent-dark)]"
            >
              Explorar projetos
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>

          <div
            id="sobreNos"
            className="mt-20 border-t border-white/15 pt-14 text-left"
          >
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative">
                <div className="absolute -left-6 top-10 h-40 w-40 rounded-full bg-[var(--color-accent)]/20 blur-3xl" />
                <div className="absolute -right-6 bottom-8 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

                <div className="group relative overflow-hidden rounded-[1.2rem] shadow-[0_28px_90px_rgba(0,0,0,0.36)]">
                  <div className="absolute inset-0 rounded-[1rem] bg-gradient-to-br from-white/10 via-transparent to-[var(--color-accent)]/10 opacity-70" />

                  <Image
                    src={fotoMeninas}
                    alt="Sobre o programa Mulheres que Codam"
                    className="h-[520px] w-full rounded-[1.2rem] object-cover transition duration-700 ease-out group-hover:scale-[1.018]"
                    priority
                  />
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-8 top-8 h-44 w-44 rounded-full bg-[var(--color-accent)]/10 blur-3xl" />
                <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-white/5 blur-3xl" />

                <div className="relative">
                  <h2 className="mt-6 max-w-3xl font-[var(--font-heading)] text-3xl font-semibold leading-tight tracking-tight text-[var(--color-white)] drop-shadow-[0_6px_24px_rgba(0,0,0,0.18)] sm:text-4xl lg:text-[3rem]">
                    Mais que uma vitrine de projetos:
                    <span className="block text-[var(--color-accent)]">
                      uma ponte entre talento e oportunidade.
                    </span>
                  </h2>

                  <div className="mt-6 h-[3px] w-24 rounded-full bg-gradient-to-r from-[var(--color-accent)] via-white/80 to-transparent" />

                  <p className="mt-8 max-w-2xl text-lg leading-9 text-white/80 sm:text-xl">
                    O{" "}
                    <span className="font-semibold text-white">
                      Mulheres que Codam
                    </span>{" "}
                    nasceu para ampliar o acesso de mulheres à tecnologia, ao
                    empreendedorismo e às redes de apoio.
                  </p>

                  <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-white)] sm:text-lg">
                    A plataforma reúne projetos de impacto social, iniciativas
                    femininas e pessoas dispostas a construir um futuro digital
                    mais justo, conectando visibilidade, apoio financeiro e
                    transformação real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section
        id="projetos-destaque"
        className="relative overflow-hidden bg-[var(--color-white)] py-20 sm:py-24"
      >
        {/* TEXTURA SUTIL DA HERO */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden">
          {/* brilho bem suave */}
          <div className="absolute right-0 top-0 h-full w-[72%] bg-[radial-gradient(circle_at_65%_12%,rgba(15,0,161,0.08)_0%,rgba(232,230,255,0.22)_26%,transparent_62%)]" />

          {/* pontinhos */}
          <div className="absolute right-0 top-0 h-full w-[72%] opacity-[0.25] bg-[radial-gradient(circle_at_1px_1px,rgba(15,0,161,0.55)_1px,transparent_0)] bg-[size:14px_14px]" />

          {/* fade para sumir no conteúdo */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_55%,var(--color-white)_100%)]" />

          {/* fade lateral para não encostar forte no título */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-white)_0%,rgba(255,255,255,0.92)_28%,rgba(255,255,255,0)_62%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-[var(--font-heading)] text-3xl font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl lg:text-5xl">
                Conheça algumas iniciativas que já estão na plataforma
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
                Um primeiro olhar para projetos liderados por mulheres que unem
                tecnologia, território e impacto social.
              </p>
            </div>

            <Link
              to="/projetos"
              className="group inline-flex w-fit items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-white)] px-6 py-3 text-sm font-semibold text-[var(--color-text)] shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] lg:mb-2"
            >
              Ver todos os projetos
              <ArrowRight
                size={16}
                strokeWidth={2}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {projectsLoading ? (
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-white)] p-8 text-sm font-medium text-[var(--color-text-muted)] shadow-[0_18px_50px_rgba(15,0,161,0.05)]">
              Carregando projetos em destaque...
            </div>
          ) : projectsError ? (
            <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-8">
              <p className="text-sm font-semibold text-rose-700">
                Não foi possível carregar os projetos em destaque.
              </p>
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-white)] p-8 text-sm font-medium text-[var(--color-text-muted)] shadow-[0_18px_50px_rgba(15,0,161,0.05)]">
              Nenhum projeto aprovado encontrado no momento.
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.16,
                  },
                },
              }}
            >
              {featuredProjects.map((project) => {
                const projectImage =
                  projectImages[String(project.id)] ?? HeroProjectsImg.src;

                return (
                  <motion.article
                    key={project.id}
                    className="group relative flex min-h-[455px] flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-white)] shadow-[0_18px_50px_rgba(15,0,161,0.07)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_80px_rgba(15,0,161,0.14)]"
                    variants={{
                      hidden: {
                        opacity: 0,
                        y: 28,
                      },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.55,
                          ease: "easeOut",
                        },
                      },
                    }}
                  >
                    <div className="relative h-56 overflow-hidden bg-[var(--color-primary)]">
                      <img
                        src={projectImage}
                        alt={`Imagem do projeto ${project.title}`}
                        className="h-full w-full transform-gpu object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,0,112,0.02),rgba(10,0,112,0.42))]" />
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <h3 className="font-[var(--font-heading)] text-xl font-semibold leading-tight tracking-tight text-[var(--color-text)] sm:text-2xl">
                          {project.title}
                        </h3>

                        <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--color-text-muted)]">
                          {project.description}
                        </p>
                      </div>

                      <div className="mt-8 flex items-center justify-between border-t border-[var(--color-border)] pt-5">
                        <Link
                          to="/projetos"
                          className="group/button inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text)] transition hover:text-[var(--color-black)]"
                        >
                          Saiba mais
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-black)] text-[var(--color-white)] transition group-hover/button:translate-x-1 group-hover/button:bg-[var(--color-accent)]">
                            <ArrowRight size={14} strokeWidth={2} />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>
      {/* FAIXA DE PARCEIROS */}
      <section
        id="parceiros"
        aria-label="Nossos parceiros"
        className="relative w-full overflow-hidden border-y border-[var(--color-border)] bg-[var(--color-white)]"
      >
        <div className="mx-auto max-w-7xl px-4 pt-6 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-black)]">
            Nossos parceiros
          </p>
        </div>

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

      {/* COMO FUNCIONA */}
      <section
        id="como-funciona"
        className="bg-[var(--color-white)] py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mt-4 font-[var(--font-heading)] text-3xl font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl lg:text-5xl">
              Como você pode apoiar
            </h2>

            <p className="mt-3 font-[var(--font-body)] text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
              Conecte-se a iniciativas lideradas por mulheres.
            </p>
          </div>

          <motion.div
            className="grid gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.18,
                },
              },
            }}
          >
            {[
              {
                number: "01",
                title: "Explore projetos",
                description:
                  "Conheça iniciativas lideradas por mulheres que estão criando soluções com impacto social e inovação.",
              },
              {
                number: "02",
                title: "Escolha como contribuir",
                description:
                  "Apoie projetos, apadrinhe uma aluna ou fortaleça a rede com doações e parcerias.",
              },
              {
                number: "03",
                title: "Confirme sua contribuição",
                description:
                  "Conecte sua carteira digital, informe seus dados e finalize o apoio com segurança.",
              },
              {
                number: "04",
                title: "Acompanhe o impacto",
                description:
                  "Receba seu comprovante digital e acompanhe como sua doação fortalece cada projeto.",
              },
            ].map((step) => (
              <motion.div
                key={step.number}
                className="group pt-6 transition-all duration-300"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 32,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      ease: "easeOut",
                    },
                  },
                }}
              >
                <div className="font-[var(--font-heading)] text-5xl font-semibold leading-none tracking-tight text-[var(--color-text)] sm:text-6xl">
                  {step.number}
                </div>

                <div className="mt-5 h-px w-full bg-[var(--color-border)]" />

                <h3 className="mt-5 font-[var(--font-heading)] text-lg font-semibold leading-snug text-[var(--color-text)] sm:text-xl">
                  {step.title}
                </h3>

                <p className="mt-3 font-[var(--font-body)] text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-gray-900 text-center mb-12">
            Perguntas Frequentes
          </h2>

          <div className="space-y-4">
            {[
              {
                question: "O que é a plataforma?",
                answer:
                  "É uma plataforma de financiamento coletivo baseada na rede Stellar, criada para conectar pessoas apoiadoras a projetos de impacto social liderados por mulheres.",
              },
              {
                question: "Preciso entender blockchain para doar?",
                answer:
                  "Não. A interface foi desenhada sem jargões complexos. Você só precisa conectar uma carteira compatível e seguir as instruções.",
              },
              {
                question: "Minha doação pode ser deduzida?",
                answer:
                  "Quando aplicável, a plataforma informa os percentuais estimados de incentivo fiscal durante o fluxo de contribuição. A validação final deve ser feita com orientação contábil ou tributária.",
              },
              {
                question: "O que é o Certificado Digital de Impacto?",
                answer:
                  "É um registro digital intransferível na rede Stellar que serve como prova transparente do seu apoio ao projeto.",
              },
              {
                question: "Empresas podem doar?",
                answer:
                  "Sim. A plataforma está preparada para contribuições de pessoas jurídicas, com informações específicas sobre incentivos e prestação de contas quando aplicáveis.",
              },
              {
                question: "Como funciona dedução PF e PJ?",
                answer:
                  "PF pode deduzir até 6% no IRPF completo. PJ pode deduzir de 1% a 4%, dependendo da lei de incentivo.",
              },
              {
                question: "Como ONGs enviam projetos?",
                answer:
                  "Representantes devem cadastrar a iniciativa, informar os dados da organização, definir a carteira Stellar e submeter o projeto para revisão administrativa.",
              },
              {
                question: "Quais documentos são necessários?",
                answer:
                  "Documentação legal da ONG, CNPJ ativo e certificados governamentais relativos às tags fiscais escolhidas.",
              },
              {
                question: "O que é Stellar?",
                answer:
                  "Stellar é uma rede blockchain de código aberto otimizada para pagamentos rápidos, seguros e com taxas mínimas.",
              },
              {
                question: "Por que usar blockchain?",
                answer:
                  "A blockchain ajuda a registrar apoios de forma transparente, automatizando a divisão de valores e criando registros seguros.",
              },
            ].map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="bg-background-light rounded-xl border border-gray-100 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex cursor-pointer items-center justify-between gap-1.5 p-4 text-left text-gray-900 font-bold"
                    aria-expanded={isOpen}
                  >
                    <h3 className="text-lg">{faq.question}</h3>

                    <span
                      className={`material-icons-outlined transition-transform duration-300 ${
                        isOpen ? "-rotate-180" : "rotate-0"
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 pb-4 leading-relaxed text-gray-700">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-[var(--color-primary)] px-4 py-20 text-center text-[var(--color-white)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[var(--font-heading)] text-3xl font-bold leading-tight sm:text-4xl">
            Pronta para apoiar projetos que transformam futuros?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72">
            Conheça iniciativas em andamento e ajude a construir uma rede mais
            <br className="hidden sm:block" />
            forte, diversa e tecnológica.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/projetos"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-7 py-3 text-sm font-semibold text-[var(--color-black)] transition hover:bg-[var(--color-accent-dark)]"
            >
              Explorar projetos
              <ArrowRight size={16} strokeWidth={2} />
            </Link>

            <Link
              to="/contato"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-[var(--color-white)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Fale com a gente
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
