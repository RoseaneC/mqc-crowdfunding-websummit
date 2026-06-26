import { useEffect, useState } from "react";
import {
  createProjectEvidence,
  listProjects,
  listProjectEvidences,
  type ProjectDTO,
} from "../../util/crowdfundingApi";

const evidenceTypes = [
  ["REPORT", "Relatorio"],
  ["INVOICE_PHOTO", "Foto de nota fiscal"],
  ["CLASS_PHOTO", "Foto de aula/atividade"],
  ["TESTIMONIAL", "Depoimento"],
  ["IMPACT_REPORT", "Relatorio de impacto"],
  ["OTHER", "Outro"],
];

export default function ProjectEvidenceDashboard() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [projectId, setProjectId] = useState("");
  const [evidences, setEvidences] = useState<
    Awaited<ReturnType<typeof listProjectEvidences>>["data"]
  >([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "REPORT",
    fileUrl: "",
    fileName: "",
    mimeType: "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void listProjects()
      .then((items) => {
        setProjects(items);
        setProjectId(String(items[0]?.id ?? ""));
      })
      .catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    if (!projectId) return;
    void listProjectEvidences(projectId)
      .then((response) => setEvidences(response.data))
      .catch(() => setEvidences([]));
  }, [projectId]);

  const handleSubmit = async () => {
    if (!projectId) {
      setFeedback("Selecione um projeto.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await createProjectEvidence(projectId, {
        title: form.title,
        description: form.description,
        type: form.type,
        fileUrl: form.fileUrl,
        fileName: form.fileName || null,
        mimeType: form.mimeType || null,
      });

      setForm({
        title: "",
        description: "",
        type: "REPORT",
        fileUrl: "",
        fileName: "",
        mimeType: "",
      });
      const response = await listProjectEvidences(projectId);
      setEvidences(response.data);
      setFeedback("Evidencia registrada.");
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Falha ao registrar evidencia.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#002B99]">
            Prestacao de contas
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Evidencias do projeto
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Upload real ainda nao esta configurado. Use uma URL manual por
            enquanto. TODO: integrar Vercel Blob, S3 ou Supabase Storage.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <label className="block">
              <span className="text-xs font-bold uppercase text-slate-500">
                Projeto
              </span>
              <select
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-5 grid gap-4">
              <Input
                label="Titulo"
                value={form.title}
                onChange={(value) =>
                  setForm((current) => ({ ...current, title: value }))
                }
              />
              <label>
                <span className="text-xs font-bold uppercase text-slate-500">
                  Tipo
                </span>
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                >
                  {evidenceTypes.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-xs font-bold uppercase text-slate-500">
                  Descricao
                </span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                />
              </label>
              <Input
                label="URL do arquivo"
                value={form.fileUrl}
                onChange={(value) =>
                  setForm((current) => ({ ...current, fileUrl: value }))
                }
              />
              <Input
                label="Nome do arquivo"
                value={form.fileName}
                onChange={(value) =>
                  setForm((current) => ({ ...current, fileName: value }))
                }
              />
              <Input
                label="MIME type"
                value={form.mimeType}
                onChange={(value) =>
                  setForm((current) => ({ ...current, mimeType: value }))
                }
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleSubmit()}
                className="rounded-xl bg-[#002B99] px-5 py-3 text-sm font-black uppercase text-white disabled:opacity-60"
              >
                {isSubmitting ? "Salvando..." : "Registrar evidencia"}
              </button>
              {feedback ? (
                <p className="text-sm font-bold text-slate-600">{feedback}</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-black text-slate-900">
              Evidencias registradas
            </h2>
            <div className="mt-5 space-y-3">
              {evidences.map((evidence) => (
                <article
                  key={evidence.id}
                  className="rounded-xl border border-slate-200 p-4 text-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {evidence.title}
                      </h3>
                      <p className="mt-1 text-xs uppercase text-slate-500">
                        {evidence.type} - {evidence.status}
                      </p>
                    </div>
                    <a
                      href={evidence.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#002B99] hover:underline"
                    >
                      Abrir
                    </a>
                  </div>
                  <p className="mt-3 text-slate-600">{evidence.description}</p>
                </article>
              ))}
              {evidences.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhuma evidencia registrada para este projeto.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Input(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="text-xs font-bold uppercase text-slate-500">
        {props.label}
      </span>
      <input
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
      />
    </label>
  );
}
