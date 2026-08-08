import React, { useState } from 'react';
import { ShoppingBag, Star, Search } from 'lucide-react';
import { accessories } from '../mock';
import { toast } from '../hooks/use-toast';

const ShopPage = () => {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const cats = ['all', ...Array.from(new Set(accessories.map((a) => a.category)))];

  const filtered = accessories.filter((a) =>
    (cat === 'all' || a.category === cat) &&
    a.name.toLowerCase().includes(q.toLowerCase())
  );

  const add = (a) => {
    toast({ title: 'Agregado al carrito', description: `${a.name} agregado a tu carrito.` });
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
      <div className="mb-10">
        <span className="inline-flex items-center gap-2 text-red-brand text-[11px] tracking-widest uppercase border border-red-brand/60 rounded-full px-3 py-1.5 mb-4">
          <ShoppingBag size={12} /> Tienda
        </span>
        <h1 className="font-display font-bold text-white text-4xl md:text-5xl uppercase">
          Accesorios y <span className="text-red-brand">equipamiento</span>
        </h1>
        <p className="text-zinc-400 mt-3 text-sm">Cascos, ropa, escapes y todo lo que necesitas para rodar.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-3 bg-[#111112] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-4 py-2 text-xs font-bold tracking-widest uppercase rounded-sm transition-colors border ${
              cat === c
                ? 'bg-red-brand border-red-brand text-white'
                : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white'
            }`}
          >
            {c === 'all' ? 'Todos' : c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map((a) => (
          <div key={a.id} className="moto-card bg-[#111112] border border-white/5 rounded-md overflow-hidden">
            <div className="aspect-square bg-zinc-900 relative overflow-hidden">
              <img src={a.image} alt={a.name} className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-white text-[10px] tracking-widest uppercase px-2 py-1 rounded-sm">
                {a.category}
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{a.brand}</div>
              <div className="text-white text-sm font-medium leading-tight mb-2">{a.name}</div>
              <div className="flex items-center gap-1 text-xs text-zinc-400 mb-3">
                <Star size={11} className="fill-yellow-400 text-yellow-400" /> {a.rating.toFixed(1)}
              </div>
              <div className="flex items-center justify-between">
                <div className="font-display font-bold text-red-brand text-lg">${a.price.toLocaleString()}</div>
                <button
                  onClick={() => add(a)}
                  className="px-3 py-2 bg-red-brand hover:bg-red-500 text-white text-[10px] font-bold tracking-widest uppercase rounded-sm transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;
