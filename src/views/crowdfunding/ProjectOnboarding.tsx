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
    axes: ["SOCIAL"] as ImpactAxis[],
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
      setFeedback("Selecione pelo menos um eixo de impacto.");
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
        axes: ["SOCIAL"],
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
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-10 text-[var(--color-text)] sm:px-6 lg:px-8">
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

        <section className="mt-8 rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
              Cadastro de projetos sociais
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Submeta um projeto para apoio em USDGLO Celo e PIX
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-muted)]">
              O projeto nasce como PENDING e precisa ser aprovado no admin antes
              de aparecer como campanha ativa.
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
                className="mt-2 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
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

            <div className="md:col-span-2 rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Eixos obrigatorios
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {axisOptions.map((axis) => (
                  <label
                    key={axis.value}
                    className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={form.axes.includes(axis.value)}
                      onChange={(event) =>
                        toggleAxis(axis.value, event.target.checked)
                      }
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
              <p className="text-sm font-semibold text-slate-600">{feedback}</p>
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
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {props.label}
      </span>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
      />
    </label>
  );
}
