import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Trash2, Edit, Wrench } from 'lucide-react';
import { motoApi } from '../services/api';
import { toast } from '../hooks/use-toast';

const MyMotosPage = () => {
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    motoApi.mine().then(setMotos).catch(() => setMotos([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const del = async (id) => {
    if (!window.confirm('¿Eliminar esta publicación?')) return;
    try {
      await motoApi.remove(id);
      toast({ title: 'Publicación eliminada' });
      load();
    } catch {
      toast({ title: 'Error al eliminar' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-white text-3xl md:text-4xl uppercase">
            Mis <span className="text-red-brand">Motocicletas</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">{motos.length} publicación(es)</p>
        </div>
        <Link to="/panel/publicar" className="btn-red inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-3 rounded-sm">
          <Plus size={14} /> Nueva Publicación
        </Link>
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
          {motos.map((m) => (
            <div key={m.id} className="bg-[#111112] border border-white/5 rounded-md overflow-hidden">
              <div className="aspect-[4/3] bg-zinc-900 relative">
                <img src={m.image} alt={m.model} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-white text-xs px-2 py-1 rounded-sm flex items-center gap-1">
                  <Eye size={11} /> {m.views}
                </div>
              </div>
              <div className="p-4">
                <div className="font-display font-bold text-white uppercase">{m.brand} {m.model}</div>
                <div className="text-xs text-zinc-400 mt-1">Año {m.year} · {m.km.toLocaleString()} km</div>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-red-brand font-bold">${m.price.toLocaleString()}</div>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500"><Wrench size={10} className="inline" /> {m.score.toFixed(1)}</span>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                  <Link to={`/motos/${m.id}`} className="flex-1 text-center text-xs font-bold tracking-widest uppercase py-2 rounded-sm border border-white/10 text-white hover:border-red-brand hover:text-red-brand transition-colors">
                    Ver
                  </Link>
                  <button onClick={() => del(m.id)} className="w-10 h-8 rounded-sm border border-white/10 text-zinc-400 hover:border-red-brand hover:text-red-brand transition-colors flex items-center justify-center">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMotosPage;
