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
    const manuallyFeatured = approvedProjects.filter(
      (project) => project.featured,
    );

    if (manuallyFeatured.length > 0) {
      return manuallyFeatured.slice(0, 3);
    }

    const selectedProjects = featuredProjectIds
      .map((id) =>
        approvedProjects.find((project) => String(project.id) === id),
      )
      .filter((project): project is ProjectDTO => Boolean(project));

    return selectedProjects;
  }, [projects]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-body">
      {/* HERO */}
      <header className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-background)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-y-0 left-0 w-2 bg-[var(--color-primary)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[var(--color-border)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-dark)]">
              Ponteia | impacto com transparencia
            </p>

            <h1 className="mt-7 max-w-4xl font-[var(--font-heading)] text-5xl font-semibold leading-[1.02] tracking-tight text-[var(--color-text)] sm:text-6xl lg:text-7xl">
              Apoie projetos que transformam territorios
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--color-text-muted)]">
              A Ponteia conecta pessoas e empresas a iniciativas sociais,
              culturais e ambientais. Voce escolhe o projeto, contribui como
              preferir e acompanha o impacto com transparencia.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/projetos"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-[var(--color-white)] transition hover:bg-[var(--color-primary-dark)]"
              >
                Conhecer projetos
              </Link>
              <Link
                to="/#comoFunciona"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-transparent px-7 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
              >
                Como funciona
              </Link>
            </div>

            <div className="mt-12 grid gap-4 border-t border-[var(--color-border)] pt-8 sm:grid-cols-3">
              {["Social", "Cultural", "Ambiental"].map((axis) => (
                <div key={axis}>
                  <span className="block h-1 w-10 bg-[var(--color-accent)]" />
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                    {axis}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-5 -top-5 h-full w-full border border-[var(--color-border)]" />
            <Image
              src={fotoMeninas}
              alt="Pessoas reunidas em programa de impacto social"
              className="relative h-[520px] w-full rounded-sm object-cover shadow-[0_28px_80px_rgba(28,26,23,0.16)]"
              priority
            />
            <div className="absolute bottom-6 left-6 max-w-xs border border-white/25 bg-[rgba(26,74,46,0.92)] p-5 text-white backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Tecnologia como meio
              </p>
              <p className="mt-2 text-sm leading-6">
                Recursos, registros e prestacao de contas a servico de projetos
                reais.
              </p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-7xl">
          <div
            id="sobreNos"
            className="scroll-mt-24 border-t border-[var(--color-border)] pt-14 text-left"
          >
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="border-l-4 border-[var(--color-accent)] pl-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">
                  Sobre a Ponteia
                </p>
                <h2 className="mt-5 max-w-3xl font-[var(--font-heading)] text-3xl font-semibold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl lg:text-[3rem]">
                  Uma ponte entre recursos, territorios e prestacao de contas.
                </h2>
              </div>

              <div>
                <p className="max-w-2xl text-lg leading-9 text-[var(--color-text-muted)]">
                  A Ponteia nasceu para aproximar apoiadores, organizacoes e
                  projetos sociais, culturais e ambientais com clareza, cuidado
                  e governanca simples.
                </p>

                <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-text-muted)]">
                  A plataforma organiza iniciativas de impacto, apoio via PIX,
                  contribuicoes digitais estaveis e evidencias para prestacao de
                  contas. A tecnologia fica a servico da confianca.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section
        id="projetos-destaque"
        className="relative overflow-hidden bg-[var(--color-white)] py-20 sm:py-24"
      >
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-[var(--font-heading)] text-3xl font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl lg:text-5xl">
                Conheça algumas iniciativas que já estão na plataforma
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
                Um primeiro olhar para iniciativas que unem territorio, cultura,
                sustentabilidade e impacto social com prestacao de contas.
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
            <div className="rounded-sm border border-[var(--color-border)] bg-[var(--color-white)] p-8 text-sm font-medium text-[var(--color-text-muted)] shadow-[0_18px_44px_rgba(28,26,23,0.05)]">
              Carregando projetos em destaque...
            </div>
          ) : projectsError ? (
            <div className="rounded-sm border border-rose-200 bg-rose-50 p-8">
              <p className="text-sm font-semibold text-rose-700">
                Não foi possível carregar os projetos em destaque.
              </p>
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="rounded-sm border border-[var(--color-border)] bg-[var(--color-white)] p-8 text-sm font-medium text-[var(--color-text-muted)] shadow-[0_18px_44px_rgba(28,26,23,0.05)]">
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
                    className="group relative flex min-h-[455px] flex-col overflow-hidden rounded-sm border border-[var(--color-border)] bg-[var(--color-white)] shadow-[0_18px_44px_rgba(28,26,23,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(28,26,23,0.12)]"
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
                    <div className="relative h-56 overflow-hidden bg-[var(--color-primary-light)]">
                      <img
                        src={projectImage}
                        alt={`Imagem do projeto ${project.title}`}
                        className="h-full w-full transform-gpu object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(28,26,23,0.02),rgba(26,74,46,0.38))]" />
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
                          className="group/button inline-flex items-center gap-3 text-sm font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-accent-dark)]"
                        >
                          Saiba mais
                          <span className="h-px w-8 bg-current transition group-hover/button:w-12" />
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
        className="relative w-full scroll-mt-24 overflow-hidden border-y border-[var(--color-border)] bg-[var(--color-surface)] py-16"
      >
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-dark)]">
            Rede que fortalece a Ponteia
          </p>
          <h2 className="mt-3 font-[var(--font-heading)] text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-4xl">
            Nossos parceiros
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
            Organizacoes e iniciativas que ajudam a conectar recursos,
            tecnologia e impacto nos territorios.
          </p>
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--color-surface)] to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--color-surface)] to-transparent sm:w-32" />

        <div className="w-full pt-12">
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
                        alt={`Logo ${p.name}`}
                        className={
                          p.name === "ITS"
                            ? "h-12 w-auto scale-[1.12] object-contain opacity-90 transition-opacity hover:opacity-100 sm:h-14 sm:scale-[1.16] lg:h-16"
                            : "h-12 w-auto object-contain opacity-90 transition-opacity hover:opacity-100 sm:h-14 lg:h-16"
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
        id="comoFunciona"
        className="scroll-mt-24 bg-[var(--color-white)] py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mt-4 font-[var(--font-heading)] text-3xl font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl lg:text-5xl">
              Como funciona
            </h2>

            <p className="mt-3 font-[var(--font-body)] text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
              Apoiar um projeto deve ser simples, transparente e facil de
              acompanhar.
            </p>
          </div>

          <motion.div
            className="grid gap-10 md:grid-cols-3 md:gap-8 lg:gap-10"
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
                title: "Escolha um projeto",
                description:
                  "Conheca iniciativas sociais, culturais e ambientais prontas para receber apoio.",
              },
              {
                number: "02",
                title: "Contribua como preferir",
                description:
                  "Apoie via PIX ou moedas digitais estaveis na rede Celo.",
              },
              {
                number: "03",
                title: "Acompanhe o impacto",
                description:
                  "Veja atualizacoes, registros e prestacao de contas do projeto apoiado.",
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

      <section className="bg-[var(--color-surface)] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="font-[var(--font-heading)] text-3xl font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl lg:text-5xl">
              Por que confiar na Ponteia
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
              A plataforma combina analise de projetos, registro das
              contribuicoes digitais e espaco para prestacao de contas.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Projetos passam por analise",
                text: "Iniciativas cadastradas podem ser revisadas antes de aparecerem para apoio publico.",
              },
              {
                title: "Contribuicoes digitais tem registro publico",
                text: "Quando o apoio acontece por moeda digital, a transacao fica verificavel na rede Celo.",
              },
              {
                title: "Projetos publicam evidencias",
                text: "Atualizacoes, registros e comprovantes ajudam apoiadores a acompanhar o uso dos recursos.",
              },
              {
                title: "PIX vai direto para a organizacao",
                text: "A chave PIX pertence ao projeto ou organizacao responsavel, sem criar pagamento blockchain.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-sm border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-[0_14px_40px_rgba(28,26,23,0.05)]"
              >
                <span className="block h-1 w-10 bg-[var(--color-accent)]" />
                <h3 className="mt-6 font-[var(--font-heading)] text-lg font-semibold leading-snug text-[var(--color-text)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[var(--color-white)] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-[var(--color-text)] text-center mb-12">
            Perguntas Frequentes
          </h2>

          <div className="space-y-4">
            {[
              {
                question: "O que é a plataforma?",
                answer:
                  "Ponteia conecta recursos a projetos de impacto social, cultural e ambiental com transparencia, opcoes simples de apoio e prestacao de contas.",
              },
              {
                question: "Preciso entender blockchain para doar?",
                answer:
                  "Nao. Voce pode apoiar via PIX pelo app do seu banco. Quando escolher uma moeda digital estavel, a Celo funciona como infraestrutura de registro da contribuicao.",
              },
              {
                question: "Minha doação pode ser deduzida?",
                answer:
                  "Quando aplicável, a plataforma informa os percentuais estimados de incentivo fiscal durante o fluxo de contribuição. A validação final deve ser feita com orientação contábil ou tributária.",
              },
              {
                question: "O que é o Certificado Digital de Impacto?",
                answer:
                  "É um registro de apoio vinculado à prestação de contas do projeto, pensado para facilitar transparência e acompanhamento de impacto.",
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
                  "Representantes devem cadastrar a iniciativa, informar os dados da organização, definir a wallet EVM/Celo para USDGLO, configurar PIX quando houver e submeter o projeto para revisão administrativa.",
              },
              {
                question: "Quais documentos são necessários?",
                answer:
                  "Documentação legal da ONG, CNPJ ativo e certificados governamentais relativos às tags fiscais escolhidas.",
              },
              {
                question: "O que é Celo?",
                answer:
                  "A Celo funciona como infraestrutura de registro das contribuicoes digitais. Voce nao precisa entender a tecnologia para apoiar um projeto.",
              },
              {
                question: "O que sao USDGLO e USDC?",
                answer:
                  "USDGLO e USDC sao moedas digitais estaveis. Na Ponteia, USDGLO ja permite contribuicoes rastreaveis na Celo; USDC esta preparado e sera ativado quando o contrato oficial estiver configurado.",
              },
            ].map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-sm border border-[var(--color-border)] bg-[var(--color-background)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex cursor-pointer items-center justify-between gap-1.5 p-4 text-left text-[var(--color-text)] font-bold"
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
                      <p className="px-4 pb-4 leading-relaxed text-[var(--color-text-muted)]">
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
      <section
        id="contato"
        className="scroll-mt-24 bg-[var(--color-primary)] px-4 py-20 text-center text-[var(--color-white)] sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[var(--font-heading)] text-3xl font-bold leading-tight sm:text-4xl">
            Pronta para apoiar projetos que transformam territorios?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72">
            Conheca iniciativas em andamento e acompanhe como cada apoio pode
            gerar impacto concreto.
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
