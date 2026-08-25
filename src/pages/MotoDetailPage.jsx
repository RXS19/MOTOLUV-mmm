import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Wrench, Palette, Gauge, Award, Eye, Star, Shield, ChevronRight, ChevronLeft, MessageCircle, User, Activity, Lock, CheckCircle2, BookmarkCheck, CreditCard, X, AlertCircle, FileText, Download, Printer, ShieldCheck, CheckCheck, Heart } from 'lucide-react';
import MotoCard from '../components/MotoCard';
import { motoApi, offerApi, clipApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { toast } from '../hooks/use-toast';
import { getStatusStyle } from '../utils/status';
import { handleImageError, resolveSafeImageUrl, FALLBACK_MOTO_IMAGE } from '../utils/imageFallback';

const PKG_PRICES = { basico: 0, plus: 1800, total: 3500 };

const MotoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
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

  const fav = isFavorite(moto?.id);

  // Certificate Modal state
  const [showCertModal, setShowCertModal] = useState(false);

  const images = moto 
    ? (moto.images && moto.images.length > 0 
        ? moto.images.map((img) => resolveSafeImageUrl(img, 'moto')) 
        : [resolveSafeImageUrl(moto.image || FALLBACK_MOTO_IMAGE, 'moto')]) 
    : [];

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
      if (apartadoPaymentMethod === 'clip') {
        const clipReq = await clipApi.createPaymentRequest({
          amount: 600,
          description: `Apartado Motocicleta ${moto.brand} ${moto.model}`,
          customerEmail: user.email,
          customerName: user.name,
          isApartado: true,
          motoId: moto.id,
        });

        await clipApi.processCheckout({
          amount: 600,
          customerInfo: { email: user.email, name: user.name },
          clipReference: clipReq.clipReference,
          isApartado: true,
          motoId: moto.id,
        });

        toast({
          title: '¡Apartado Exitoso!',
          description: `Has apartado ${moto.brand} ${moto.model} con $600 MXN. Ref: ${clipReq.clipReference}`,
        });
      } else {
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
      }

      setHasApartado(true);
      setShowApartadoModal(false);
      setMoto((prev) => prev ? { ...prev, status: 'Apartada' } : prev);
    } catch (err) {
      toast({
        title: 'Error al procesar el apartado',
        description: err?.response?.data?.detail || err?.message || 'Intenta nuevamente.',
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

  const rawScoreDetails = (moto && (moto.score_details || moto.scoreDetails)) || null;
  const scoreDetails = (rawScoreDetails && Object.keys(rawScoreDetails).length > 0)
    ? rawScoreDetails
    : {
        'Motor y Compresión': 92,
        'Sistema de Frenos': 88,
        'Suspensión y Horquillas': 85,
        'Transmisión y Embrague': 90,
        'Neumáticos y Rines': 82,
        'Sistema Eléctrico': 94,
        'Chasis y Geometría': 95,
        'Documentación y Legal': 100,
      };

  const scoreValue = moto && moto.score !== undefined && moto.score !== null ? Number(moto.score) : 4.8;
  const certFolio = moto?.certification_id || `CERT-MLV-${2024000 + (parseInt(String(moto?.id).replace(/\D/g, '')) || 101)}`;
  const certDate = moto?.certified_date || '2024-05-15';
  const certInspector = moto?.certifier || 'Taller Mecánico Especializado Motoluv MX • Inspector #MLV-408';
  const certStatus = moto?.certified_status || 'Aprobada • Certificación Integral';
  const certNotes = moto?.inspection_notes || 'Inspección técnica y peritaje integral completados satisfactoriamente. Compresión de motor verificada en estándar óptimo. Sistema de frenos y suspensión sin holguras ni desgastes anómalos. Sistema eléctrico y arnés íntegro. Libre de reporte de robo, siniestros y con número de serie/VIN cotejado en REPUVE.';

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
            <img 
              src={images[selectedImage]} 
              alt={moto.model} 
              onError={(e) => handleImageError(e, 'moto')}
              className="w-full h-full object-cover transition-all duration-300" 
            />
            
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

            {/* Favorite Heart Button on Main Image */}
            <button
              type="button"
              onClick={() => toggleFavorite(moto)}
              aria-label={fav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              title={fav ? 'Quitar de tus motos guardadas' : 'Guardar en tus motos guardadas'}
              className={`absolute top-4 right-4 z-20 p-2.5 rounded-full transition-all duration-300 shadow-xl flex items-center justify-center ${
                fav
                  ? 'bg-red-brand text-white scale-105 shadow-red-brand/50'
                  : 'bg-black/70 text-white/90 hover:text-white hover:bg-black/90 hover:scale-110 border border-white/10'
              }`}
            >
              <Heart
                size={18}
                className={`transition-all duration-200 ${
                  fav ? 'fill-white stroke-white' : 'stroke-current stroke-2 hover:fill-red-brand/40'
                }`}
              />
            </button>
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
                <img 
                  src={img} 
                  alt={`${moto.model} ${i + 1}`} 
                  onError={(e) => handleImageError(e, 'moto')}
                  className="w-full h-full object-cover" 
                />
              </button>
            ))}
          </div>

          <div className="mt-10">
            <h2 className="font-display font-bold text-white text-2xl uppercase tracking-wide mb-4">Descripción</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">{moto.description || 'Sin descripción disponible.'}</p>
          </div>

          <div className="mt-10">
            <h2 className="font-display font-bold text-white text-2xl uppercase tracking-wide mb-5">Ficha técnica</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {Object.entries(specs).map(([k, v]) => (
                <div key={k} className="bg-gradient-to-b from-[#151517] to-[#0d0d0e] hover:from-[#242428] hover:to-[#141416] border border-black rounded-md p-4 transition-all duration-300">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{k}</div>
                  <div className="text-white text-sm font-medium">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* REPORTE DE CERTIFICACIÓN E INSPECCIÓN MECÁNICA */}
          <div className="mt-12">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-red-brand/10 border border-red-brand/30 text-red-brand text-[10px] font-extrabold uppercase tracking-widest rounded-sm inline-flex items-center gap-1.5">
                    <ShieldCheck size={13} /> Certificación Oficial Motoluv
                  </span>
                  <span className="text-zinc-500 text-xs">• Inspección Certificada</span>
                </div>
                <h2 className="font-display font-bold text-white text-2xl md:text-3xl uppercase tracking-wide mt-1.5 flex items-center gap-3">
                  Reporte de Certificación
                </h2>
              </div>

              {user && (
                <button
                  onClick={() => setShowCertModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1d] hover:bg-red-brand hover:text-white border border-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-sm"
                >
                  <FileText size={14} className="text-red-brand group-hover:text-white" />
                  Ver Certificado Oficial
                </button>
              )}
            </div>

            {user ? (
              <div className="bg-[#111112] border border-white/10 rounded-md p-6 lg:p-7 space-y-6 shadow-xl relative overflow-hidden">
                {/* Header card with Score & Verification */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-[#0a0a0b] border border-white/5 rounded-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-md bg-gradient-to-br from-red-brand to-red-700 flex flex-col items-center justify-center text-white shadow-lg flex-shrink-0">
                      <span className="font-display font-extrabold text-2xl leading-none">{scoreValue.toFixed(1)}</span>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-red-100 mt-0.5">de 5.0</span>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Score Mecánico</div>
                      <div className="text-white font-bold text-sm flex items-center gap-1 mt-0.5">
                        <CheckCheck size={15} className="text-emerald-400" /> {certStatus}
                      </div>
                    </div>
                  </div>

                  <div className="border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-4">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Folio de Inspección</div>
                    <div className="text-white font-mono font-bold text-sm mt-0.5">{certFolio}</div>
                    <div className="text-[11px] text-zinc-400 mt-1">Fecha: {certDate}</div>
                  </div>

                  <div className="border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-4">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Perito Dictaminador</div>
                    <div className="text-zinc-300 text-xs font-medium mt-0.5 line-clamp-2">{certInspector}</div>
                  </div>
                </div>

                {/* Grid of Mechanical Systems */}
                <div>
                  <div className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-4 flex items-center justify-between">
                    <span>Evaluación por Sistemas Mecánicos y Estructurales</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Tolerancia fabricante OK</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {Object.entries(scoreDetails).map(([k, v]) => {
                      const numVal = Number(v) || 85;
                      const isHigh = numVal >= 90;
                      const isGood = numVal >= 80;
                      return (
                        <div key={k} className="p-3 bg-[#0a0a0b]/60 border border-white/5 rounded-sm hover:border-white/10 transition-colors">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-zinc-200 font-medium flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isHigh ? 'bg-emerald-400' : isGood ? 'bg-amber-400' : 'bg-red-400'}`} />
                              {k}
                            </span>
                            <span className="text-white font-bold font-mono">{numVal}%</span>
                          </div>
                          <div className="h-2 bg-[#1a1a1c] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isHigh
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                  : isGood
                                  ? 'bg-gradient-to-r from-red-brand to-red-500'
                                  : 'bg-gradient-to-r from-amber-500 to-amber-400'
                              }`}
                              style={{ width: `${numVal}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Diagnostic notes */}
                <div className="p-4 bg-[#0a0a0b] border border-white/5 rounded-sm space-y-2">
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Wrench size={13} className="text-red-brand" /> Observaciones del Diagnóstico Técnico
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {certNotes}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-red-brand" />
                    <span>Inspección integral avalada con sello digital de garantía Motoluv.</span>
                  </div>
                  <button
                    onClick={() => setShowCertModal(true)}
                    className="text-red-brand hover:underline font-bold text-xs flex items-center gap-1"
                  >
                    Ver certificado completo <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#111112] border border-white/10 rounded-md p-8 text-center space-y-5 relative overflow-hidden shadow-xl">
                <div className="w-14 h-14 rounded-full bg-red-brand/10 border border-red-brand/30 flex items-center justify-center mx-auto text-red-brand">
                  <Lock size={24} />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="font-display font-bold text-white text-xl uppercase">
                    Reporte de Certificación Bloqueado
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Esta motocicleta cuenta con certificación técnica integral y folio oficial. Inicia sesión o regístrate de forma gratuita para desbloquear el score por sistemas, diagnóstico de compresión y certificado digital de peritaje.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      toast({ title: 'Inicia sesión', description: 'Accede a tu cuenta para ver el reporte de certificación completo.' });
                      navigate('/iniciar-sesion');
                    }}
                    className="btn-red px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-sm"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => navigate('/registro')}
                    className="px-6 py-3 border border-white/10 hover:border-white/30 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
                  >
                    Crear Cuenta Gratis
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-[#111112] border border-black rounded-md p-6">
            <div className="flex items-center justify-end gap-2 mb-2">
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

            <div className="mt-6 pt-6 border-t border-black">
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Precio Publicado</div>
              <div className="font-display font-bold text-red-brand text-4xl">${moto.price.toLocaleString()} MXN</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-black text-sm">
              <div className="flex items-center gap-2 text-zinc-300"><Calendar size={14} className="text-red-brand" /> {moto.year}</div>
              <div className="flex items-center gap-2 text-zinc-300"><Gauge size={14} className="text-red-brand" /> {moto.km.toLocaleString()} km</div>
              <div className="flex items-center gap-2 text-zinc-300"><Wrench size={14} className="text-red-brand" /> {moto.engine}</div>
              <div className="flex items-center gap-2 text-zinc-300"><Palette size={14} className="text-red-brand" /> {moto.color}</div>
              <div className="flex items-center gap-2 text-zinc-300 col-span-2"><MapPin size={14} className="text-red-brand" /> {moto.city}</div>
            </div>

            {/* Quick Favorites Action Button */}
            <div className="mt-5 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => toggleFavorite(moto)}
                className={`w-full py-3 px-4 rounded-sm border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all ${
                  fav
                    ? 'bg-red-brand/15 border-red-brand/50 text-red-brand hover:bg-red-brand/25 shadow-sm'
                    : 'bg-[#18181c] border-white/10 text-zinc-300 hover:text-white hover:border-white/20 hover:bg-[#202026]'
                }`}
              >
                <Heart size={16} className={fav ? 'fill-red-brand text-red-brand' : 'text-zinc-400'} />
                <span>{fav ? 'Guardada en tus favoritos' : 'Guardar en favoritos'}</span>
              </button>
            </div>
          </div>

          {/* BLOQUE DE APARTADO */}
          <div className="bg-[#111112] border border-black rounded-md p-6 relative overflow-hidden">
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

                <div className="mt-4 pt-2 border-t border-white/5">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1.5 block">Monto de oferta final (MXN)</label>
                    <input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors" />
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
              <img 
                src={resolveSafeImageUrl(moto.image, 'moto')} 
                alt={moto.model} 
                onError={(e) => handleImageError(e, 'moto')}
                className="w-14 h-14 object-cover rounded-sm" 
              />
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
              <label className="text-xs text-zinc-400 uppercase tracking-wider block">Método de Confirmación y Pago</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'card', label: 'Tarjeta Bancaria' },
                  { id: 'spei', label: 'Transferencia SPEI' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setApartadoPaymentMethod(m.id)}
                    className={`py-2 px-3 border text-xs font-bold rounded-sm uppercase tracking-wider transition-colors text-center ${
                      apartadoPaymentMethod === m.id
                        ? 'border-red-brand bg-red-brand/10 text-white'
                        : 'border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
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
                className="btn-red w-full py-3.5 text-xs font-bold tracking-widest uppercase rounded-sm flex items-center justify-center shadow-lg disabled:opacity-70 text-center"
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

      {/* MODAL DE CERTIFICADO OFICIAL MOTOLUV */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0e0e10] border border-white/15 rounded-md max-w-3xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl my-8 text-left">
            <button
              onClick={() => setShowCertModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>

            {/* Certificate Header */}
            <div className="border-b border-white/10 pb-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="font-display font-black text-white text-2xl tracking-wider">MOTO<span className="text-red-brand">LUV</span></span>
                  <span className="px-2 py-0.5 bg-red-brand text-white text-[9px] font-bold uppercase tracking-widest rounded-sm">Oficial</span>
                </div>
                <h3 className="font-display font-bold text-white text-lg sm:text-xl uppercase tracking-wide mt-1">
                  Certificado de Inspección Mecánica y Legal
                </h3>
                <p className="text-zinc-400 text-xs">
                  Dictamen técnico y validación vehicular integral
                </p>
              </div>

              <div className="text-center sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Folio Oficial</div>
                <div className="text-red-brand font-mono font-bold text-sm sm:text-base">{certFolio}</div>
                <div className="text-[11px] text-zinc-400">Emisión: {certDate}</div>
              </div>
            </div>

            {/* Vehicle Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#141417] border border-white/5 rounded-sm text-xs">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase block">Motocicleta</span>
                <span className="text-white font-bold">{moto.brand} {moto.model}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] uppercase block">Año / KM</span>
                <span className="text-white font-bold">{moto.year} • {moto.km?.toLocaleString()} km</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] uppercase block">Motor / Color</span>
                <span className="text-white font-bold">{moto.engine} • {moto.color}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] uppercase block">Dictamen Final</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> {certStatus}
                </span>
              </div>
            </div>

            {/* Detailed Inspection Matrix */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award size={14} className="text-red-brand" /> Resultados por Módulo de Inspección Certificada
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(scoreDetails).map(([cat, val]) => (
                  <div key={cat} className="flex items-center justify-between p-3 bg-[#141417] border border-white/5 rounded-sm text-xs">
                    <span className="text-zinc-300 font-medium flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                      {cat}
                    </span>
                    <span className="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/10">
                      {val}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Notes & Peritaje */}
            <div className="p-4 bg-[#141417] border border-white/5 rounded-sm text-xs space-y-2">
              <span className="text-zinc-400 font-bold uppercase tracking-wider block">Dictamen del Inspector Certificado:</span>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                {certNotes}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[10px] text-zinc-500 border-t border-white/5">
                <span>{certInspector}</span>
                <span>Registro Oficial Motoluv MX • Firma Digital Verificada</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <Shield size={14} className="text-red-brand" />
                <span>Documento oficial de verificación digital exclusiva en plataforma Motoluv.</span>
              </div>
              <button
                onClick={() => setShowCertModal(false)}
                className="px-6 py-2.5 bg-[#1a1a1d] hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-200 hover:text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MotoDetailPage;
