import { useEffect, useState } from "react";
import { getAdminMrosc, type AdminMroscDTO } from "../../util/crowdfundingApi";

const emptyData: AdminMroscDTO = {
  summary: { pending: 0, inReview: 0, approved: 0, activeOrgs: 0 },
  reports: [],
  totalResults: 0,
};

export default function MROSC() {
  const [data, setData] = useState<AdminMroscDTO>(emptyData);

  useEffect(() => {
    void getAdminMrosc()
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Conformidade MROSC</h1>
        <p className="text-slate-500 mt-1 text-sm">Analise e valide os relatorios de execucao financeira para garantir a conformidade.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard title="Pendentes de Analise" value={data.summary.pending} />
        <SummaryCard title="Em Analise" value={data.summary.inReview} />
        <SummaryCard title="Aprovados (Mes)" value={data.summary.approved} />
        <SummaryCard title="ONGs Ativas" value={data.summary.activeOrgs} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-900 text-[11px] font-black border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ONG / Organizacao</th>
                <th className="px-6 py-4">Projeto Referencia</th>
                <th className="px-6 py-4">Data de Envio</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.reports.map((report) => (
                <tr className="hover:bg-slate-50" key={`${report.org}-${report.projectId}`}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{report.org}</p>
                    <p className="text-[10px] text-slate-500">CNPJ: {report.cnpj}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{report.project}</p>
                    <p className="text-[10px] text-slate-500">ID: {report.projectId}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{report.submitted}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{report.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 text-xs text-slate-500">
          Mostrando {data.reports.length} de {data.totalResults} resultados
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
