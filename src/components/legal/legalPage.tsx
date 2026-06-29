"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Footer from "../../components/crowdfunding/Footer";

type LegalSection = {
  title: string;
  paragraphs: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

const navLinks = [
  { label: "Sobre nós", href: "/#sobreNos" },
  { label: "Projetos", href: "/projetos" },
  { label: "Parceiros", href: "/#parceiros" },
  { label: "Contato", href: "/#contato" },
];

export default function LegalPage({
  title,
  description,
  lastUpdated,
  sections,
}: LegalPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[var(--color-white)] font-[var(--font-body)] text-[var(--color-text)]">
      <header className="relative z-50 border-b border-white/10 bg-[var(--color-primary)]">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="flex flex-col leading-none">
              <span className="font-[var(--font-heading)] text-xs font-black uppercase tracking-[0.08em] text-[var(--color-white)] sm:text-sm">
                Ponteia
              </span>
              <span className="mt-1 font-[var(--font-heading)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
                Impacto com transparencia
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-9 text-sm font-medium text-[var(--color-white)] md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="transition hover:text-[var(--color-accent)]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <button
            type="button"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-[var(--color-white)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] md:hidden"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {isMenuOpen ? (
          <div className="absolute left-0 top-16 w-full border-b border-white/10 bg-[var(--color-primary)] px-5 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] md:hidden">
            <div className="flex flex-col gap-4 text-sm font-medium text-[var(--color-white)]">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="transition hover:text-[var(--color-accent)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <section className="relative overflow-hidden bg-[var(--color-primary-dark)]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <h1 className="font-[var(--font-body)] text-4xl font-semibold leading-tight tracking-tight text-[var(--color-white)] sm:text-5xl">
              {title}
            </h1>

            <div className="mt-5 flex items-center gap-3 text-xs font-medium text-[var(--color-accent)] sm:text-sm">
              <span className="h-px w-8 bg-[var(--color-accent)]" />
              <span>Conformidade: Lei nº 13.709/2018</span>
            </div>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              {description}
            </p>

            <p className="mt-5 text-xs text-white/45">
              Última atualização: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <section className="relative bg-[var(--color-white)]">
        <div className="absolute right-20 top-10 hidden h-24 w-24 bg-[radial-gradient(circle,var(--color-primary)_1px,transparent_1px)] bg-[size:10px_10px] opacity-10 lg:block" />
        <div className="absolute bottom-16 right-20 hidden h-24 w-24 bg-[radial-gradient(circle,var(--color-primary)_1px,transparent_1px)] bg-[size:10px_10px] opacity-10 lg:block" />

        <div className="mx-auto max-w-5xl px-6 py-14 lg:px-8 lg:py-16">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <section key={section.title} className="max-w-4xl">
                <div className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-4 shrink-0 rounded-full bg-[var(--color-accent)]" />

                  <div>
                    <h2 className="font-[var(--font-body)] text-xl font-semibold tracking-tight text-[var(--color-text)]">
                      {index + 1}. {section.title.replace(/^\d+\.\s*/, "")}
                    </h2>

                    <div className="mt-5 space-y-4">
                      {section.paragraphs.map((paragraph, paragraphIndex) => (
                        <p
                          key={paragraph}
                          className="text-sm leading-7 text-[var(--color-text-muted)]"
                        >
                          <span className="font-medium text-[var(--color-text)]">
                            {index + 1}.{paragraphIndex + 1}{" "}
                          </span>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
