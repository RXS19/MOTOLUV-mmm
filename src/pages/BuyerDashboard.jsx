import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, ShoppingBag, ArrowRight, PackageCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { offerApi } from '../services/api';
import { OfferRow } from './SellerDashboard';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);

  const refresh = () => offerApi.mine().then(setOffers).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const active = offers.filter((o) => o.status === 'pending').length;
  const accepted = offers.filter((o) => o.status === 'accepted').length;
  const total = offers.length;

  const stats = [
    { icon: Tag, label: 'Ofertas Activas', value: active, tint: 'yellow' },
    { icon: ShoppingBag, label: 'Ofertas Aceptadas', value: accepted, tint: 'green' },
    { icon: Tag, label: 'Total de Ofertas', value: total, tint: 'blue' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-white text-3xl md:text-4xl uppercase">
          Panel de <span className="text-red-brand">Comprador</span>
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">Bienvenido, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => <BuyerStatCard key={i} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#111112] border border-white/5 rounded-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-white uppercase tracking-wide">Mis Ofertas Recientes</h2>
            <Link to="/panel/mis-ofertas" className="text-xs text-zinc-400 hover:text-red-brand transition-colors inline-flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          {offers.length === 0 ? (
            <div className="py-14 text-center">
              <Tag size={48} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm mb-5">No has hecho ofertas aún</p>
              <Link to="/motos" className="btn-red inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-3 rounded-sm">
                Explorar Motos
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.slice(0, 5).map((o) => <OfferRow key={o.id} offer={o} onUpdate={refresh} />)}
            </div>
          )}
        </div>

        <div className="bg-[#111112] border border-white/5 rounded-md p-6">
          <h2 className="font-display font-bold text-white uppercase tracking-wide mb-5">Actividad Reciente</h2>
          {offers.length === 0 ? (
            <div className="py-14 text-center">
              <PackageCheck size={48} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">No hay actividad reciente</p>
            </div>
          ) : (
            <ul className="space-y-2 text-sm text-zinc-300">
              {offers.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center gap-2 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-brand" />
                  Enviaste una oferta de <span className="text-white font-medium">${o.amount.toLocaleString()}</span> por {o.moto_brand} {o.moto_model}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const BuyerStatCard = ({ icon: Icon, label, value, tint }) => {
  const tints = {
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
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

export default BuyerDashboard;
