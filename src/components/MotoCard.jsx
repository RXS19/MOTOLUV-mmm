import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, MapPin, Star, Wrench } from 'lucide-react';

const MotoCard = ({ moto, showScore = true }) => {
  return (
    <Link
      to={`/motos/${moto.id}`}
      className="moto-card group block bg-[#111112] border border-white/5 rounded-md overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
        <img src={moto.image} alt={`${moto.brand} ${moto.model}`} className="w-full h-full object-cover" />

        {moto.featured && (
          <div className="absolute top-3 left-3 bg-red-brand text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm flex items-center gap-1">
            <Wrench size={10} /> DESTACADA
          </div>
        )}

        {showScore && moto.score && (
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur text-white text-xs font-medium px-2 py-1 rounded-sm flex items-center gap-1">
            <Wrench size={11} className="text-red-brand" /> {moto.score.toFixed(1)}/5
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="font-display font-bold text-white uppercase tracking-wide">
            <span>{moto.brand}</span> <span className="text-white/90">{moto.model}</span>
          </div>
          <div className="font-display font-bold text-red-brand whitespace-nowrap">
            ${moto.price.toLocaleString()}
          </div>
        </div>

        <div className="mt-1 text-xs text-zinc-400">Año {moto.year}</div>

        <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            {moto.km !== undefined && (
              <span className="flex items-center gap-1">
                <Wrench size={11} /> {moto.km.toLocaleString()} km
              </span>
            )}
            {moto.city && (
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {moto.city}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1">
            <Eye size={11} /> {moto.views}
          </span>
        </div>

        {showScore && moto.rating && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-zinc-500 flex items-center gap-1"><Wrench size={11} /> Score Mecánico</span>
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className={i < moto.rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-700'} />
              ))}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default MotoCard;
