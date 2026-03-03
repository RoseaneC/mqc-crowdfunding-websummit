import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDonations } from "../../providers/DonationProvider";
import {
  listNftCatalog,
  listProjectMedia,
  type NftCatalogItemDTO,
  type ProjectMediaItemDTO,
} from "../../util/crowdfundingApi";

export default function Dashboard() {
  const { donations } = useDonations();
  const [catalog, setCatalog] = useState<NftCatalogItemDTO[]>([]);
  const [projectMedia, setProjectMedia] = useState<ProjectMediaItemDTO[]>([]);
  const [selectedNft, setSelectedNft] = useState<NftCatalogItemDTO | null>(null);

  useEffect(() => {
    void Promise.all([listNftCatalog(), listProjectMedia()])
      .then(([catalogResponse, mediaResponse]) => {
        setCatalog(catalogResponse);
        setProjectMedia(mediaResponse);
      })
      .catch(() => {});
  }, []);

  const mediaById = useMemo(() => {
    return new Map(projectMedia.map((item) => [item.id, item]));
  }, [projectMedia]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      <main className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-7xl font-black tracking-tighter uppercase leading-[0.8] italic">
              Painel de
              <br /> <span className="text-orange-500 not-italic">Impacto</span>
            </h1>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">
              On-Chain Sync • Protocolo 2026
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic border-b-4 border-slate-100 dark:border-slate-800 pb-4">
              Projetos Apoiados
            </h2>
            {donations.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center space-y-4">
                <span className="material-icons text-6xl text-slate-300 dark:text-slate-700">favorite_border</span>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-400">Nenhuma doacao ainda</h3>
                <Link
                  to="/contribuir"
                  className="inline-block bg-orange-500 text-white font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-[0.3em]"
                >
                  Fazer Doacao
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {donations.map((donation) => {
                  const media = mediaById.get(String(donation.projectId));
                  const donationDate = new Date(donation.timestamp).toLocaleDateString("pt-BR");
                  return (
                    <div
                      key={donation.id}
                      className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center gap-8"
                    >
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-xl">
                        <img
                          src={media?.img ?? "/images/projetos/mqc-ideathon.jpeg"}
                          className="w-full h-full object-cover"
                          alt={donation.projectName}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center gap-3">
                          <h3 className="text-xl font-black uppercase tracking-tight italic">{donation.projectName}</h3>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{donationDate}</span>
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                          R$ {Number(donation.amountBRL).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Impact NFTs</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Inventory</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {catalog.map((nft) => {
                  const owned = donations.some((donation) => Number(donation.nftId) === nft.id);
                  return (
                    <button
                      key={nft.id}
                      type="button"
                      onClick={() => {
                        if (owned) setSelectedNft(nft);
                      }}
                      className={`relative aspect-[2/3] rounded-xl overflow-hidden border-2 p-1 transition-all ${
                        owned
                          ? "border-orange-500 bg-slate-800"
                          : "border-slate-800 bg-slate-950 opacity-30 grayscale cursor-default"
                      }`}
                    >
                      <div className={`${nft.color} w-full h-full rounded-lg flex items-center justify-center text-white`}>
                        <span className="material-icons text-xl">{nft.icon}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {selectedNft ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedNft(null)}
        >
          <div
            className={`w-full max-w-xl rounded-[2rem] p-10 bg-gradient-to-br ${selectedNft.gradient} text-white shadow-2xl`}
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs font-black uppercase tracking-[0.3em] opacity-80">Impact NFT</p>
            <h3 className="text-4xl font-black uppercase mt-4">{selectedNft.name}</h3>
            <p className="mt-4 text-sm font-semibold opacity-95">{selectedNft.description}</p>
            <div className="mt-8 flex justify-between text-xs font-black uppercase tracking-[0.2em]">
              <span>Raridade: {selectedNft.rarity}</span>
              <span>Badge: {selectedNft.thanks}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
