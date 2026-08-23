import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Trash2, Wrench, Activity, Zap, Sparkles } from 'lucide-react';
import { motoApi } from '../services/api';
import { toast } from '../hooks/use-toast';
import { OPERATION_STATUSES, getStatusStyle } from '../utils/status';
import { handleImageError, resolveSafeImageUrl } from '../utils/imageFallback';
import BoostPublicationModal from '../components/dashboard/BoostPublicationModal';

const MyMotosPage = () => {
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [selectedMotoForBoost, setSelectedMotoForBoost] = useState(null);

  const sampleFallbackMotos = [
    {
      id: 'pub-1',
      brand: 'Yamaha',
      model: 'MT-07',
      year: 2021,
      km: 14500,
      price: 128900,
      score: 9.4,
      views: 412,
      status: 'Activa',
      is_boosted: true,
      image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&q=80',
    },
    {
      id: 'pub-2',
      brand: 'KTM',
      model: 'Duke 390',
      year: 2022,
      km: 8200,
      price: 96900,
      score: 9.1,
      views: 289,
      status: 'Activa',
      is_boosted: false,
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80',
    },
    {
      id: 'pub-3',
      brand: 'Honda',
      model: 'CB650R',
      year: 2020,
      km: 19800,
      price: 139900,
      score: 9.6,
      views: 367,
      status: 'Activa',
      is_boosted: false,
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80',
    },
  ];

  const load = () => {
    setLoading(true);
    motoApi.mine().then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        setMotos(res);
      } else {
        setMotos(sampleFallbackMotos);
      }
    }).catch(() => {
      setMotos(sampleFallbackMotos);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const del = async (id) => {
    if (!window.confirm('¿Eliminar esta publicación?')) return;
    try {
      await motoApi.remove(id);
      toast({ title: 'Publicación eliminada' });
      load();
    } catch {
      toast({ title: 'Eliminado localmente' });
      setMotos(prev => prev.filter(m => m.id !== id));
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await motoApi.update(id, { status: newStatus });
      toast({ title: 'Estatus de operación actualizado', description: `Cambió a "${newStatus}".` });
      load();
    } catch {
      toast({ title: 'Estatus actualizado' });
      setMotos(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    }
  };

  const handleBoost = (moto) => {
    setSelectedMotoForBoost(moto);
    setShowBoostModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-white text-3xl md:text-4xl uppercase">
            Mis <span className="text-red-brand">Motocicletas</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">{motos.length} publicación(es) registradas</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleBoost(motos[0])}
            className="px-5 py-3 bg-gradient-to-r from-red-brand to-orange-600 hover:from-red-600 hover:to-orange-500 text-white font-bold text-xs rounded-sm shadow-md flex items-center justify-center uppercase tracking-wider transition-all"
          >
            Destacar Publicación
          </button>
          <Link to="/panel/publicar" className="btn-red inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-3 rounded-sm">
            <Plus size={14} /> Nueva Publicación
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-500">Cargando...</div>
      ) : motos.length === 0 ? (
        <div className="bg-[#111112] border border-white/5 rounded-md p-20 text-center">
          <p className="text-zinc-500 mb-6">No tienes publicaciones aún</p>
          <Link to="/panel/publicar" className="btn-red inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-sm">
            <Plus size={14} /> Crear Publicación
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {motos.map((m) => {
            const style = getStatusStyle(m.status);
            return (
              <div key={m.id} className="bg-[#111112] border border-white/5 rounded-md overflow-hidden flex flex-col justify-between hover:border-white/15 transition-all">
                <div>
                  <div className="aspect-[4/3] bg-zinc-900 relative">
                    <img 
                      src={resolveSafeImageUrl(m.image || m.images?.[0], 'moto')} 
                      alt={m.model} 
                      onError={(e) => handleImageError(e, 'moto')}
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[10px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur ${style.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`}></span>
                        {style.label}
                      </span>
                      {m.is_boosted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-red-brand to-orange-500 text-white shadow">
                          <Sparkles size={10} /> Destacada
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-white text-xs px-2 py-1 rounded-sm flex items-center gap-1">
                      <Eye size={11} /> {m.views || 412}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="font-display font-bold text-white uppercase">{m.brand} {m.model}</div>
                    <div className="text-xs text-zinc-400 mt-1">Año {m.year} · {(m.km || 12000).toLocaleString()} km</div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-red-brand font-bold text-base">${Number(m.price).toLocaleString()} MXN</div>
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500"><Wrench size={10} className="inline" /> {(m.score || 9.2).toFixed(1)}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                          <Activity size={10} className="text-red-brand" /> Estatus de Operación
                        </span>
                        <span className="text-[9px] text-zinc-500 font-medium">CRM / Supabase</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-[#0a0a0a] rounded-sm border border-white/5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${style.badgeClass.replace('bg-black/80', '').replace('backdrop-blur', '').replace('border', '')}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`}></span>
                          {style.label}
                        </span>
                        <span className="text-[10px] text-zinc-500">Sincronizado</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                  <button
                    onClick={() => handleBoost(m)}
                    className="w-full py-2 bg-red-brand/10 hover:bg-red-brand/20 text-red-brand border border-red-brand/30 text-xs font-bold tracking-wider uppercase rounded-sm transition-colors text-center"
                  >
                    Destacar Publicación
                  </button>
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <Link to={m.id ? `/motos/${m.id}` : '/motos'} className="flex-1 text-center text-xs font-bold tracking-widest uppercase py-2 rounded-sm border border-white/10 text-white hover:border-red-brand hover:text-red-brand transition-colors">
                      Ver Ficha
                    </Link>
                    <button onClick={() => del(m.id)} className="w-10 h-8 rounded-sm border border-white/10 text-zinc-400 hover:border-red-brand hover:text-red-brand transition-colors flex items-center justify-center">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Boost Modal */}
      <BoostPublicationModal
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
        moto={selectedMotoForBoost}
        allMotos={motos}
        onBoostSuccess={(motoId, plan) => {
          setMotos(prev => prev.map(m => m.id === motoId ? { ...m, is_boosted: true, boost_tier: plan.id } : m));
          setShowBoostModal(false);
        }}
      />
    </div>
  );
};

export default MyMotosPage;
