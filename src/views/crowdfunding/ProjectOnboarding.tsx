import { useState } from "react";
import { Link } from "react-router-dom";
import { createProject, type ImpactAxis } from "../../util/crowdfundingApi";

const axisOptions: Array<{ value: ImpactAxis; label: string }> = [
  { value: "AMBIENTAL", label: "Impacto Ambiental" },
  { value: "CULTURAL", label: "Impacto Cultural" },
  { value: "SOCIAL", label: "Impacto Social" },
];

export default function ProjectOnboarding() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    organization: "",
    responsibleName: "",
    responsibleEmail: "",
    walletAddress: "",
    pixKey: "",
    pixQrCodeUrl: "",
    goalAmount: "",
    axes: [] as ImpactAxis[],
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleAxis = (axis: ImpactAxis, checked: boolean) => {
    setForm((current) => ({
      ...current,
      axes: checked
        ? [...new Set([...current.axes, axis])]
        : current.axes.filter((item) => item !== axis),
    }));
  };

  const handleSubmit = async () => {
    setFeedback(null);

    if (form.axes.length === 0) {
      setFeedback(
        "Selecione pelo menos um eixo de impacto para cadastrar o projeto.",
      );
      return;
    }

    if (form.walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(form.walletAddress)) {
      setFeedback("A wallet EVM precisa comecar com 0x.");
      return;
    }

    if (!form.walletAddress && !form.pixKey && !form.pixQrCodeUrl) {
      setFeedback("Informe uma wallet EVM, chave PIX ou URL de QR Code PIX.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createProject({
        name: form.name,
        title: form.name,
        description: form.description,
        organization: form.organization,
        ngoName: form.organization,
        responsibleName: form.responsibleName,
        responsibleEmail: form.responsibleEmail,
        walletAddress: form.walletAddress || null,
        ngoWallet: form.walletAddress || "",
        pixKey: form.pixKey || null,
        pixQrCodeUrl: form.pixQrCodeUrl || null,
        goalAmount: Number(form.goalAmount),
        targetXlm: Number(form.goalAmount),
        goalAsset: "USDGLO",
        axes: form.axes,
        taxCategory: form.axes.join(", "),
        metadataUri: "impact-project-onboarding",
      });

      setFeedback("Projeto enviado para analise. Status inicial: PENDING.");
      setForm({
        name: "",
        description: "",
        organization: "",
        responsibleName: "",
        responsibleEmail: "",
        walletAddress: "",
        pixKey: "",
        pixQrCodeUrl: "",
        goalAmount: "",
        axes: [],
      });
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Falha ao cadastrar projeto.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-10 text-[var(--color-text)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/projetos"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]"
        >
          <span className="material-symbols-outlined text-base">
            arrow_back
          </span>
          Voltar para projetos
        </Link>

        <section className="mt-8 rounded-sm border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_44px_rgba(28,26,23,0.06)] sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
              Cadastro de projetos sociais
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Cadastre um projeto para receber apoio pela Ponteia
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-muted)]">
              A equipe revisa as informacoes antes de publicar a campanha para
              apoiadores.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <TextInput
              label="Nome do projeto"
              value={form.name}
              onChange={(value) => updateField("name", value)}
            />
            <TextInput
              label="Organizacao"
              value={form.organization}
              onChange={(value) => updateField("organization", value)}
            />
            <TextInput
              label="Responsavel"
              value={form.responsibleName}
              onChange={(value) => updateField("responsibleName", value)}
            />
            <TextInput
              label="E-mail"
              type="email"
              value={form.responsibleEmail}
              onChange={(value) => updateField("responsibleEmail", value)}
            />
            <label className="md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Descricao
              </span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className="mt-2 min-h-32 w-full rounded-sm border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
              />
            </label>

            <TextInput
              label="Meta em USDGLO"
              type="number"
              value={form.goalAmount}
              onChange={(value) => updateField("goalAmount", value)}
            />
            <TextInput
              label="Wallet EVM do projeto (0x...)"
              value={form.walletAddress}
              onChange={(value) => updateField("walletAddress", value)}
            />
            <p className="rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm leading-6 text-[var(--color-text-muted)]">
              Endereco EVM/Celo que recebera contribuicoes digitais em USDGLO.
            </p>
            <TextInput
              label="Chave PIX"
              value={form.pixKey}
              onChange={(value) => updateField("pixKey", value)}
            />
            <TextInput
              label="URL do QR Code PIX"
              value={form.pixQrCodeUrl}
              onChange={(value) => updateField("pixQrCodeUrl", value)}
            />

            <p className="md:col-span-2 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm leading-6 text-[var(--color-text-muted)]">
              O PIX permite transferencias diretas para o projeto pelo app do
              banco, fora da blockchain.
            </p>

            <div className="md:col-span-2 rounded-sm border border-[var(--color-border)] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Eixos obrigatorios
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Selecione pelo menos um eixo para orientar a analise e a
                prestacao de contas do projeto.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {axisOptions.map((axis) => (
                  <label
                    key={axis.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-3 text-sm font-semibold transition ${
                      form.axes.includes(axis.value)
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.axes.includes(axis.value)}
                      onChange={(event) =>
                        toggleAxis(axis.value, event.target.checked)
                      }
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                    {axis.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleSubmit()}
              className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar para analise"}
            </button>
            {feedback ? (
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">
                {feedback}
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function TextInput(props: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-soft)]">
        {props.label}
      </span>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        className="mt-2 w-full rounded-sm border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
      />
    </label>
  );
}
