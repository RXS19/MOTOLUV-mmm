import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bike, Tag, Star, Eye, Plus, ArrowRight, PackageCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motoApi, offerApi } from '../services/api';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [motos, setMotos] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    motoApi.mine().then(setMotos).catch(() => {});
    offerApi.received().then(setOffers).catch(() => {});
  }, []);

  const totalViews = motos.reduce((sum, m) => sum + (m.views || 0), 0);
  const pending = offers.filter((o) => o.status === 'pending').length;
  const activeMotos = motos.filter((m) => m.status === 'active').length;
  const avgRating = motos.length ? (motos.reduce((s, m) => s + (m.score || 0), 0) / motos.length).toFixed(1) : '0.0';

  const stats = [
    { icon: Bike, label: 'Publicaciones Activas', value: activeMotos, tint: 'blue' },
    { icon: Tag, label: 'Ofertas Pendientes', value: pending, tint: 'red' },
    { icon: Star, label: 'Calificación', value: avgRating, tint: 'green' },
    { icon: Eye, label: 'Vistas Totales', value: totalViews, tint: 'purple' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-white text-3xl md:text-4xl uppercase">
            Panel de <span className="text-red-brand">Vendedor</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">Bienvenido, {user?.name}</p>
        </div>
        <Link to="/panel/publicar" className="btn-red inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-3 rounded-sm">
          <Plus size={14} /> Nueva Publicación
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#111112] border border-white/5 rounded-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-white uppercase tracking-wide">Publicaciones Recientes</h2>
            <Link to="/panel/mis-motos" className="text-xs text-zinc-400 hover:text-red-brand transition-colors inline-flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          {motos.length === 0 ? (
            <div className="py-14 text-center">
              <Bike size={48} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm mb-5">No tienes publicaciones aún</p>
              <Link to="/panel/publicar" className="btn-red inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-3 rounded-sm">
                Crear Primera Publicación
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {motos.slice(0, 4).map((m) => (
                <Link to={`/motos/${m.id}`} key={m.id} className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-white/5 rounded-sm hover:border-red-brand/40 transition-colors">
                  <img src={m.image} alt={m.model} className="w-14 h-14 object-cover rounded-sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{m.brand} {m.model}</div>
                    <div className="text-zinc-500 text-xs">{m.year} · {m.city}</div>
                  </div>
                  <div className="text-red-brand text-sm font-bold whitespace-nowrap">${m.price.toLocaleString()}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#111112] border border-white/5 rounded-md p-6">
          <h2 className="font-display font-bold text-white uppercase tracking-wide mb-5">Ofertas Recibidas</h2>
          {offers.length === 0 ? (
            <div className="py-14 text-center">
              <PackageCheck size={48} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">No hay ofertas recibidas aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.slice(0, 5).map((o) => (
                <OfferRow key={o.id} offer={o} isSeller onUpdate={() => offerApi.received().then(setOffers)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, tint }) => {
  const tints = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };
  return (
    <div className="bg-[#111112] border border-white/5 rounded-md p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-md border flex items-center justify-center ${tints[tint]}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="font-display font-bold text-white text-2xl">{value}</div>
        <div className="text-zinc-500 text-xs">{label}</div>
      </div>
    </div>
  );
};

export const OfferRow = ({ offer, isSeller, onUpdate }) => {
  const badge = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  }[offer.status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';

  const label = {
    pending: 'Pendiente', accepted: 'Aceptada',
    rejected: 'Rechazada', completed: 'Completada',
  }[offer.status] || offer.status;

  const act = async (status) => {
    try {
      await offerApi.updateStatus(offer.id, status);
      onUpdate && onUpdate();
    } catch {}
  };

  return (
    <div className="p-3 bg-[#0a0a0a] border border-white/5 rounded-sm hover:border-red-brand/40 transition-colors">
      <div className="flex items-center gap-3">
        {offer.moto_image && <img src={offer.moto_image} alt={offer.moto_model} className="w-12 h-12 object-cover rounded-sm" />}
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-medium truncate">{offer.moto_brand} {offer.moto_model}</div>
          <div className="text-zinc-500 text-xs">{isSeller ? `Comprador: ${offer.buyer_name}` : `Paquete: ${offer.package}`}</div>
        </div>
        <div className="text-right">
          <div className="text-red-brand font-bold text-sm">${offer.amount.toLocaleString()}</div>
          <span className={`inline-block text-[9px] tracking-widest uppercase border px-1.5 py-0.5 rounded-sm mt-0.5 ${badge}`}>{label}</span>
        </div>
      </div>
      {isSeller && offer.status === 'pending' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
          <button onClick={() => act('accepted')} className="flex-1 text-xs font-bold tracking-widest uppercase py-1.5 rounded-sm border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 transition-colors">
            Aceptar
          </button>
          <button onClick={() => act('rejected')} className="flex-1 text-xs font-bold tracking-widest uppercase py-1.5 rounded-sm border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors">
            Rechazar
          </button>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
