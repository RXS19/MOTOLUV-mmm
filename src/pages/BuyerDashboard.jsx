import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  Heart,
  MessageSquare,
  Shield,
  Bike,
  Clock,
  ChevronRight,
  X,
  Award,
  AlertCircle,
  Eye,
  CreditCard,
  Send,
  Sparkles,
  Phone,
  Tag,
  DollarSign,
  Download,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { offerApi } from '../services/api';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeaderBar from '../components/dashboard/DashboardHeaderBar';
import { resolveSafeImageUrl, handleImageError } from '../utils/imageFallback';
import { toast } from '../hooks/use-toast';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const { favorites, isFavorite, toggleFavorite, removeFavorite } = useFavorites();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'resumen';

  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [offers, setOffers] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showProtectionModal, setShowProtectionModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);

  // Chat message thread state
  const [activeChatUser, setActiveChatUser] = useState('asesor');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'asesor',
      senderName: 'Asesor Especialista Motoluv',
      text: '¡Hola Pedro! La inspección técnica certificada para la Yamaha MT-07 2021 ya está en curso con el perito.',
      time: '09:40 AM',
      isMe: false
    },
    {
      id: 2,
      sender: 'me',
      senderName: 'Tú',
      text: 'Perfecto, me interesa mucho revisar la compresión del motor y el estado de la cadena.',
      time: '09:45 AM',
      isMe: true
    },
    {
      id: 3,
      sender: 'luis',
      senderName: 'Luis Ramírez (Vendedor)',
      text: '¡Hola Pedro! Confirmado, el perito ya se encuentra en el Centro de Inspección Autorizado para certificar la moto.',
      time: '11:05 AM',
      isMe: false
    }
  ]);

  // Requests / Sent Offers state
  const [myRequests, setMyRequests] = useState([
    {
      id: 'req-1',
      moto_brand: 'Yamaha',
      moto_model: 'MT-07',
      year: 2021,
      date: '18 May 2025',
      status: 'inspeccion',
      statusLabel: 'Inspección en curso',
      statusType: 'emerald',
      nextStep: 'Resultado de inspección técnica',
      image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&q=80',
      amount: 125000,
      depositPaid: 2000,
      sellerName: 'Luis Ramírez'
    },
    {
      id: 'req-2',
      moto_brand: 'KTM',
      moto_model: 'Duke 390',
      year: 2022,
      date: '15 May 2025',
      status: 'oferta_enviada',
      statusLabel: 'Oferta enviada',
      statusType: 'blue',
      nextStep: 'Esperando respuesta del vendedor',
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80',
      amount: 92500,
      depositPaid: 0,
      sellerName: 'Mario Vargas'
    },
  ]);

  // Purchases list
  const purchases = [
    {
      id: 'compra-104',
      moto: 'Kawasaki Ninja 400 2023',
      date: '10 Feb 2025',
      total: 112000,
      status: 'Entregada y Verificada',
      protectionUntil: '10 Feb 2026',
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80'
    }
  ];

  // Sync tab with URL search params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const refreshOffers = () => {
    offerApi.mine().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setOffers(data);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    refreshOffers();
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Pedro';

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      senderName: 'Tú',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');

    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender: activeChatUser,
        senderName: activeChatUser === 'asesor' ? 'Asesor Motoluv' : 'Luis Ramírez',
        text: activeChatUser === 'asesor'
          ? 'Enterado Pedro. Los resultados de compresión y revisión mecánica estarán listos hoy mismo en tu panel.'
          : '¡Saludos Pedro! Cualquier duda sobre los accesorios que incluye la moto me avisas.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };
      setMessages(prev => [...prev, reply]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#080809] text-zinc-100 flex flex-col lg:flex-row">
      {/* Left Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        mode="comprador"
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Header Bar */}
        <DashboardHeaderBar mode="comprador" />

        {/* ================= TAB 1: RESUMEN ================= */}
        {activeTab === 'resumen' && (
          <div className="space-y-6">
            {/* Greeting Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Hola, {firstName}
                </h1>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                  Este es el resumen de tu actividad y compras protegidas en Motoluv.
                </p>
              </div>

              <Link
                to="/motos"
                className="px-4 py-2 bg-red-brand hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all"
              >
                <Bike size={15} />
                <span>Explorar Motos Certificadas</span>
              </Link>
            </div>

            {/* 4 KPI Metric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              <KpiCard
                icon={FileText}
                label="Solicitudes activas"
                value={myRequests.length.toString()}
                linkText="Ver detalles →"
                onClick={() => handleTabChange('solicitudes')}
              />
              <KpiCard
                icon={ShieldCheck}
                label="Inspecciones en curso"
                value="1"
                linkText="Ver detalles →"
                onClick={() => handleTabChange('inspecciones')}
              />
              <KpiCard
                icon={ShoppingBag}
                label="Compras en proceso"
                value="1"
                linkText="Ver detalles →"
                onClick={() => handleTabChange('compras')}
              />
              <KpiCard
                icon={CheckCircle2}
                label="Compras completadas"
                value="1"
                linkText="Ver detalles →"
                onClick={() => handleTabChange('compras')}
              />
            </div>

            {/* 2-Column Main Dashboard Layout: Center List + Right Sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Center Column (2 cols width on XL) */}
              <div className="xl:col-span-2 space-y-6">
                {/* Section: Seguimiento de mis solicitudes */}
                <div className="bg-[#101013] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                      Seguimiento de mis solicitudes
                    </h2>
                    <button
                      onClick={() => handleTabChange('solicitudes')}
                      className="text-xs text-red-brand hover:text-red-400 font-semibold transition-colors"
                    >
                      Ver todas →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {myRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 sm:p-4 bg-[#141418] border border-white/5 hover:border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={resolveSafeImageUrl(req.image, 'moto')}
                            alt={`${req.moto_brand} ${req.moto_model}`}
                            onError={(e) => handleImageError(e, 'moto')}
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg bg-black/40 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h3 className="text-white text-sm font-bold truncate">
                              {req.moto_brand} {req.moto_model} {req.year}
                            </h3>
                            <p className="text-zinc-400 text-xs mt-0.5">
                              Oferta realizada el {req.date} • ${req.amount.toLocaleString()} MXN
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-wrap">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                              req.statusType === 'emerald'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}
                          >
                            {req.statusLabel}
                          </span>

                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="px-3.5 py-1.5 bg-[#1b1b20] hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 text-xs font-medium rounded-lg transition-colors"
                          >
                            Ver detalles
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Motos guardadas */}
                <div className="bg-[#101013] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart size={16} className="text-red-brand fill-red-brand" />
                      <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                        Motos guardadas
                      </h2>
                    </div>
                    {favorites.length > 0 && (
                      <button
                        onClick={() => handleTabChange('guardadas')}
                        className="text-xs text-red-brand hover:text-red-400 font-semibold transition-colors"
                      >
                        Ver todas ({favorites.length}) →
                      </button>
                    )}
                  </div>

                  {favorites.length === 0 ? (
                    <div className="p-6 bg-[#141418] border border-dashed border-white/10 rounded-xl text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-red-brand/10 text-red-brand flex items-center justify-center mx-auto">
                        <Heart size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">No tienes motos guardadas aún</p>
                        <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
                          Guarda las motocicletas que te interesen con el ícono de corazón en el catálogo para darles seguimiento.
                        </p>
                      </div>
                      <Link
                        to="/motos"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-brand hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors shadow"
                      >
                        Explorar catálogo
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
                      {favorites.slice(0, 4).map((moto) => (
                        <div
                          key={moto.id}
                          className="group bg-[#141418] border border-white/5 hover:border-white/15 rounded-xl p-2.5 sm:p-3 transition-all relative flex flex-col justify-between"
                        >
                          <Link to={`/motos/${moto.id}`} className="block">
                            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black/40 mb-2.5 relative">
                              <img
                                src={resolveSafeImageUrl(moto.image || moto.images?.[0], 'moto')}
                                alt={`${moto.brand} ${moto.model}`}
                                onError={(e) => handleImageError(e, 'moto')}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <h4 className="text-white text-xs font-bold truncate group-hover:text-red-brand transition-colors">
                              {moto.brand} {moto.model} {moto.year}
                            </h4>
                          </Link>

                          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                            <span className="text-zinc-200 font-bold text-xs">
                              ${Number(moto.price || 0).toLocaleString()} MXN
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleFavorite(moto);
                              }}
                              className="text-red-brand hover:scale-110 transition-transform p-1"
                              title="Quitar de favoritas"
                            >
                              <Heart
                                size={15}
                                className="fill-red-brand text-red-brand"
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (Sidebar Widgets) */}
              <div className="space-y-6">
                {/* Widget 1: Estado de tu protección */}
                <div className="bg-[#101013] border border-white/5 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Estado de tu protección
                  </h3>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Protección activa</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">Vigente hasta Feb 2026</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowProtectionModal(true)}
                      className="px-3 py-1.5 bg-[#1b1b20] hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                    >
                      Ver cobertura
                    </button>
                  </div>
                </div>

                {/* Widget 2: Soporte Concierge Motoluv */}
                <div className="bg-[#101013] border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Asesoría y Soporte
                    </h3>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      En línea
                    </span>
                  </div>

                  <div className="p-3 bg-[#141418] border border-white/5 rounded-xl space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-red-brand/10 text-red-brand flex items-center justify-center text-xs font-bold">
                        AM
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Concierge Motoluv</h4>
                        <p className="text-[11px] text-zinc-400">Atención personalizada y peritaje</p>
                      </div>
                    </div>
                    <a
                      href="https://wa.me/525643048865?text=Hola%20Motoluv,%20necesito%20asistencia%20con%20mi%20compra"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full mt-2 py-2 bg-red-brand hover:bg-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow"
                    >
                      <Phone size={13} />
                      <span>Contactar Asesor (5643048865)</span>
                    </a>
                  </div>
                </div>

                {/* Widget 3: Promo Banner ¿Listo para tu próxima moto? */}
                <div className="bg-[#101013] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[190px]">
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none bg-contain bg-right bg-no-repeat"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80')`,
                    }}
                  />
                  <div className="relative z-10 space-y-3 max-w-[210px]">
                    <h3 className="text-base font-bold text-white leading-tight">
                      ¿Listo para tu próxima moto?
                    </h3>
                    <p className="text-xs text-zinc-400 leading-snug">
                      Explora nuestra selección certificada y encuentra la moto ideal para ti.
                    </p>
                    <Link
                      to="/motos"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-brand hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-colors shadow"
                    >
                      <span>Explorar catálogo</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MOTOS GUARDADAS ================= */}
        {activeTab === 'guardadas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Heart size={20} className="text-red-brand fill-red-brand" />
                  <h1 className="text-2xl font-bold text-white">Motos Guardadas</h1>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tus motocicletas favoritas para darles seguimiento, hacer ofertas y recibir alertas de precio.
                </p>
              </div>
              <Link to="/motos" className="text-xs text-red-brand font-semibold hover:underline flex items-center gap-1">
                + Explorar más motos en catálogo
              </Link>
            </div>

            {favorites.length === 0 ? (
              <div className="p-12 bg-[#101013] border border-white/5 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-red-brand/10 text-red-brand flex items-center justify-center mx-auto shadow-inner">
                  <Heart size={32} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">No tienes motos guardadas todavía</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Cuando veas una moto que te interese en el catálogo o en su ficha técnica, haz clic en el ícono de corazón para guardarla en esta sección.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/motos"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-brand hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-brand/20"
                  >
                    <Bike size={16} />
                    <span>Ver motocicletas disponibles</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {favorites.map((m) => (
                  <div
                    key={m.id}
                    className="bg-[#111114] border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all shadow-lg group"
                  >
                    <div>
                      <div className="aspect-[4/3] bg-black/40 relative overflow-hidden">
                        <img
                          src={resolveSafeImageUrl(m.image || m.images?.[0], 'moto')}
                          alt={`${m.brand} ${m.model}`}
                          onError={(e) => handleImageError(e, 'moto')}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(m);
                          }}
                          className="absolute top-2.5 right-2.5 p-2 bg-red-brand/90 hover:bg-red-brand rounded-full text-white hover:scale-110 transition-all shadow-md"
                          title="Quitar de favoritas"
                          aria-label="Quitar de favoritas"
                        >
                          <Heart size={16} className="fill-white stroke-white" />
                        </button>
                        {m.city && (
                          <span className="absolute bottom-2.5 left-2.5 text-[10px] bg-black/80 backdrop-blur px-2.5 py-1 rounded text-zinc-200 border border-white/10 font-medium">
                            📍 {m.city}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <Link to={`/motos/${m.id}`} className="block group-hover:text-red-brand transition-colors">
                          <h3 className="font-bold text-sm text-white truncate">
                            {m.brand} {m.model}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-0.5">Año {m.year || 'N/A'}</p>
                        </Link>
                        <div className="mt-3 text-lg font-black text-red-brand">
                          ${Number(m.price || 0).toLocaleString()} MXN
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 space-y-2">
                      <Link
                        to={`/motos/${m.id}`}
                        className="w-full block text-center py-2.5 bg-red-brand hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-brand/20"
                      >
                        Ver detalles y apartar
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: SOLICITUDES / OFERTAS ================= */}
        {activeTab === 'solicitudes' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Mis Solicitudes y Ofertas</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Revisa el estado de las ofertas de compra que has enviado a los vendedores.
              </p>
            </div>

            <div className="space-y-4">
              {myRequests.map((req) => (
                <div key={req.id} className="p-5 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-3.5">
                      <img src={req.image} alt={req.moto_model} className="w-14 h-14 rounded-xl object-cover" />
                      <div>
                        <h3 className="font-bold text-base text-white">{req.moto_brand} {req.moto_model} {req.year}</h3>
                        <p className="text-xs text-zinc-400">Vendedor: {req.sellerName} • Solicitud #{req.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        req.statusType === 'emerald'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {req.statusLabel}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#141418] rounded-xl text-xs">
                    <div>
                      <span className="text-zinc-500 block">Monto Ofertado</span>
                      <span className="text-white font-bold text-sm">${req.amount.toLocaleString()} MXN</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Apartado en Garantía</span>
                      <span className="text-emerald-400 font-bold text-sm">
                        {req.depositPaid > 0 ? `$${req.depositPaid.toLocaleString()} MXN (Custodia Activa)` : 'Pendiente'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Próximo Hito</span>
                      <span className="text-zinc-200 font-semibold">{req.nextStep}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors"
                    >
                      Ver Detalle Completo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: INSPECCIONES ================= */}
        {activeTab === 'inspecciones' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-white">Mis Inspecciones Técnicas</h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Informes mecánicos y dictámenes técnicos certificados para tus compras.
                </p>
              </div>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                Garantía Motoluv 100%
              </span>
            </div>

            <div className="p-6 bg-[#101013] border border-white/5 rounded-2xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400">Inspección Solicitada</span>
                    <h3 className="font-bold text-base text-white">Yamaha MT-07 2021</h3>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  En Proceso Técnico
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#141418] rounded-xl border border-white/5">
                  <span className="text-zinc-500 block">Motor & Compresión</span>
                  <span className="text-emerald-400 font-bold">175 PSI • Óptimo</span>
                </div>
                <div className="p-3 bg-[#141418] rounded-xl border border-white/5">
                  <span className="text-zinc-500 block">Frenos y Suspensión</span>
                  <span className="text-emerald-400 font-bold">85% Vida útil</span>
                </div>
                <div className="p-3 bg-[#141418] rounded-xl border border-white/5">
                  <span className="text-zinc-500 block">Escaneo OBD2</span>
                  <span className="text-emerald-400 font-bold">0 Códigos de falla</span>
                </div>
                <div className="p-3 bg-[#141418] rounded-xl border border-white/5">
                  <span className="text-zinc-500 block">Validación Legal</span>
                  <span className="text-emerald-400 font-bold">REPUVE Limpio</span>
                </div>
              </div>

              <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-zinc-300">
                El peritaje incluye validación de número de serie en cuadro y motor, factura original de agencia y ausencia de adeudos de tenencia.
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: COMPRAS ================= */}
        {activeTab === 'compras' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Mis Compras</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Historial de motocicletas adquiridas bajo protección y garantía Motoluv.
              </p>
            </div>

            <div className="space-y-4">
              {purchases.map((p) => (
                <div key={p.id} className="p-5 bg-[#101013] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img src={p.image} alt={p.moto} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {p.id}
                      </span>
                      <h3 className="font-bold text-base text-white mt-1">{p.moto}</h3>
                      <p className="text-xs text-zinc-400">Comprada el {p.date} • Garantía hasta {p.protectionUntil}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-zinc-500 block">Total Pagado</span>
                      <span className="text-base font-black text-white">${p.total.toLocaleString()} MXN</span>
                    </div>
                    <button
                      onClick={() => setShowProtectionModal(true)}
                      className="px-4 py-2 bg-red-brand/10 hover:bg-red-brand/20 text-red-brand border border-red-brand/30 text-xs font-bold rounded-xl transition-colors"
                    >
                      Póliza de Garantía
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: PAGOS Y FACTURACIÓN ================= */}
        {activeTab === 'pagos' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Pagos y Facturación</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Historial de apartados, saldos liquidados y recibos fiscales procesados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-red-brand" />
                  <h3 className="font-bold text-sm text-white">Procesamiento de Pago Seguro</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tus transacciones cuentan con encriptación bancaria de alta seguridad y protocolo 3D Secure. Tus fondos permanecen en custodia hasta que recibes y verificas tu motocicleta.
                </p>
                <div className="p-3 bg-[#141418] rounded-xl border border-white/5 text-xs text-zinc-300 space-y-2">
                  <div className="flex justify-between">
                    <span>Apartado de prueba (#AP-8834):</span>
                    <span className="text-emerald-400 font-bold">$2,000 MXN (Pagado)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Método utilizado:</span>
                    <span className="text-zinc-300 font-semibold">Pago Seguro Encriptado</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Datos Fiscales para CFDI 4.0</h3>
                </div>
                <p className="text-xs text-zinc-400">
                  Si requieres factura por las comisiones de servicio o accesorios, se emiten con RFC oficial.
                </p>
                <button
                  onClick={() => toast({ title: 'Facturación CFDI', description: 'Tus datos fiscales están listos para emisión automática.' })}
                  className="w-full py-2.5 bg-[#1b1b20] hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 text-xs font-bold rounded-xl transition-colors"
                >
                  Actualizar Datos de Facturación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 7: CONFIGURACIÓN ================= */}
        {activeTab === 'configuracion' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Configuración de Comprador</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Datos de contacto, dirección de entrega y preferencias de cuenta.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                <h3 className="font-bold text-sm text-white">Información del Comprador</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Nombre:</span>
                    <span className="text-white font-semibold">{user?.name || 'Pedro Contreras'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Correo Electrónico:</span>
                    <span className="text-white font-semibold">{user?.email || 'comprador@motoluv.mx'}</span>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-zinc-400 text-[11px] block">
                      Tus datos personales y canales de enlace son protegidos y gestionados de forma segura y confidencial por Motoluv.
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                <h3 className="font-bold text-sm text-white">Seguridad de la Cuenta</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-lg">
                    <span className="text-zinc-300">Autenticación de 2 Factores (2FA):</span>
                    <span className="text-emerald-400 font-bold">Activo</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-lg">
                    <span className="text-zinc-300">Nivel de Confianza:</span>
                    <span className="text-emerald-400 font-bold">Comprador Certificado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Detalle de Solicitud */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-5 text-left relative shadow-2xl">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <img
                src={resolveSafeImageUrl(selectedRequest.image, 'moto')}
                alt={selectedRequest.moto_model}
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div>
                <h3 className="text-base font-bold text-white">
                  {selectedRequest.moto_brand} {selectedRequest.moto_model} {selectedRequest.year}
                </h3>
                <p className="text-xs text-zinc-400">Solicitud #{selectedRequest.id}</p>
              </div>
            </div>

            <div className="space-y-3 py-2 border-y border-white/5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Estado:</span>
                <span className="text-emerald-400 font-bold">{selectedRequest.statusLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Monto ofertado:</span>
                <span className="text-white font-bold">${selectedRequest.amount?.toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Próximo paso:</span>
                <span className="text-zinc-200">{selectedRequest.nextStep}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Inspección técnica:</span>
                <span className="text-emerald-400 font-medium">Certificación Técnica Motoluv</span>
              </div>
            </div>

            <div className="p-3 bg-white/[0.03] rounded-lg text-[11px] text-zinc-400 flex items-start gap-2">
              <Shield size={14} className="text-red-brand flex-shrink-0 mt-0.5" />
              <span>
                Visualización digital protegida en plataforma Motoluv. Tus fondos están en custodia segura.
              </span>
            </div>

            <button
              onClick={() => setSelectedRequest(null)}
              className="w-full py-2.5 bg-red-brand hover:bg-red-600 text-white font-bold text-xs uppercase rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal: Estado de Protección */}
      {showProtectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 text-left relative shadow-2xl">
            <button
              onClick={() => setShowProtectionModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Protección Motoluv Activa</h3>
                <p className="text-xs text-emerald-400 font-medium">Garantía Mecánica y Legal Incluida</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2 p-2.5 bg-white/[0.02] rounded-lg">
                <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                <span>Garantía Mecánica Motoluv por 30 días en tren motriz y motor.</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-white/[0.02] rounded-lg">
                <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                <span>Validación legal 100% libre de reporte de robo y gravámenes.</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-white/[0.02] rounded-lg">
                <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                <span>Custodia y resguardo de fondos en fideicomiso seguro hasta la entrega.</span>
              </div>
            </div>

            <button
              onClick={() => setShowProtectionModal(false)}
              className="w-full py-2.5 bg-red-brand hover:bg-red-600 text-white font-bold text-xs uppercase rounded-xl transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable KPI Metric Stat Card
const KpiCard = ({ icon: Icon, label, value, linkText, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-[#101013] border border-white/5 hover:border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer transition-all hover:bg-white/[0.02]"
    >
      <div>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 mb-3">
          <Icon size={16} />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {value}
        </div>
        <div className="text-xs text-zinc-400 mt-1 font-medium leading-tight">{label}</div>
      </div>
      <div className="mt-3 pt-2 text-[11px] font-semibold text-zinc-400 hover:text-red-brand transition-colors">
        {linkText}
      </div>
    </div>
  );
};

export default BuyerDashboard;
