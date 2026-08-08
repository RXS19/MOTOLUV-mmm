import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Wrench, Palette, Gauge, Award, Eye, Star, Shield, ChevronRight, MessageCircle, User } from 'lucide-react';
import MotoCard from '../components/MotoCard';
import { motoApi, offerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const PKG_PRICES = { basico: 0, plus: 1800, total: 3500 };

const MotoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [moto, setMoto] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedPkg, setSelectedPkg] = useState('plus');
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMsg, setOfferMsg] = useState('');
  const [offerLoading, setOfferLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    motoApi.get(id).then((m) => {
      setMoto(m);
      setOfferAmount(String(m.price));
      motoApi.list({ category: m.category, limit: 6 }).then((list) => {
        setSimilar(list.filter((x) => x.id !== m.id).slice(0, 3));
      });
    }).catch(() => setMoto(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="max-w-3xl mx-auto px-5 py-32 text-center text-zinc-500">Cargando motocicleta...</div>;
  }

  if (!moto) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-32 text-center">
        <h1 className="font-display font-bold text-white text-3xl uppercase mb-6">Motocicleta no encontrada</h1>
        <Link to="/motos" className="btn-red inline-block text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-sm">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const handleOffer = async () => {
    if (!user) {
      toast({ title: 'Inicia sesión', description: 'Necesitas una cuenta para hacer una oferta.' });
      navigate('/iniciar-sesion');
      return;
    }
    if (user.id === moto.owner_id) {
      toast({ title: 'No puedes ofertar', description: 'Esta es tu propia motocicleta.' });
      return;
    }
    setOfferLoading(true);
    try {
      await offerApi.create({
        moto_id: moto.id,
        amount: Number(offerAmount) || moto.price,
        package: selectedPkg,
        message: offerMsg,
      });
      toast({
        title: '¡Oferta enviada!',
        description: `Un asesor Motoluv te contactará pronto para coordinar la compra de ${moto.brand} ${moto.model}.`,
      });
      setOfferMsg('');
    } catch (err) {
      toast({ title: 'Error al enviar oferta', description: err?.response?.data?.detail || 'Intenta nuevamente.' });
    } finally {
      setOfferLoading(false);
    }
  };

  const specs = {
    'Marca': moto.brand, 'Modelo': moto.model, 'Año': moto.year,
    'Kilometraje': `${moto.km.toLocaleString()} km`, 'Motor': moto.engine,
    'Color': moto.color, 'Categoría': moto.category, 'Ubicación': moto.city,
  };

  const images = moto.images && moto.images.length ? moto.images : [moto.image];

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-red-brand transition-colors">
          <ArrowLeft size={12} /> Volver
        </button>
        <ChevronRight size={12} />
        <Link to="/motos" className="hover:text-red-brand transition-colors">Catálogo</Link>
        <ChevronRight size={12} />
        <span className="text-zinc-300">{moto.brand} {moto.model}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative aspect-[16/10] rounded-md overflow-hidden bg-[#111112] border border-white/5">
            <img src={images[selectedImage]} alt={moto.model} className="w-full h-full object-cover" />
            {moto.featured && (
              <div className="absolute top-4 left-4 bg-red-brand text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm flex items-center gap-1">
                <Wrench size={11} /> DESTACADA
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur text-white text-sm font-medium px-3 py-1.5 rounded-sm flex items-center gap-1.5">
              <Wrench size={13} className="text-red-brand" /> Score {moto.score.toFixed(1)}/5
            </div>
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur text-white text-xs px-3 py-1.5 rounded-sm flex items-center gap-1.5">
              <Eye size={12} /> {moto.views} vistas
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-4">
            {images.map((img, i) => (
              <button key={i} onClick={() => setSelectedImage(i)}
                className={`aspect-[4/3] rounded-md overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-red-brand' : 'border-white/5 hover:border-red-brand/50'}`}>
                <img src={img} alt={`${moto.model} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <div className="mt-10">
            <h2 className="font-display font-bold text-white text-2xl uppercase tracking-wide mb-4">Descripción</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">{moto.description || 'Sin descripción disponible.'}</p>
          </div>

          <div className="mt-10">
            <h2 className="font-display font-bold text-white text-2xl uppercase tracking-wide mb-5">Ficha técnica</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-md overflow-hidden">
              {Object.entries(specs).map(([k, v]) => (
                <div key={k} className="bg-[#111112] p-4">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{k}</div>
                  <div className="text-white text-sm font-medium">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="font-display font-bold text-white text-2xl uppercase tracking-wide mb-5 flex items-center gap-3">
              Score mecánico <span className="text-red-brand text-lg">{moto.score.toFixed(1)}/5</span>
            </h2>
            <div className="bg-[#111112] border border-white/5 rounded-md p-6 space-y-4">
              {Object.entries(moto.score_details || {}).map(([k, v]) => (
                <div key={k}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-zinc-300">{k}</span>
                    <span className="text-white font-medium">{v}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-brand rounded-full transition-all" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-zinc-500 pt-3 border-t border-white/5">
                Evaluación realizada por mecánicos certificados Motoluv.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-[#111112] border border-white/5 rounded-md p-6">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">{moto.category}</div>
            <h1 className="font-display font-bold text-white text-3xl uppercase leading-tight">
              {moto.brand} <br /><span className="text-red-brand">{moto.model}</span>
            </h1>
            <div className="flex items-center gap-1 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < moto.rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-700'} />
              ))}
              <span className="text-xs text-zinc-400 ml-1">({moto.views} vistas)</span>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Precio</div>
              <div className="font-display font-bold text-red-brand text-4xl">${moto.price.toLocaleString()}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5 text-sm">
              <div className="flex items-center gap-2 text-zinc-300"><Calendar size={14} className="text-red-brand" /> {moto.year}</div>
              <div className="flex items-center gap-2 text-zinc-300"><Gauge size={14} className="text-red-brand" /> {moto.km.toLocaleString()} km</div>
              <div className="flex items-center gap-2 text-zinc-300"><Wrench size={14} className="text-red-brand" /> {moto.engine}</div>
              <div className="flex items-center gap-2 text-zinc-300"><Palette size={14} className="text-red-brand" /> {moto.color}</div>
              <div className="flex items-center gap-2 text-zinc-300 col-span-2"><MapPin size={14} className="text-red-brand" /> {moto.city}</div>
            </div>
          </div>

          <div className="bg-[#111112] border border-white/5 rounded-md p-6">
            <h3 className="font-display font-bold text-white uppercase tracking-wide text-sm mb-4 flex items-center gap-2">
              <Shield size={14} className="text-red-brand" /> Selecciona tu paquete
            </h3>
            <div className="space-y-2">
              {[
                { id: 'basico', name: 'Básico', price: 'Gratis' },
                { id: 'plus', name: 'Plus', price: '$1,800 MXN', rec: true },
                { id: 'total', name: 'Total', price: '$3,500 MXN' },
              ].map((p) => (
                <label key={p.id} className={`flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-colors ${selectedPkg === p.id ? 'border-red-brand bg-red-brand/5' : 'border-white/10 hover:border-red-brand/40'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={selectedPkg === p.id} onChange={() => setSelectedPkg(p.id)} className="accent-red-500" />
                    <div>
                      <div className="text-white text-sm font-medium">{p.name}</div>
                      {p.rec && <div className="text-[10px] text-red-brand tracking-widest uppercase">Recomendado</div>}
                    </div>
                  </div>
                  <div className="text-zinc-300 text-sm">{p.price}</div>
                </label>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1.5 block">Monto de la oferta (MXN)</label>
                <input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1.5 block">Mensaje (opcional)</label>
                <textarea value={offerMsg} onChange={(e) => setOfferMsg(e.target.value)} rows={2} placeholder="Cuéntanos por qué estás interesado..."
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600 resize-none" />
              </div>
            </div>

            <button onClick={handleOffer} disabled={offerLoading}
              className="btn-red mt-5 w-full inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-3.5 rounded-sm disabled:opacity-70">
              {offerLoading ? 'Enviando...' : 'Hacer oferta'}
            </button>
            <button className="btn-outline mt-2 w-full inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-3.5 rounded-sm">
              <MessageCircle size={13} /> Contactar asesor
            </button>
            <p className="mt-3 text-[11px] text-zinc-500 leading-relaxed">
              Un asesor Motoluv coordinará la operación. Sin contacto directo con el vendedor.
            </p>
          </div>

          <div className="bg-[#111112] border border-white/5 rounded-md p-6">
            <h3 className="font-display font-bold text-white uppercase tracking-wide text-sm mb-4">Vendedor</h3>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-brand/20 border border-red-brand/40 flex items-center justify-center">
                <User size={18} className="text-red-brand" />
              </div>
              <div>
                <div className="text-white text-sm font-medium">{moto.owner_name || 'Vendedor Motoluv'}</div>
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <Star size={11} className="fill-yellow-400 text-yellow-400" />
                  4.8 · Usuario verificado
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-zinc-400">
              <Award size={12} className="text-red-brand" /> Perfil verificado por Motoluv
            </div>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display font-bold text-white text-2xl md:text-3xl uppercase mb-6">
            Motos <span className="text-red-brand">similares</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {similar.map((m) => (<MotoCard key={m.id} moto={m} />))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MotoDetailPage;
