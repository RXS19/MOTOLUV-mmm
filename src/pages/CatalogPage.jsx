import React, { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import MotoCard from '../components/MotoCard';
import { motoApi } from '../services/api';

const BRANDS = ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'Ducati', 'Harley-Davidson', 'BMW', 'KTM', 'Triumph', 'Aprilia'];
const CATEGORIES = ['Deportiva', 'Naked', 'Cruiser', 'Adventure', 'Scooter', 'Touring', 'Trail', 'Custom'];
const CITIES = ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro', 'Tijuana', 'León', 'Mérida', 'Toluca', 'CDMX'];

const CatalogPage = () => {
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('all');
  const [cat, setCat] = useState('all');
  const [city, setCity] = useState('all');
  const [maxPrice, setMaxPrice] = useState(500000);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    setLoading(true);
    motoApi.list({ limit: 200 })
      .then(setMotos)
      .catch(() => setMotos([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = motos.filter((m) => {
      const text = `${m.brand} ${m.model}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (brand !== 'all' && m.brand !== brand) return false;
      if (cat !== 'all' && m.category !== cat) return false;
      if (city !== 'all' && m.city !== city) return false;
      if (m.price > maxPrice) return false;
      return true;
    });
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'year') list = [...list].sort((a, b) => b.year - a.year);
    if (sort === 'featured') list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  }, [q, brand, cat, city, maxPrice, sort, motos]);

  const resetFilters = () => {
    setQ(''); setBrand('all'); setCat('all'); setCity('all'); setMaxPrice(500000); setSort('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14">
      <div className="mb-10">
        <h1 className="font-display font-bold text-white text-4xl md:text-5xl uppercase">
          Catálogo de <span className="text-red-brand">motos</span>
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">{filtered.length} motocicletas disponibles</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-8">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar marca o modelo..."
            className="w-full pl-10 pr-4 py-3.5 bg-[#111112] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-500"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-3.5 bg-[#111112] border border-white/10 text-white text-sm rounded-sm outline-none focus:border-red-brand"
        >
          <option value="featured">Destacadas</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="year">Año más reciente</option>
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 border border-white/10 hover:border-red-brand text-white text-xs font-bold tracking-widest uppercase rounded-sm transition-colors"
        >
          <SlidersHorizontal size={14} /> Filtros
        </button>
      </div>

      {showFilters && (
        <div className="bg-[#111112] border border-white/5 rounded-md p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-white uppercase tracking-wide">Filtros</h3>
            <button onClick={resetFilters} className="text-xs text-zinc-400 hover:text-red-brand flex items-center gap-1">
              <X size={12} /> Limpiar
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Marca</label>
              <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm rounded-sm outline-none focus:border-red-brand">
                <option value="all">Todas</option>
                {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Categoría</label>
              <select value={cat} onChange={(e) => setCat(e.target.value)} className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm rounded-sm outline-none focus:border-red-brand">
                <option value="all">Todas</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Ciudad</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm rounded-sm outline-none focus:border-red-brand">
                <option value="all">Todas</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Precio máx: ${maxPrice.toLocaleString()}</label>
              <input type="range" min="20000" max="500000" step="5000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-red-500" />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-24 text-zinc-500">Cargando motocicletas...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-zinc-500">No se encontraron resultados. Intenta con otros filtros.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((m) => <MotoCard key={m.id} moto={m} />)}
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
