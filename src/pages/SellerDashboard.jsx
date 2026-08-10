import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bike, Tag, Eye, Plus, ArrowRight, PackageCheck, Calculator, DollarSign, Activity, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motoApi, offerApi } from '../services/api';
import { calculateCommission } from '../utils/commission';
import { OPERATION_STATUSES, getStatusStyle } from '../utils/status';
import { toast } from '../hooks/use-toast';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [motos, setMotos] = useState([]);
  const [offers, setOffers] = useState([]);
  const [calcPrice, setCalcPrice] = useState(95000);

  const loadData = () => {
    motoApi.mine().then(setMotos).catch(() => {});
    offerApi.received().then(setOffers).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalViews = motos.reduce((sum, m) => sum + (m.views || 0), 0);
  const pendingOffers = offers.filter((o) => o.status === 'pending').length;
  const publishedMotos = motos.filter((m) => m.status === 'Publicada' || m.status === 'active').length;

  // Calculate total portfolio values
  const totalPublishedValue = motos.reduce((sum, m) => sum + (Number(m.price) || 0), 0);
  const totalEstimatedNet = motos.reduce((sum, m) => {
    const c = calculateCommission(m.price);
    return sum + c.netEarnings;
  }, 0);

  const stats = [
    { icon: Bike, label: 'Publicaciones Activas', value: publishedMotos, tint: 'blue' },
    { icon: DollarSign, label: 'Ganancia Neta Est.', value: `$${totalEstimatedNet.toLocaleString()} MXN`, tint: 'green' },
    { icon: Tag, label: 'Ofertas Pendientes', value: pendingOffers, tint: 'red' },
    { icon: Eye, label: 'Vistas Totales', value: totalViews, tint: 'purple' },
  ];

  const currentCalc = calculateCommission(calcPrice || 0);

  const handleStatusChange = async (motoId, newStatus) => {
    try {
      await motoApi.update(motoId, { status: newStatus });
      toast({ title: 'Estatus actualizado', description: `La operación ahora está en estatus "${newStatus}".` });
      loadData();
    } catch {
      toast({ title: 'Error', description: 'No se pudo cambiar el estatus de la operación.' });
    }
  };

  return (
    <div className="relative min-h-screen py-10">
      {/* Background overlay for Sellers with dark motorcycle aesthetic */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 bg-cover bg-center bg-no-repeat transition-all duration-500"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1920&q=80')` }}
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#0a0a0c]/60 via-[#0a0a0c]/75 to-[#0a0a0c]" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Control y Estatus de Operaciones */}
      <div className="bg-[#111112] border border-white/5 rounded-md p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h2 className="font-display font-bold text-white text-xl uppercase tracking-wide flex items-center gap-2">
              <Activity size={18} className="text-red-brand" /> Estatus de Operaciones y Publicaciones
            </h2>
            <p className="text-zinc-400 text-xs mt-1">Gestiona la fase actual de tus motocicletas publicadas en la plataforma</p>
          </div>
          <div className="text-right bg-[#0a0a0a] px-4 py-2 border border-white/10 rounded-sm text-xs">
            <span className="text-zinc-500 block text-[10px] uppercase">Valor Total Publicado</span>
            <span className="text-emerald-400 font-bold">${totalPublishedValue.toLocaleString()} MXN</span>
          </div>
        </div>

        {motos.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-sm">
            Publica tu primera moto para monitorear sus estatus de operación en tiempo real.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#0a0a0a] uppercase text-[10px] tracking-wider text-zinc-500">
                <tr>
                  <th className="py-3 px-4">Moto / Publicación</th>
                  <th className="py-3 px-4">Precio Publicado</th>
                  <th className="py-3 px-4">Estatus Actual de Operación</th>
                  <th className="py-3 px-4">Pago Neto Est.</th>
                  <th className="py-3 px-4 text-right">Cambiar Estatus</th>
                </tr>
              </thead>
              <tbody>
                {motos.map((m) => {
                  const comm = calculateCommission(m.price);
                  const style = getStatusStyle(m.status);
                  return (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white flex items-center gap-3">
                        <img src={m.image} alt={m.model} className="w-10 h-10 object-cover rounded-sm" />
                        <div>
                          <div className="font-bold">{m.brand} {m.model}</div>
                          <div className="text-zinc-500 text-[11px]">{m.year} · {m.city}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">${Number(m.price).toLocaleString()} MXN</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[11px] font-bold uppercase tracking-wider ${style.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`}></span>
                          {style.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-bold">${comm.netEarnings.toLocaleString()} MXN</td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={style.label}
                          onChange={(e) => handleStatusChange(m.id, e.target.value)}
                          className="bg-[#0a0a0a] text-zinc-200 border border-white/10 hover:border-red-brand/50 text-xs py-1.5 px-2.5 rounded-sm outline-none cursor-pointer focus:border-red-brand"
                        >
                          {OPERATION_STATUSES.map((st) => (
                            <option key={st} value={st} className="bg-[#111112] text-white py-1">
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simulación Interna de Pago */}
      <div className="bg-[#111112] border border-white/5 rounded-md p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-display font-bold text-lg uppercase">
          <Calculator className="text-red-brand" size={20} />
          Calculadora de Ganancia Neta Estimada
        </div>
        <p className="text-zinc-400 text-xs">Simula tu pago neto final al concretar una venta.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-1">Precio estimado (MXN)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
              <input
                type="number"
                value={calcPrice}
                onChange={(e) => setCalcPrice(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white font-bold text-sm rounded-sm outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-2 p-4 bg-[#0a0a0a] border border-white/5 rounded-sm flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-zinc-500 text-[10px] uppercase block">Precio Simulado</span>
              <span className="text-white font-bold text-sm">${(calcPrice || 0).toLocaleString()} MXN</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] uppercase block">Retención por Comisión</span>
              <span className="text-red-brand font-bold text-sm">-${currentCalc.commissionAmount.toLocaleString()} MXN</span>
            </div>
            <div className="bg-emerald-500/10 px-3 py-1.5 rounded-sm border border-emerald-500/30">
              <span className="text-emerald-400 text-[10px] font-bold uppercase block">Depósito Neto Est.</span>
              <span className="text-emerald-300 font-extrabold text-base">${currentCalc.netEarnings.toLocaleString()} MXN</span>
            </div>
          </div>
        </div>
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
              {motos.slice(0, 4).map((m) => {
                const style = getStatusStyle(m.status);
                return (
                  <Link to={`/motos/${m.id}`} key={m.id} className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-white/5 rounded-sm hover:border-red-brand/40 transition-colors">
                    <img src={m.image} alt={m.model} className="w-14 h-14 object-cover rounded-sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{m.brand} {m.model}</div>
                      <div className="text-zinc-500 text-xs mt-0.5 flex items-center gap-2">
                        <span>{m.year} · {m.city}</span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded border ${style.badgeClass}`}>
                          {style.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-red-brand text-sm font-bold whitespace-nowrap">${m.price.toLocaleString()}</div>
                  </Link>
                );
              })}
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
                <OfferRow key={o.id} offer={o} isSeller onUpdate={loadData} />
              ))}
            </div>
          )}
        </div>
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
        <div className="font-display font-bold text-white text-xl md:text-2xl">{value}</div>
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
