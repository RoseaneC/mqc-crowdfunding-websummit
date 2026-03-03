import { useEffect, useState } from "react";
import {
  getAdminDashboard,
  getAdminReportSummary,
  type AdminDashboardDTO,
} from "../../util/crowdfundingApi";

const emptyDashboard: AdminDashboardDTO = {
  activity: [],
  featuredProjects: [],
};

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalXlm: 0,
    projectXlm: 0,
    feeXlm: 0,
    totalProjects: 0,
    uniqueDonors: 0,
  });
  const [dashboard, setDashboard] = useState<AdminDashboardDTO>(emptyDashboard);

  useEffect(() => {
    void Promise.all([getAdminReportSummary(), getAdminDashboard()])
      .then(([summaryResponse, dashboardResponse]) => {
        setSummary(summaryResponse);
        setDashboard(dashboardResponse);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Visao Geral do Admin</h1>
          <p className="text-slate-500 mt-1 text-sm">Acompanhe o desempenho da plataforma e metricas principais.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Total Arrecadado" value={`${summary.totalXlm.toLocaleString("pt-BR")} XLM`} subtitle={`Liquido projetos: ${summary.projectXlm.toLocaleString("pt-BR")} XLM`} />
        <MetricCard title="Doadores Ativos" value={summary.uniqueDonors.toLocaleString("pt-BR")} subtitle="No ultimo mes" />
        <MetricCard title="Projetos em Analise" value={summary.totalProjects.toLocaleString("pt-BR")} subtitle="Aguardando aprovacao" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Arrecadacao Mensal</h3>
          <p className="text-sm text-slate-500 mb-6">Comparativo XLM vs BRL</p>
          <div className="flex-1 border-b-2 border-l-2 border-slate-100 relative min-h-[200px] flex items-end">
            <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,80 Q25,75 50,60 T100,20 L100,100 L0,100 Z" fill="rgba(0,43,153,0.05)" />
              <path d="M0,80 Q25,75 50,60 T100,20" fill="none" stroke="#002B99" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Atividade Recente</h3>
          <div className="space-y-5">
            {dashboard.activity.map((item) => (
              <div key={`${item.title}-${item.timeLabel}`} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                  <span className="material-icons text-[16px]">{item.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{item.timeLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Projetos em Destaque</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Nome do Projeto</th>
                <th className="px-6 py-4">Lider</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboard.featuredProjects.map((project) => (
                <tr className="hover:bg-slate-50" key={`${project.name}-${project.leader}`}>
                  <td className="px-6 py-4 font-medium text-slate-900">{project.name}</td>
                  <td className="px-6 py-4 text-slate-500">{project.leader}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">{project.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#002B99] font-bold text-xs">{project.action}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard(props: { title: string; value: string; subtitle: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-slate-500 text-sm font-medium mb-1">{props.title}</p>
      <h2 className="text-3xl font-black text-slate-900">{props.value}</h2>
      <p className="text-slate-400 text-xs mt-1">{props.subtitle}</p>
    </div>
  );
}
