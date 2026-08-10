import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Wrench, Palette, Gauge, Award, Eye, Star, Shield, ChevronRight, ChevronLeft, MessageCircle, User, Activity, Lock, CheckCircle2, BookmarkCheck, CreditCard, X, AlertCircle } from 'lucide-react';
import MotoCard from '../components/MotoCard';
import { motoApi, offerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';
import { getStatusStyle } from '../utils/status';

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

  // Apartado state
  const [hasApartado, setHasApartado] = useState(false);
  const [showApartadoModal, setShowApartadoModal] = useState(false);
  const [apartadoPaymentMethod, setApartadoPaymentMethod] = useState('card');
  const [apartadoLoading, setApartadoLoading] = useState(false);

  const images = moto ? (moto.images && moto.images.length > 0 ? moto.images : [moto.image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1600&q=80']) : [];

  // Keyboard navigation for image slider
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

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

  useEffect(() => {
    if (user && moto) {
      offerApi.mine().then((myOffers) => {
        const existing = myOffers.find(
          (o) => String(o.moto_id) === String(moto.id) && (o.is_apartado || o.amount === 600 || o.status === 'accepted')
        );
        if (existing) {
          setHasApartado(true);
          if (existing.package) setSelectedPkg(existing.package);
        }
      }).catch(() => {});
    }
  }, [user, moto]);

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

  const handlePerformApartado = async () => {
    if (!user) {
      toast({
        title: 'Registro requerido',
        description: 'Para realizar un apartado de $600 MXN debes estar registrado e iniciar sesión.',
      });
      navigate('/iniciar-sesion');
      return;
    }
    setApartadoLoading(true);
    try {
      await offerApi.create({
        moto_id: moto.id,
        amount: 600,
        is_apartado: true,
        message: 'Apartado inicial de $600 MXN',
      });
      toast({
        title: '¡Apartado exitoso!',
        description: `Has reservado ${moto.brand} ${moto.model} con $600 MXN. Ahora puedes seleccionar tu paquete de protección.`,
      });
      setHasApartado(true);
      setShowApartadoModal(false);
      setMoto((prev) => prev ? { ...prev, status: 'Apartada' } : prev);
    } catch (err) {
      toast({
        title: 'Error al procesar el apartado',
        description: err?.response?.data?.detail || 'Intenta nuevamente.',
      });
    } finally {
      setApartadoLoading(false);
    }
  };

  const handleOffer = async () => {
    if (!user) {
      toast({ title: 'Inicia sesión', description: 'Necesitas una cuenta para completar tu solicitud.' });
      navigate('/iniciar-sesion');
      return;
    }
    if (!hasApartado) {
      toast({ title: 'Apartado requerido', description: 'Primero debes realizar tu apartado de $600 MXN.' });
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
        title: '¡Paquete y oferta confirmados!',
        description: `Un asesor Motoluv se pondrá en contacto contigo para coordinar la entrega y la inspección final.`,
      });
      setOfferMsg('');
    } catch (err) {
      toast({ title: 'Error al enviar solicitud', description: err?.response?.data?.detail || 'Intenta nuevamente.' });
    } finally {
      setOfferLoading(false);
    }
  };

  const specs = {
    'Marca': moto.brand, 'Modelo': moto.model, 'Año': moto.year,
    'Kilometraje': `${moto.km.toLocaleString()} km`, 'Motor': moto.engine,
    'Color': moto.color, 'Categoría': moto.category, 'Ubicación': moto.city,
  };

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
          <div className="relative aspect-[16/10] rounded-md overflow-hidden bg-[#111112] border border-white/5 group">
            <img src={images[selectedImage]} alt={moto.model} className="w-full h-full object-cover transition-all duration-300" />
            
            {/* Click Navigation Controls on Image */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-red-brand text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow-lg border border-white/10"
                  aria-label="Anterior imagen"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-red-brand text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow-lg border border-white/10"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {moto.featured && (
              <div className="absolute top-4 left-4 bg-red-brand text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm flex items-center gap-1">
                <Wrench size={11} /> DESTACADA
              </div>
            )}
            {user && moto.score && (
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur text-white text-sm font-medium px-3 py-1.5 rounded-sm flex items-center gap-1.5">
                <Wrench size={13} className="text-red-brand" /> Score {moto.score.toFixed(1)}/5
              </div>
            )}
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

          {user && moto.score && (
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
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-[#111112] border border-white/5 rounded-md p-6">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs text-zinc-500 uppercase tracking-widest">{moto.category}</span>
              {Boolean(user && (user.id === moto.owner_id || user.id === moto.ownerId || user.id === moto.buyer_id || hasApartado)) && (() => {
                const style = getStatusStyle(moto.status);
                return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[10px] font-bold uppercase tracking-wider ${style.badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`}></span>
                    {style.label}
                  </span>
                );
              })()}
            </div>
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
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Precio Publicado</div>
              <div className="font-display font-bold text-red-brand text-4xl">${moto.price.toLocaleString()} MXN</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5 text-sm">
              <div className="flex items-center gap-2 text-zinc-300"><Calendar size={14} className="text-red-brand" /> {moto.year}</div>
              <div className="flex items-center gap-2 text-zinc-300"><Gauge size={14} className="text-red-brand" /> {moto.km.toLocaleString()} km</div>
              <div className="flex items-center gap-2 text-zinc-300"><Wrench size={14} className="text-red-brand" /> {moto.engine}</div>
              <div className="flex items-center gap-2 text-zinc-300"><Palette size={14} className="text-red-brand" /> {moto.color}</div>
              <div className="flex items-center gap-2 text-zinc-300 col-span-2"><MapPin size={14} className="text-red-brand" /> {moto.city}</div>
            </div>
          </div>

          {/* BLOQUE DE APARTADO */}
          <div className="bg-[#111112] border border-white/5 rounded-md p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-white uppercase tracking-wide text-base flex items-center gap-2">
                <BookmarkCheck size={18} className="text-red-brand" /> APARTAR
              </h3>
            </div>

            {hasApartado ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-sm text-xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider">
                  <CheckCircle2 size={16} /> Motocicleta Apartada
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  La motocicleta ha sido separada del inventario por 24 hrs. Ahora puedes seleccionar tu paquete de protección.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Al hacer el apartado la motocicleta será separada del inventario por 24 hrs.
                </p>

                {user ? (
                  <button
                    onClick={() => setShowApartadoModal(true)}
                    className="btn-red w-full inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-3.5 rounded-sm shadow-lg"
                  >
                    <BookmarkCheck size={14} /> APARTAR
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        toast({ title: 'Registro requerido', description: 'Crea tu cuenta para hacer el apartado y separar la unidad por 24 hrs.' });
                        navigate('/iniciar-sesion');
                      }}
                      className="btn-red w-full inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-3.5 rounded-sm"
                    >
                      <User size={14} /> APARTAR
                    </button>
                    <p className="text-[10px] text-amber-400/90 flex items-center gap-1.5 pt-1">
                      <AlertCircle size={12} className="flex-shrink-0" />
                      Debes estar registrado para hacer el apartado y separar la unidad por 24 hrs.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PASO 2: DESPLEGAR PAQUETES DE PROTECCIÓN (ÚNICAMENTE SI YA APARTÓ) */}
          {hasApartado && (
            <div className="bg-[#111112] border border-white/5 rounded-md p-6 relative">
              <h3 className="font-display font-bold text-white uppercase tracking-wide text-sm mb-4 flex items-center gap-2">
                <Shield size={16} className="text-red-brand" /> Paquetes de Protección
              </h3>

              <div className="space-y-4">
                <div className="text-xs text-zinc-400 leading-relaxed">
                  Elige el nivel de cobertura e inspección mecánica antes de finalizar la compra:
                </div>
                <div className="space-y-2">
                  {[
                    { id: 'basico', name: 'Básico', price: 'Gratis', desc: 'Revisión documental' },
                    { id: 'plus', name: 'Plus', price: '$1,800 MXN', rec: true, desc: 'Score mecánico + Garantía 30 días' },
                    { id: 'total', name: 'Total', price: '$3,500 MXN', desc: 'Garantía 90 días + Asistencia vial' },
                  ].map((p) => (
                    <label key={p.id} className={`flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-colors ${selectedPkg === p.id ? 'border-red-brand bg-red-brand/5' : 'border-white/10 hover:border-red-brand/40'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" checked={selectedPkg === p.id} onChange={() => setSelectedPkg(p.id)} className="accent-red-500" />
                        <div>
                          <div className="text-white text-sm font-medium">{p.name}</div>
                          <div className="text-[10px] text-zinc-500">{p.desc}</div>
                          {p.rec && <div className="text-[9px] text-red-brand tracking-widest uppercase font-bold mt-0.5">Recomendado</div>}
                        </div>
                      </div>
                      <div className="text-zinc-300 text-xs font-bold">{p.price}</div>
                    </label>
                  ))}
                </div>

                <div className="mt-4 space-y-3 pt-2 border-t border-white/5">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1.5 block">Monto de oferta final (MXN)</label>
                    <input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1.5 block">Mensaje adicional (opcional)</label>
                    <textarea value={offerMsg} onChange={(e) => setOfferMsg(e.target.value)} rows={2} placeholder="Escribe cualquier duda o detalle sobre la entrega..."
                      className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600 resize-none" />
                  </div>
                </div>

                <button onClick={handleOffer} disabled={offerLoading}
                  className="btn-red mt-2 w-full inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-3.5 rounded-sm disabled:opacity-70">
                  {offerLoading ? 'Guardando...' : 'Confirmar Paquete y Oferta'}
                </button>
              </div>

              <button className="btn-outline mt-3 w-full inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-3 rounded-sm">
                <MessageCircle size={13} /> Contactar asesor Motoluv
              </button>
            </div>
          )}

          {/* VENDEDOR */}
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
              <Award size={12} className="text-red-brand" /> Publicación verificada por Motoluv
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
            {similar.map((m) => <MotoCard key={m.id} moto={m} />)}
          </div>
        </div>
      )}

      {/* MODAL INTERACTIVO DE APARTADO */}
      {showApartadoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111112] border border-white/10 rounded-md max-w-md w-full p-6 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setShowApartadoModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div>
              <span className="text-xs font-bold text-red-brand tracking-widest uppercase">Paso 1 de 2</span>
              <h3 className="font-display font-bold text-white text-2xl uppercase mt-1">
                APARTAR
              </h3>
              <p className="text-zinc-400 text-xs mt-1">
                Al hacer el apartado la motocicleta será separada del inventario por 24 hrs.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-white/5 rounded-sm">
              <img src={moto.image} alt={moto.model} className="w-14 h-14 object-cover rounded-sm" />
              <div>
                <div className="text-white text-sm font-bold">{moto.brand} {moto.model}</div>
                <div className="text-zinc-500 text-xs">Precio de lista: ${moto.price.toLocaleString()} MXN</div>
              </div>
            </div>

            <div className="p-4 bg-red-brand/10 border border-red-brand/30 rounded-sm flex items-center justify-between">
              <div>
                <span className="text-white font-extrabold text-sm block">Separación de Inventario (24 hrs)</span>
                <p className="text-zinc-300 text-[11px] leading-relaxed mt-0.5">
                  La unidad será bloqueada del inventario por 24 horas a tu favor.
                </p>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <span className="text-[10px] text-zinc-400 uppercase block">Costo de Apartado</span>
                <span className="font-display font-bold text-red-brand text-xl">$600.00 MXN</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-zinc-400 uppercase tracking-wider block">Método de Confirmación</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'card', label: 'Tarjeta' },
                  { id: 'spei', label: 'SPEI' },
                  { id: 'oxxo', label: 'OXXO' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setApartadoPaymentMethod(m.id)}
                    className={`py-2 px-3 border text-xs font-bold rounded-sm uppercase tracking-wider transition-colors ${apartadoPaymentMethod === m.id ? 'border-red-brand bg-red-brand/10 text-white' : 'border-white/10 text-zinc-400 hover:border-white/20'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handlePerformApartado}
                disabled={apartadoLoading}
                className="btn-red w-full py-3.5 text-xs font-bold tracking-widest uppercase rounded-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
              >
                {apartadoLoading ? 'Procesando...' : 'Confirmar y Pagar $600.00 MXN'}
              </button>
              <p className="text-[10px] text-zinc-500 text-center mt-3">
                Al hacer el apartado la motocicleta será separada del inventario por 24 hrs.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MotoDetailPage;
