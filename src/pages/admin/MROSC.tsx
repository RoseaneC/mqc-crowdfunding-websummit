import { useEffect, useState } from "react";
import {
  getAdminMrosc,
  updateMroscReportStatus,
  type AdminMroscDTO,
} from "../../util/crowdfundingApi";
import { useAuth } from "../../providers/AuthProvider";

const emptyData: AdminMroscDTO = {
  summary: {
    pending: 0,
    inReview: 0,
    approved: 0,
    rejected: 0,
    totalResults: 0,
    activeOrgs: 0,
  },
  reports: [],
};

export default function MROSC() {
  const { hasRole } = useAuth();
  const isSuperadmin = hasRole("SUPERADMIN");
  const [data, setData] = useState<AdminMroscDTO>(emptyData);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadMrosc = async () => {
    setError(null);
    const response = await getAdminMrosc();
    setData(response);
  };

  useEffect(() => {
    void loadMrosc().catch(() =>
      setError("Nao foi possivel carregar os relatorios MROSC."),
    );
  }, []);

  const handleStatusChange = async (
    reportId: number,
    status: "IN_REVIEW" | "APPROVED" | "REJECTED",
  ) => {
    setUpdatingId(reportId);
    setError(null);
    try {
      await updateMroscReportStatus(reportId, { status });
      await loadMrosc();
    } catch {
      setError("Falha ao atualizar status do relatorio.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Conformidade MROSC</h1>
        <p className="text-slate-500 mt-1 text-sm">Analise e valide os relatorios de execucao financeira para garantir a conformidade.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard title="Pendentes de Analise" value={data.summary.pending} />
        <SummaryCard title="Em Analise" value={data.summary.inReview} />
        <SummaryCard title="Aprovados" value={data.summary.approved} />
        <SummaryCard title="ONGs Ativas" value={data.summary.activeOrgs} />
      </div>
      {error ? <p className="text-sm font-bold text-red-600 mb-4">{error}</p> : null}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-900 text-[11px] font-black border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ONG / Wallet</th>
                <th className="px-6 py-4">Projeto</th>
                <th className="px-6 py-4">Periodo</th>
                <th className="px-6 py-4">Total Declarado</th>
                <th className="px-6 py-4">Data de Envio</th>
                <th className="px-6 py-4">Status</th>
                {isSuperadmin ? <th className="px-6 py-4">Acoes</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.reports.map((report) => (
                <tr className="hover:bg-slate-50" key={report.id}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{report.ngoName}</p>
                    <p className="text-[10px] text-slate-500">
                      Wallet: {shortWallet(report.ngoWallet)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{report.projectTitle}</p>
                    <p className="text-[10px] text-slate-500">ID: #{report.projectId}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {new Date(report.periodStart).toLocaleDateString("pt-BR")} -{" "}
                    {new Date(report.periodEnd).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-semibold">
                    {Number(report.financialTotalXlm).toLocaleString("pt-BR")} XLM
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {new Date(report.submittedAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{report.status}</span>
                  </td>
                  {isSuperadmin ? (
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {report.status === "PENDING" ? (
                          <button
                            type="button"
                            disabled={updatingId === report.id}
                            onClick={() =>
                              void handleStatusChange(report.id, "IN_REVIEW")
                            }
                            className="rounded bg-blue-50 text-blue-700 px-2 py-1 text-[10px] font-bold"
                          >
                            Em análise
                          </button>
                        ) : null}
                        {report.status === "IN_REVIEW" ? (
                          <>
                            <button
                              type="button"
                              disabled={updatingId === report.id}
                              onClick={() =>
                                void handleStatusChange(report.id, "APPROVED")
                              }
                              className="rounded bg-green-50 text-green-700 px-2 py-1 text-[10px] font-bold"
                            >
                              Aprovar
                            </button>
                            <button
                              type="button"
                              disabled={updatingId === report.id}
                              onClick={() =>
                                void handleStatusChange(report.id, "REJECTED")
                              }
                              className="rounded bg-red-50 text-red-700 px-2 py-1 text-[10px] font-bold"
                            >
                              Rejeitar
                            </button>
                          </>
                        ) : null}
                        {report.status === "REJECTED" ? (
                          <button
                            type="button"
                            disabled={updatingId === report.id}
                            onClick={() =>
                              void handleStatusChange(report.id, "IN_REVIEW")
                            }
                            className="rounded bg-amber-50 text-amber-700 px-2 py-1 text-[10px] font-bold"
                          >
                            Reabrir
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 text-xs text-slate-500">
          Mostrando {data.reports.length} de {data.summary.totalResults} resultados
        </div>
      </div>
    </div>
  );
}

function SummaryCard(props: { title: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-slate-500 text-sm font-medium">{props.title}</p>
      <h2 className="text-4xl font-black text-slate-900">{props.value.toLocaleString("pt-BR")}</h2>
    </div>
  );
}

function shortWallet(wallet: string) {
  if (wallet.length <= 14) return wallet;
  return `${wallet.slice(0, 6)}...${wallet.slice(-6)}`;
}
