import { useEffect, useState } from "react";
import {
  getAdminProjects,
  type AdminProjectsDTO,
} from "../../util/crowdfundingApi";

const emptyData: AdminProjectsDTO = {
  summary: { pending: 0, approved: 0, rejected: 0, totalProjects: 0 },
  recentRequests: [],
  selectedRequest: {
    status: "Pendente",
    idLabel: "",
    title: "",
    submittedAt: "",
    organization: "",
    contactName: "",
    contactEmail: "",
    cnpj: "",
    cnpjStatus: "",
    location: "",
    description: "",
  },
};

export default function Projects() {
  const [data, setData] = useState<AdminProjectsDTO>(emptyData);

  useEffect(() => {
    void getAdminProjects()
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Aprovacao de Projetos</h1>
        <p className="text-slate-500 mt-1 text-sm">Gerencie as solicitacoes e analise os detalhes para aprovacao.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <SummaryCard title="Pendentes" value={data.summary.pending} />
        <SummaryCard title="Aprovados" value={data.summary.approved} />
        <SummaryCard title="Rejeitados" value={data.summary.rejected} />
        <SummaryCard title="Total Projetos" value={data.summary.totalProjects} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
        <div className="xl:col-span-1 space-y-4">
          <h3 className="font-bold text-slate-900 mb-2">Solicitacoes Recentes</h3>
          {data.recentRequests.map((request) => (
            <div
              key={`${request.name}-${request.timeLabel}`}
              className={`bg-white p-4 rounded-xl border ${request.active ? "border-2 border-[#002B99]" : "border-slate-200"}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-white text-xs font-black">
                  {request.initials}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{request.name}</h4>
                  <p className="text-xs text-slate-500">ONG: {request.ngo}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-[10px] font-bold">{request.status}</span>
                <span className="text-[10px] text-slate-400">{request.timeLabel}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-900 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded">{data.selectedRequest.status}</span>
              <span className="text-slate-300 text-xs">ID: {data.selectedRequest.idLabel}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-2">{data.selectedRequest.title}</h2>
            <p className="text-slate-300 text-sm">{data.selectedRequest.submittedAt}</p>
          </div>

          <div className="p-8 flex-1 space-y-6">
            <InfoRow label="Organizacao" value={data.selectedRequest.organization} />
            <InfoRow label="Contato Responsavel" value={`${data.selectedRequest.contactName} • ${data.selectedRequest.contactEmail}`} />
            <InfoRow label="CNPJ" value={`${data.selectedRequest.cnpj} • ${data.selectedRequest.cnpjStatus}`} />
            <InfoRow label="Localizacao" value={data.selectedRequest.location} />

            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Descricao do Projeto</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{data.selectedRequest.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard(props: { title: string; value: number }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
      <p className="text-slate-500 text-sm font-medium">{props.title}</p>
      <h2 className="text-3xl font-black text-slate-900">{props.value.toLocaleString("pt-BR")}</h2>
    </div>
  );
}

function InfoRow(props: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">{props.label}</p>
      <p className="font-bold text-slate-900">{props.value}</p>
    </div>
  );
}
