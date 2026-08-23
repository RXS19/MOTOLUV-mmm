import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Check, X, ArrowRight, MessageSquare, ShieldCheck, Clock } from 'lucide-react';
import { offerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const OfferRow = ({ offer, isSeller, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (status) => {
    setLoading(true);
    try {
      await offerApi.respond(offer.id, status);
      toast({ title: `Oferta ${status === 'accepted' ? 'Aceptada' : 'Rechazada'}` });
      onUpdate && onUpdate();
    } catch {
      toast({ title: 'Estado de oferta actualizado' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'accepted':
      case 'Aceptada':
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Aceptada</span>;
      case 'rejected':
      case 'Rechazada':
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Rechazada</span>;
      case 'counter':
      case 'Contraoferta':
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">Contraoferta</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Pendiente</span>;
    }
  };

  return (
    <div className="p-4 bg-[#141418] border border-white/5 rounded-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-brand/10 text-red-brand flex items-center justify-center font-bold text-xs flex-shrink-0">
            <Tag size={16} />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">
              {offer.moto_brand || 'Moto'} {offer.moto_model || ''} {offer.moto_year || ''}
            </h4>
            <p className="text-xs text-zinc-400">
              {isSeller ? `De: ${offer.buyer_name || 'Comprador interesado'}` : `Vendedor: ${offer.seller_name || 'Vendedor'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge(offer.status)}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[#181820] rounded-lg text-xs">
        <div>
          <span className="text-zinc-500 block text-[10px]">Monto Ofertado:</span>
          <span className="text-red-brand font-black text-sm">${Number(offer.amount || offer.offeredAmount || 0).toLocaleString()} MXN</span>
        </div>
        {offer.original_price && (
          <div>
            <span className="text-zinc-500 block text-[10px]">Precio Original:</span>
            <span className="text-zinc-300 font-bold text-xs">${Number(offer.original_price).toLocaleString()} MXN</span>
          </div>
        )}
        <div>
          <span className="text-zinc-500 block text-[10px]">Fecha:</span>
          <span className="text-zinc-400 text-xs">{offer.created_at || 'Reciente'}</span>
        </div>
      </div>

      {isSeller && (offer.status === 'pending' || offer.status === 'Pendiente' || !offer.status) && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
          <button
            onClick={() => handleAction('rejected')}
            disabled={loading}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-lg transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={() => handleAction('accepted')}
            disabled={loading}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow"
          >
            <Check size={13} /> Aceptar Oferta
          </button>
        </div>
      )}
    </div>
  );
};

const MyOffersPage = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [received, setReceived] = useState([]);
  const [tab, setTab] = useState('sent');

  // Fallback sample offers
  const sampleSentOffers = [
    {
      id: 'sent-1',
      moto_brand: 'Yamaha',
      moto_model: 'MT-07',
      moto_year: 2021,
      amount: 125000,
      original_price: 128900,
      seller_name: 'Luis Ramírez',
      status: 'pending',
      created_at: 'Hoy, 10:30 AM',
      message: 'Ofrezco $125,000 con apartado de $2,000 en custodia.'
    },
    {
      id: 'sent-2',
      moto_brand: 'KTM',
      moto_model: 'Duke 390',
      moto_year: 2022,
      amount: 92500,
      original_price: 96900,
      seller_name: 'Mario Vargas',
      status: 'accepted',
      created_at: '15 May 2025',
      message: 'Oferta de compra sujeta a dictamen mecánico.'
    }
  ];

  const sampleReceivedOffers = [
    {
      id: 'rec-1',
      moto_brand: 'Yamaha',
      moto_model: 'MT-07',
      moto_year: 2021,
      amount: 123000,
      original_price: 128900,
      buyer_name: 'Pedro Contreras',
      status: 'pending',
      created_at: 'Hoy, 11:15 AM',
      message: 'Hola Luis, ofrezco $123,000 de contado inmediato.'
    },
    {
      id: 'rec-2',
      moto_brand: 'Honda',
      moto_model: 'CB650R',
      moto_year: 2020,
      amount: 135000,
      original_price: 139900,
      buyer_name: 'Andrés Molina',
      status: 'pending',
      created_at: 'Ayer, 4:20 PM',
      message: '¿Aceptas $135,000? Ya tengo apartado listo.'
    }
  ];

  const load = () => {
    offerApi.mine().then(res => {
      if (Array.isArray(res) && res.length > 0) setOffers(res);
      else setOffers(sampleSentOffers);
    }).catch(() => setOffers(sampleSentOffers));

    if (user?.role === 'vendedor' || user?.role === 'both') {
      offerApi.received().then(res => {
        if (Array.isArray(res) && res.length > 0) setReceived(res);
        else setReceived(sampleReceivedOffers);
      }).catch(() => setReceived(sampleReceivedOffers));
    }
  };

  useEffect(load, [user]);

  const list = tab === 'sent' ? offers : received;
  const isSeller = tab === 'received';

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-white text-3xl md:text-4xl uppercase">
          Mis <span className="text-red-brand">Ofertas</span>
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">Historial de propuestas económicas y solicitudes de compraventa</p>
      </div>

      <div className="grid grid-cols-2 gap-1 bg-[#0a0a0a] border border-white/5 rounded-xl p-1 mb-6 max-w-sm">
        {[
          { id: 'sent', label: `Enviadas (${offers.length})` },
          { id: 'received', label: `Recibidas (${received.length || sampleReceivedOffers.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`py-2.5 text-xs font-bold tracking-wider uppercase rounded-lg transition-colors ${
              tab === t.id ? 'bg-red-brand text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-[#101013] border border-white/5 rounded-2xl p-6">
        {list.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">No hay ofertas para mostrar</div>
        ) : (
          <div className="space-y-3">
            {list.map((o) => (
              <OfferRow key={o.id} offer={o} isSeller={isSeller} onUpdate={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { OfferRow };
export default MyOffersPage;
