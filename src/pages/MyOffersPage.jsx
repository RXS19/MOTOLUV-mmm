import React, { useEffect, useState } from 'react';
import { offerApi } from '../services/api';
import { OfferRow } from './SellerDashboard';
import { useAuth } from '../context/AuthContext';

const MyOffersPage = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [received, setReceived] = useState([]);
  const [tab, setTab] = useState('sent');

  const load = () => {
    offerApi.mine().then(setOffers).catch(() => {});
    if (user?.role === 'vendedor' || user?.role === 'both') {
      offerApi.received().then(setReceived).catch(() => {});
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
        <p className="text-zinc-400 mt-1 text-sm">Historial de ofertas enviadas y recibidas</p>
      </div>

      {(user?.role === 'vendedor' || user?.role === 'both') && (
        <div className="grid grid-cols-2 gap-1 bg-[#0a0a0a] border border-white/5 rounded-sm p-1 mb-6 max-w-sm">
          {[
            { id: 'sent', label: `Enviadas (${offers.length})` },
            { id: 'received', label: `Recibidas (${received.length})` },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`py-2 text-xs font-bold tracking-widest uppercase rounded-sm transition-colors ${
                tab === t.id ? 'bg-red-brand text-white' : 'text-zinc-400 hover:text-red-brand'
              }`}>{t.label}</button>
          ))}
        </div>
      )}

      <div className="bg-[#111112] border border-white/5 rounded-md p-6">
        {list.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">No hay ofertas para mostrar</div>
        ) : (
          <div className="space-y-3">
            {list.map((o) => <OfferRow key={o.id} offer={o} isSeller={isSeller} onUpdate={load} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOffersPage;
