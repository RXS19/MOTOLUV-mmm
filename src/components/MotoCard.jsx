import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, MapPin, Star, Wrench } from 'lucide-react';
import { getStatusStyle } from '../utils/status';
import { useAuth } from '../context/AuthContext';
import { handleImageError, resolveSafeImageUrl } from '../utils/imageFallback';

const MotoCard = ({ moto, showScore = true, showStatus = false }) => {
  const { user } = useAuth();
  const style = getStatusStyle(moto.status);

  // Status tags are ONLY visible to the owner of the listing or the linked buyer
  const isOwnerOrLinkedBuyer = Boolean(
    user && (
      user.id === moto.owner_id ||
      user.id === moto.ownerId ||
      user.id === moto.buyer_id ||
      moto.is_linked_buyer ||
      showStatus
    )
  );

  // Score is ONLY visible if user is logged in
  const canSeeScore = Boolean(user && showScore);

  return (
    <Link
      to={`/motos/${moto.id}`}
      className="moto-card group block bg-gradient-to-b from-[#151517] to-[#0d0d0e] hover:from-[#242428] hover:to-[#141416] border border-black rounded-md overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
        <img 
          src={resolveSafeImageUrl(moto.image)} 
          alt={`${moto.brand} ${moto.model}`} 
          onError={(e) => handleImageError(e, 'moto')}
          className="w-full h-full object-cover" 
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {moto.featured && (
            <div className="bg-red-brand text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm flex items-center gap-1 shadow">
              <Wrench size={10} /> DESTACADA
            </div>
          )}
          {isOwnerOrLinkedBuyer && (
            <div className={`bg-black/80 backdrop-blur px-2.5 py-1 rounded-sm border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow ${style.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`}></span>
              {style.label}
            </div>
          )}
        </div>

        {canSeeScore && (moto.score !== undefined && moto.score !== null) && (
          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur border border-white/10 text-white text-xs font-bold px-2.5 py-1 rounded-sm flex items-center gap-1.5 shadow">
            <Wrench size={11} className="text-red-brand" /> Score {Number(moto.score).toFixed(1)}/5
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

        {canSeeScore && moto.rating && (
          <div className="mt-3 pt-3 border-t border-black flex items-center justify-between text-xs">
            <span className="text-zinc-500 flex items-center gap-1"><Wrench size={11} /> Score Mecánico</span>
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className={i < moto.rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-700'} />
              ))}
            </span>
          </div>
        )}

        {/* Apartado Badge Callout */}
        <div className="mt-3 pt-2.5 flex items-center justify-between text-xs bg-red-brand/10 -mx-4 -mb-4 px-4 py-2.5 border-t border-black">
          <span className="text-zinc-300 font-medium text-[11px]">Separación del inventario por <strong className="text-white">24 hrs</strong></span>
          <span className="text-red-brand font-bold uppercase tracking-wider text-[10px] bg-red-brand/10 border border-red-brand/30 px-2 py-0.5 rounded-sm">
            APARTAR
          </span>
        </div>
      </div>
    </Link>
  );
};

export default MotoCard;
