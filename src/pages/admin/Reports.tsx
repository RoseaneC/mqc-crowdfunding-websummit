import { useEffect, useState } from "react";
import {
  getAdminReports,
  type AdminReportsDTO,
} from "../../util/crowdfundingApi";
import {
  buildNftTokenExplorerUrl,
  buildTransactionExplorerUrl,
  getExplorerLabel,
} from "../../util/explorerLinks";

const emptyData: AdminReportsDTO = {
  kpis: {
    totalCollectedXlm: 0,
    activeDonors: 0,
    fundedProjects: 0,
    avgTicketXlm: 0,
  },
  distribution: [],
  topProjects: [],
  recentDonations: [],
};

export default function Reports() {
  const [data, setData] = useState<AdminReportsDTO>(emptyData);
  const explorerLabel = getExplorerLabel();

  useEffect(() => {
    void getAdminReports()
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-[#002B99] tracking-tight">Relatorios e Analitico</h1>
        <p className="text-slate-500 mt-1 text-sm">Visualize o impacto e a distribuicao das doacoes por incentivo fiscal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Total Arrecadado" value={`${data.kpis.totalCollectedXlm.toLocaleString("pt-BR")} XLM`} />
        <KpiCard title="Doadores Ativos" value={data.kpis.activeDonors.toLocaleString("pt-BR")} />
        <KpiCard title="Projetos Financiados" value={data.kpis.fundedProjects.toLocaleString("pt-BR")} />
        <KpiCard title="Ticket Medio" value={`${data.kpis.avgTicketXlm.toLocaleString("pt-BR")} XLM`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Distribuicao por Incentivo Fiscal</h3>
          <div className="h-64 flex items-end justify-around pb-6 gap-2 sm:gap-4 relative border-b border-slate-100 mt-10">
            {data.distribution.map((item) => (
              <div key={item.label} className="w-12 sm:w-16 bg-[#002B99] rounded-t-sm relative group" style={{ height: `${item.percent}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.percent}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-around text-xs text-[#002B99] font-medium pt-4 uppercase">
            {data.distribution.map((item) => (
              <span key={`${item.label}-legend`}>{item.label}</span>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top Projetos</h3>
          <div className="space-y-4">
            {data.topProjects.map((project) => (
              <div key={project.rank} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-100 text-[#002B99] flex items-center justify-center font-black text-sm">
                    {project.rank}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{project.name}</p>
                    <p className="text-[10px] text-[#002B99]">{project.incentive}</p>
                  </div>
                </div>
                <span className="font-black text-slate-900">
                  {project.totalProjectXlm.toLocaleString("pt-BR")} XLM
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Ultimas Doacoes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-slate-900 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Doador</th>
                <th className="px-6 py-4">Projeto</th>
                <th className="px-6 py-4">Incentivo</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Tx</th>
                <th className="px-6 py-4 text-center">NFT</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentDonations.map((donation) => (
                <tr className="hover:bg-slate-50" key={donation.id}>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {shortWallet(donation.donorWallet)}
                  </td>
                  <td className="px-6 py-4 text-[#002B99]">{donation.project}</td>
                  <td className="px-6 py-4">{donation.incentive}</td>
                  <td className="px-6 py-4 text-[#002B99]">
                    {new Date(donation.confirmedAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {donation.amountXlm.toLocaleString("pt-BR")} XLM
                  </td>
                  <td className="px-6 py-4 text-center">
                    {buildTransactionExplorerUrl(donation.txHash) ? (
                      <a
                        href={buildTransactionExplorerUrl(donation.txHash) ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#002B99] hover:underline inline-flex items-center gap-1"
                        title={`Abrir transacao no ${explorerLabel}`}
                      >
                        Tx
                        <span className="material-icons text-sm">open_in_new</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {buildNftTokenExplorerUrl(donation.nftId) ? (
                      <a
                        href={buildNftTokenExplorerUrl(donation.nftId) ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline inline-flex items-center gap-1"
                        title={`Abrir NFT no ${explorerLabel}`}
                      >
                        NFT
                        <span className="material-icons text-sm">open_in_new</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="material-icons text-[18px]">check_circle</span>
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

function shortWallet(wallet: string) {
  if (wallet.length <= 12) return wallet;
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

function KpiCard(props: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-slate-500 text-sm font-medium mb-1">{props.title}</p>
      <h2 className="text-3xl font-black text-slate-900">{props.value}</h2>
    </div>
  );
}
