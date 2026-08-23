import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bike,
  Tag,
  Clock,
  CheckCircle2,
  MoreVertical,
  Calendar,
  ShieldCheck,
  Zap,
  ArrowRight,
  Eye,
  Heart,
  Plus,
  X,
  Calculator,
  Activity,
  User,
  Shield,
  CreditCard,
  MessageSquare,
  Settings,
  DollarSign,
  Send,
  FileCheck,
  AlertCircle,
  Sparkles,
  Phone,
  RefreshCw,
  Building2,
  Check,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motoApi, offerApi } from '../services/api';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeaderBar from '../components/dashboard/DashboardHeaderBar';
import BoostPublicationModal from '../components/dashboard/BoostPublicationModal';
import { calculateCommission } from '../utils/commission';
import { OPERATION_STATUSES, getStatusStyle } from '../utils/status';
import { resolveSafeImageUrl, handleImageError } from '../utils/imageFallback';
import { toast } from '../hooks/use-toast';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'resumen';
  
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [motos, setMotos] = useState([]);
  const [offers, setOffers] = useState([]);
  const [calcPrice, setCalcPrice] = useState(95000);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [selectedMotoForBoost, setSelectedMotoForBoost] = useState(null);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [counterOfferModal, setCounterOfferModal] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterNote, setCounterNote] = useState('');

  // Chat message thread state
  const [activeChatUser, setActiveChatUser] = useState('especialista');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'especialista',
      senderName: 'Especialista Técnico Motoluv',
      text: '¡Hola Luis! Tu cita de inspección para la Yamaha MT-07 está programada para este viernes a las 11:00 AM en CDMX.',
      time: '10:15 AM',
      isMe: false
    },
    {
      id: 2,
      sender: 'me',
      senderName: 'Tú',
      text: 'Excelente, ya tengo la factura original y tenencias listas.',
      time: '10:18 AM',
      isMe: true
    },
    {
      id: 3,
      sender: 'pedro',
      senderName: 'Pedro Contreras (Comprador)',
      text: 'Hola Luis, te acabo de mandar una oferta por la MT-07. ¿Aceptas pago inmediato por transferencia?',
      time: '11:30 AM',
      isMe: false
    }
  ]);

  // Bank form state
  const [bankForm, setBankForm] = useState({
    clabe: '012180015948372615',
    bank: 'BBVA México',
    holder: user?.name || 'Luis Ramírez',
    rfc: 'RAL890412KJ1',
    notifications: true
  });

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

  // Sample default publications
  const defaultPublications = [
    {
      id: 'pub-1',
      brand: 'Yamaha',
      model: 'MT-07',
      year: 2021,
      price: 128900,
      publishDate: '10 May 2025',
      views: 412,
      savedCount: 25,
      offersCount: 2,
      status: 'Activa',
      is_boosted: true,
      boost_tier: 'plan_15',
      image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&q=80',
    },
    {
      id: 'pub-2',
      brand: 'KTM',
      model: 'Duke 390',
      year: 2022,
      price: 96900,
      publishDate: '05 May 2025',
      views: 289,
      savedCount: 18,
      offersCount: 1,
      status: 'Activa',
      is_boosted: false,
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80',
    },
    {
      id: 'pub-3',
      brand: 'Honda',
      model: 'CB650R',
      year: 2020,
      price: 139900,
      publishDate: '28 Abr 2025',
      views: 367,
      savedCount: 22,
      offersCount: 0,
      status: 'Activa',
      is_boosted: false,
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80',
    },
  ];

  // Sample default received offers
  const [allOffers, setAllOffers] = useState([
    {
      id: 'off-1',
      buyerName: 'Pedro Contreras',
      buyerEmail: 'pedro.c@gmail.com',
      motoBrand: 'Yamaha',
      motoModel: 'MT-07 2021',
      originalPrice: 128900,
      offeredAmount: 123000,
      date: 'Hoy, hace 1h',
      status: 'Pendiente',
      message: 'Ofrezco $123,000 en pago de contado inmediato con entrega esta semana.',
      motoId: 'pub-1'
    },
    {
      id: 'off-2',
      buyerName: 'Andrés Molina',
      buyerEmail: 'andres.m@hotmail.com',
      motoBrand: 'KTM',
      motoModel: 'Duke 390 2022',
      originalPrice: 96900,
      offeredAmount: 92500,
      date: 'Hoy, hace 3h',
      status: 'Pendiente',
      message: '¿Aceptas $92,500? Cuento con apartado listo en la plataforma.',
      motoId: 'pub-2'
    },
    {
      id: 'off-3',
      buyerName: 'Roberto Garza',
      buyerEmail: 'rgarza@outlook.com',
      motoBrand: 'Yamaha',
      motoModel: 'MT-07 2021',
      originalPrice: 128900,
      offeredAmount: 125000,
      date: 'Ayer',
      status: 'Aceptada',
      message: 'Oferta acordada sujeta a dictamen de inspección técnica.',
      motoId: 'pub-1'
    }
  ]);

  const loadData = () => {
    motoApi.mine().then((data) => {
      if (Array.isArray(data) && data.length > 0) setMotos(data);
    }).catch(() => {});
    offerApi.received().then((data) => {
      if (Array.isArray(data) && data.length > 0) setOffers(data);
    }).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Luis';
  const displayMotos = motos.length > 0 ? motos : defaultPublications;

  const currentCalc = calculateCommission(calcPrice || 0);

  const handleStatusChange = async (motoId, newStatus) => {
    try {
      await motoApi.update(motoId, { status: newStatus });
      toast({ title: 'Estatus actualizado', description: `La operación ahora está en estatus "${newStatus}".` });
      loadData();
    } catch {
      toast({ title: 'Estatus actualizado localmente' });
      setMotos(prev => prev.map(m => m.id === motoId ? { ...m, status: newStatus } : m));
    }
  };

  const handleOpenBoostModal = (moto = null) => {
    setSelectedMotoForBoost(moto || displayMotos[0]);
    setShowBoostModal(true);
  };

  const handleAcceptOffer = (offerId) => {
    setAllOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'Aceptada' } : o));
    toast({ title: '¡Oferta Aceptada!', description: 'Se ha notificado al comprador para iniciar el depósito en custodia.' });
  };

  const handleRejectOffer = (offerId) => {
    setAllOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'Rechazada' } : o));
    toast({ title: 'Oferta rechazada', description: 'La oferta ha sido declinada cortésmente.' });
  };

  const handleSendCounterOffer = (e) => {
    e.preventDefault();
    if (!counterPrice) return;
    setAllOffers(prev => prev.map(o => o.id === counterOfferModal.id ? { ...o, status: 'Contraoferta enviada', offeredAmount: Number(counterPrice) } : o));
    toast({ title: 'Contraoferta enviada', description: `Has propuesto $${Number(counterPrice).toLocaleString()} MXN.` });
    setCounterOfferModal(null);
    setCounterPrice('');
    setCounterNote('');
  };

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

    // Simulated reply
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender: activeChatUser,
        senderName: activeChatUser === 'especialista' ? 'Especialista Motoluv' : 'Pedro Contreras',
        text: activeChatUser === 'especialista' 
          ? 'Recibido Luis. Nuestro perito llevará el protocolo de certificación técnica y el lector OBD2.'
          : '¡Gracias por responder! Estoy al pendiente del reporte de inspección.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };
      setMessages(prev => [...prev, reply]);
    }, 1200);
  };

  const handleSaveBank = (e) => {
    e.preventDefault();
    toast({ title: 'Cuenta bancaria guardada', description: 'Tus liquidaciones se transferirán a la CLABE registrada.' });
  };

  return (
    <div className="min-h-screen bg-[#080809] text-zinc-100 flex flex-col lg:flex-row">
      {/* Left Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        mode="vendedor"
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Header Bar */}
        <DashboardHeaderBar mode="vendedor" />

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
                  Administra tus publicaciones y ventas en Motoluv.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleOpenBoostModal()}
                  className="px-4 py-2 bg-gradient-to-r from-red-brand to-orange-600 hover:from-red-600 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-brand/20 flex items-center justify-center transition-all"
                >
                  <span>Destacar Publicación</span>
                </button>
                <Link
                  to="/panel/publicar"
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center gap-2 transition-all"
                >
                  <Plus size={15} />
                  <span>Publicar Moto</span>
                </Link>
              </div>
            </div>

            {/* 4 KPI Metric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              <KpiCard
                icon={Bike}
                label="Publicaciones activas"
                value={displayMotos.length.toString()}
                linkText="Ver todas →"
                onClick={() => handleTabChange('publicaciones')}
              />
              <KpiCard
                icon={Tag}
                label="Ofertas recibidas"
                value={allOffers.filter(o => o.status === 'Pendiente').length.toString()}
                linkText="Ver todas →"
                onClick={() => handleTabChange('ofertas')}
              />
              <KpiCard
                icon={Clock}
                label="Ventas en proceso"
                value="1"
                linkText="Ver todas →"
                onClick={() => handleTabChange('proceso')}
              />
              <KpiCard
                icon={CheckCircle2}
                label="Ventas completadas"
                value="4"
                linkText="Ver todas →"
                onClick={() => handleTabChange('completadas')}
              />
            </div>

            {/* 2-Column Main Dashboard Layout: Center List + Right Sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Center Column (2 cols width on XL) */}
              <div className="xl:col-span-2 space-y-6">
                {/* Section: Mis publicaciones */}
                <div className="bg-[#101013] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                      <span>Mis publicaciones</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-normal">
                        {displayMotos.length}
                      </span>
                    </h2>
                    <button
                      onClick={() => handleTabChange('publicaciones')}
                      className="text-xs text-red-brand hover:text-red-400 font-semibold transition-colors"
                    >
                      Ver todas →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {displayMotos.map((pub, idx) => (
                      <div
                        key={pub.id || idx}
                        className="p-3.5 sm:p-4 bg-[#141418] border border-white/5 hover:border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative flex-shrink-0">
                            <img
                              src={resolveSafeImageUrl(pub.image || pub.images?.[0], 'moto')}
                              alt={`${pub.brand} ${pub.model}`}
                              onError={(e) => handleImageError(e, 'moto')}
                              className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg bg-black/40"
                            />
                            {pub.is_boosted && (
                              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-brand to-orange-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow flex items-center gap-0.5">
                                <Sparkles size={8} /> TOP
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-white text-sm font-bold truncate flex items-center gap-1.5">
                              <span>{pub.brand} {pub.model} {pub.year}</span>
                            </h3>
                            <p className="text-zinc-400 text-xs mt-0.5">
                              Publicado el {pub.publishDate || 'Recientemente'}
                            </p>
                            <p className="text-zinc-200 text-xs font-bold mt-0.5">
                              ${Number(pub.price).toLocaleString()} MXN
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-wrap">
                          <div className="flex items-center gap-3 text-xs text-zinc-400">
                            <div className="text-center">
                              <span className="text-[10px] text-zinc-500 block">Vistas</span>
                              <span className="font-semibold text-white">{pub.views || 412}</span>
                            </div>
                            <div className="text-center">
                              <span className="text-[10px] text-zinc-500 block">Guardados</span>
                              <span className="font-semibold text-white">{pub.savedCount || 25}</span>
                            </div>
                            <div className="text-center">
                              <span className="text-[10px] text-zinc-500 block">Ofertas</span>
                              <span className="font-semibold text-white">{pub.offersCount || 2}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenBoostModal(pub)}
                              className="px-3 py-1.5 bg-red-brand/10 hover:bg-red-brand/20 text-red-brand border border-red-brand/30 text-xs font-bold rounded-lg transition-colors flex items-center justify-center"
                              title="Destacar publicación"
                            >
                              <span>Destacar</span>
                            </button>
                            <Link
                              to={pub.id ? `/motos/${pub.id}` : '/motos'}
                              className="px-3 py-1.5 bg-[#1b1b20] hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                            >
                              Ver ficha
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulator: Calculadora y Ganancia Neta */}
                <div className="bg-[#101013] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Calculator size={18} className="text-red-brand" />
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        Simulador de Ganancia Neta y Comisión
                      </h3>
                    </div>
                    <span className="text-xs text-zinc-500">Transparencia 100% Motoluv</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-2">
                    <div className="sm:col-span-1">
                      <label className="text-[11px] text-zinc-400 uppercase tracking-wider block mb-1">
                        Precio de venta estimado (MXN)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                        <input
                          type="number"
                          value={calcPrice}
                          onChange={(e) => setCalcPrice(Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-2 bg-[#141418] border border-white/10 focus:border-red-brand text-white font-bold text-sm rounded-xl outline-none"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 p-3.5 bg-[#141418] border border-white/5 rounded-xl flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase block">Precio Venta</span>
                        <span className="text-white font-bold text-xs">${(calcPrice || 0).toLocaleString()} MXN</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase block">Comisión Motoluv</span>
                        <span className="text-red-brand font-bold text-xs">-${currentCalc.commissionAmount.toLocaleString()} MXN</span>
                      </div>
                      <div className="bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                        <span className="text-emerald-400 text-[10px] font-bold uppercase block">Pago Neto</span>
                        <span className="text-emerald-300 font-extrabold text-sm">${currentCalc.netEarnings.toLocaleString()} MXN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Sidebar Widgets) */}
              <div className="space-y-6">
                {/* Widget 1: Próximos pasos */}
                <div className="bg-[#101013] border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Próximos pasos
                    </h3>
                    <button
                      onClick={() => handleTabChange('inspecciones')}
                      className="text-xs text-red-brand hover:text-red-400 font-semibold transition-colors"
                    >
                      Ver todo
                    </button>
                  </div>

                  <div className="p-3.5 bg-[#141418] border border-white/5 rounded-xl space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-brand/10 text-red-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ShieldCheck size={16} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white leading-tight">
                          Inspección programada
                        </h4>
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          Tu moto Yamaha MT-07 2021 será inspeccionada el 20 May a las 11:00 AM.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedInspection({
                          moto: 'Yamaha MT-07 2021',
                          date: '20 de Mayo 2025, 11:00 AM',
                          address: 'Av. Insurgentes Sur 1450, Benito Juárez, CDMX',
                          inspector: 'Ing. Carlos Mendoza (Perito Certificado Motoluv)',
                          protocol: 'Certificación Técnica Integral',
                          status: 'Programada'
                        });
                        setShowInspectionModal(true);
                      }}
                      className="w-full py-1.5 bg-[#1b1b20] hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 text-xs font-medium rounded-lg transition-colors"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>

                {/* Widget 2: Ofertas recientes */}
                <div className="bg-[#101013] border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Ofertas recientes
                    </h3>
                    <button
                      onClick={() => handleTabChange('ofertas')}
                      className="text-xs text-red-brand hover:text-red-400 font-semibold transition-colors"
                    >
                      Ver todas
                    </button>
                  </div>

                  <div className="space-y-3">
                    {allOffers.slice(0, 2).map((off) => (
                      <div key={off.id} className="p-3 bg-[#141418] border border-white/5 rounded-xl space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#1e1e24] text-white flex items-center justify-center text-[10px] font-bold">
                              {off.buyerName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">{off.buyerName}</h4>
                              <p className="text-[11px] text-zinc-400 mt-0.5">{off.motoModel}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-500 whitespace-nowrap">{off.date}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                          <span className="text-zinc-300 font-bold">
                            Oferta: <span className="text-red-brand">${off.offeredAmount.toLocaleString()} MXN</span>
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                            off.status === 'Aceptada'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {off.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Widget 3: Promo Banner ¿Necesitas vender más rápido? */}
                <div className="bg-[#101013] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[190px]">
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none bg-contain bg-right bg-no-repeat"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80')`,
                    }}
                  />
                  <div className="relative z-10 space-y-3 max-w-[220px]">
                    <div className="inline-flex items-center px-2 py-0.5 rounded bg-red-brand/20 border border-red-brand/40 text-red-brand text-[10px] font-bold uppercase">
                      5x Más Visitas
                    </div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      ¿Necesitas vender más rápido?
                    </h3>
                    <p className="text-xs text-zinc-400 leading-snug">
                      Destaca tu publicación para posicionarla en primeros lugares y vender más rápido.
                    </p>
                    <button
                      onClick={() => handleOpenBoostModal()}
                      className="inline-flex items-center justify-center px-4 py-2 bg-red-brand hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-colors shadow-md"
                    >
                      <span>Destacar mi publicación</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PUBLICACIONES ================= */}
        {activeTab === 'publicaciones' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Mis Publicaciones</h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Gestiona tus motocicletas activas, estatus de venta y alcance promocional.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleOpenBoostModal()}
                  className="px-4 py-2 bg-gradient-to-r from-red-brand to-orange-600 hover:from-red-600 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center"
                >
                  <span>Destacar Publicación</span>
                </button>
                <Link
                  to="/panel/publicar"
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Nueva Moto</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayMotos.map((m) => {
                const style = getStatusStyle(m.status);
                return (
                  <div key={m.id} className="bg-[#111114] border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-white/15 transition-all">
                    <div>
                      <div className="aspect-[4/3] bg-zinc-900 relative">
                        <img 
                          src={resolveSafeImageUrl(m.image || m.images?.[0], 'moto')} 
                          alt={m.model} 
                          onError={(e) => handleImageError(e, 'moto')}
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur ${style.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`}></span>
                            {style.label}
                          </span>
                          {m.is_boosted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-red-brand to-orange-500 text-white shadow">
                              <Sparkles size={10} /> Destacada
                            </span>
                          )}
                        </div>
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Eye size={12} /> {m.views || 412}
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-bold text-base text-white">{m.brand} {m.model}</h3>
                          <div className="text-xs text-zinc-400">Año {m.year} · ${(m.km || 14500).toLocaleString()} km</div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-red-brand font-black text-base">${Number(m.price).toLocaleString()} MXN</div>
                          <span className="text-xs text-zinc-400 bg-white/5 px-2 py-0.5 rounded">
                            {m.savedCount || 25} interesados
                          </span>
                        </div>

                        {/* Status indicator (Read-only, synchronized with Supabase & CRM) */}
                        <div className="pt-2 border-t border-white/5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                              <Activity size={11} className="text-red-brand" /> Estatus de Operación
                            </span>
                            <span className="text-[9px] text-zinc-500 font-medium">CRM / Supabase</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-[#16161c] rounded-lg border border-white/5">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${style.badgeClass.replace('bg-black/80', '').replace('backdrop-blur', '').replace('border', '')}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`}></span>
                              {style.label}
                            </span>
                            <span className="text-[10px] text-zinc-500">Sincronizado</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 space-y-2">
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                        <button
                          onClick={() => handleOpenBoostModal(m)}
                          className="w-full py-2 rounded-lg bg-red-brand/10 hover:bg-red-brand/20 text-red-brand border border-red-brand/30 text-xs font-bold transition-colors flex items-center justify-center"
                        >
                          <span>Destacar</span>
                        </button>
                        <Link
                          to={m.id ? `/motos/${m.id}` : '/motos'}
                          className="w-full text-center text-xs font-bold py-2 rounded-lg bg-[#16161c] text-white hover:bg-white/10 transition-colors border border-white/10"
                        >
                          Ver ficha
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: OFERTAS RECIBIDAS ================= */}
        {activeTab === 'ofertas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-white">Ofertas Recibidas</h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Revisa las propuestas de compra económica enviadas por compradores interesados.
                </p>
              </div>
              <span className="text-xs bg-red-brand/10 text-red-brand px-3 py-1 rounded-full border border-red-brand/20 font-bold">
                {allOffers.filter(o => o.status === 'Pendiente').length} Ofertas Pendientes
              </span>
            </div>

            <div className="space-y-4">
              {allOffers.map((off) => (
                <div key={off.id} className="p-5 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-brand/10 text-red-brand border border-red-brand/30 flex items-center justify-center font-bold text-sm">
                        {off.buyerName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{off.buyerName}</span>
                          <span className="text-xs text-zinc-400 font-normal">({off.buyerEmail})</span>
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">Para: <strong className="text-zinc-200">{off.motoBrand} {off.motoModel}</strong></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500">{off.date}</span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        off.status === 'Aceptada'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : off.status === 'Rechazada'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {off.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#141418] rounded-xl text-xs">
                    <div>
                      <span className="text-zinc-500 block">Precio Publicado</span>
                      <span className="text-white font-bold text-sm">${off.originalPrice.toLocaleString()} MXN</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Oferta del Comprador</span>
                      <span className="text-red-brand font-black text-sm">${off.offeredAmount.toLocaleString()} MXN</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Diferencia</span>
                      <span className="text-zinc-300 font-semibold">
                        -${(off.originalPrice - off.offeredAmount).toLocaleString()} MXN ({(((off.originalPrice - off.offeredAmount)/off.originalPrice)*100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {off.status === 'Pendiente' && (
                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                      <button
                        onClick={() => {
                          setCounterOfferModal(off);
                          setCounterPrice(off.offeredAmount.toString());
                        }}
                        className="px-4 py-2 bg-[#1b1b20] hover:bg-white/10 text-zinc-200 border border-white/10 text-xs font-bold rounded-xl transition-colors"
                      >
                        Contraofertar
                      </button>
                      <button
                        onClick={() => handleRejectOffer(off.id)}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition-colors"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => handleAcceptOffer(off.id)}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-emerald-900/30 flex items-center gap-1.5"
                      >
                        <Check size={14} />
                        <span>Aceptar Oferta (${off.offeredAmount.toLocaleString()} MXN)</span>
                      </button>
                    </div>
                  )}
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
                <h1 className="text-2xl font-bold text-white">Inspecciones Mecánicas</h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Control de peritajes técnicos certificados Motoluv.
                </p>
              </div>
              <a
                href="https://wa.me/525643048865?text=Hola%20Motoluv,%20deseo%20agendar%20o%20reprogramar%20una%20inspecci%C3%B3n"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-red-brand hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
              >
                <Phone size={14} />
                <span>Agendar con Asesor</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Inspection 1 */}
              <div className="p-5 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
                    Programada
                  </span>
                  <span className="text-xs text-zinc-500">Folio: #INS-2025-084</span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&q=80"
                    alt="Yamaha MT-07"
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white">Yamaha MT-07 2021</h3>
                    <p className="text-xs text-zinc-400">Cita: 20 de Mayo, 11:00 AM</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-300 p-3 bg-[#141418] rounded-xl border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Lugar:</span>
                    <span className="font-medium text-white">Domicilio del vendedor (CDMX)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Perito Asignado:</span>
                    <span className="font-medium text-white">Ing. Carlos Mendoza (Cert. #402)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Evaluación técnica:</span>
                    <span className="text-emerald-400 font-bold">Certificación Integral + Escaneo OBD2</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedInspection({
                      moto: 'Yamaha MT-07 2021',
                      date: '20 de Mayo 2025, 11:00 AM',
                      address: 'Av. Insurgentes Sur 1450, Benito Juárez, CDMX',
                      inspector: 'Ing. Carlos Mendoza (Perito Certificado Motoluv)',
                      protocol: 'Certificación Técnica Integral',
                      status: 'Programada'
                    });
                    setShowInspectionModal(true);
                  }}
                  className="w-full py-2.5 bg-[#1b1b20] hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors"
                >
                  Ver Protocolo de Inspección
                </button>
              </div>

              {/* Inspection 2 - Completed */}
              <div className="p-5 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Dictamen Aprobado (9.4/10)
                  </span>
                  <span className="text-xs text-zinc-500">Folio: #INS-2025-052</span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80"
                    alt="Honda CB650R"
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white">Honda CB650R 2020</h3>
                    <p className="text-xs text-zinc-400">Inspeccionada el 28 Abr 2025</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-300 p-3 bg-[#141418] rounded-xl border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Compresión Motor:</span>
                    <span className="font-bold text-emerald-400">Excelente (175 PSI)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Llantas y Frenos:</span>
                    <span className="font-medium text-white">85% de vida útil</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Legal y REPUVE:</span>
                    <span className="text-emerald-400 font-bold">100% Limpio sin reporte</span>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs text-emerald-300 font-bold">
                  Sello Certificado Motoluv Emitido
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: VENTAS EN PROCESO ================= */}
        {activeTab === 'proceso' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Ventas en Proceso</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Seguimiento en tiempo real de operaciones bajo custodia y fideicomiso seguro.
              </p>
            </div>

            <div className="p-6 bg-[#101013] border border-white/5 rounded-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3.5">
                  <img
                    src="https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&q=80"
                    alt="Yamaha MT-07"
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                      Operación #OP-8834
                    </span>
                    <h3 className="font-bold text-base text-white mt-1">Yamaha MT-07 2021</h3>
                    <p className="text-xs text-zinc-400">Comprador: Pedro Contreras • Precio Acordado: $125,000 MXN</p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-zinc-400 block">Tu Ganancia Neta a Recibir</span>
                  <span className="text-xl font-black text-emerald-400">$118,750 MXN</span>
                </div>
              </div>

              {/* Progress Milestones Bar */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Progreso de la Venta (4 Fases de Seguridad)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Paso 1</span>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    </div>
                    <h5 className="font-bold text-xs text-white">Apartado en Custodia</h5>
                    <p className="text-[11px] text-zinc-400">$2,000 MXN retenidos</p>
                  </div>

                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-400 uppercase">Paso 2</span>
                      <Clock size={14} className="text-blue-400 animate-spin" />
                    </div>
                    <h5 className="font-bold text-xs text-white">Inspección Mecánica</h5>
                    <p className="text-[11px] text-zinc-400">En curso para el 20 May</p>
                  </div>

                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1 opacity-60">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Paso 3</span>
                      <FileCheck size={14} className="text-zinc-600" />
                    </div>
                    <h5 className="font-bold text-xs text-white">Cesión & Papelería</h5>
                    <p className="text-[11px] text-zinc-500">Validación legal</p>
                  </div>

                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1 opacity-60">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Paso 4</span>
                      <DollarSign size={14} className="text-zinc-600" />
                    </div>
                    <h5 className="font-bold text-xs text-white">Liquidación a Cuenta</h5>
                    <p className="text-[11px] text-zinc-500">SPEI inmediato</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: VENTAS COMPLETADAS ================= */}
        {activeTab === 'completadas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-white">Ventas Completadas</h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Historial de motocicletas vendidas y pagos recibidos exitosamente.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                Total acumulado: $412,000 MXN
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'vnt-1',
                  moto: 'Kawasaki Z900 2022',
                  date: '15 Mar 2025',
                  price: 195000,
                  net: 185250,
                  buyer: 'Diego Morales',
                  status: 'Transferido a BBVA',
                  image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80'
                },
                {
                  id: 'vnt-2',
                  moto: 'Suzuki GSX-S750 2021',
                  date: '12 Ene 2025',
                  price: 165000,
                  net: 156750,
                  buyer: 'Mauricio Peña',
                  status: 'Transferido a BBVA',
                  image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80'
                },
                {
                  id: 'vnt-3',
                  moto: 'Bajaj Dominar 400 2023',
                  date: '04 Nov 2024',
                  price: 75000,
                  net: 71250,
                  buyer: 'Gabriel Soto',
                  status: 'Transferido a BBVA',
                  image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&q=80'
                }
              ].map((item) => (
                <div key={item.id} className="p-4 bg-[#101013] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img src={item.image} alt={item.moto} className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <h3 className="font-bold text-sm text-white">{item.moto}</h3>
                      <p className="text-xs text-zinc-400">Vendido el {item.date} a {item.buyer}</p>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 size={10} /> {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-zinc-500 block">Ganancia Neta</span>
                      <span className="text-base font-black text-white">${item.net.toLocaleString()} MXN</span>
                    </div>
                    <button
                      onClick={() => toast({ title: 'Comprobante digital', description: `Descarga de liquidación fiscal #${item.id} generada.` })}
                      className="px-3.5 py-1.5 bg-[#1b1b20] hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Recibo Fiscal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 7: PAGOS Y FACTURACIÓN ================= */}
        {activeTab === 'pagos' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Pagos y Facturación</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configura tu cuenta CLABE para recibir las liquidaciones y gestiona tus métodos de cobro.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form CLABE */}
              <div className="lg:col-span-2 p-6 bg-[#101013] border border-white/5 rounded-2xl space-y-5">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-red-brand" />
                  <h3 className="font-bold text-sm text-white">Cuenta Bancaria para Dispersión SPEI</h3>
                </div>

                <form onSubmit={handleSaveBank} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-zinc-400 font-medium block mb-1">CLABE Interbancaria (18 dígitos)</label>
                      <input
                        type="text"
                        required
                        maxLength={18}
                        value={bankForm.clabe}
                        onChange={(e) => setBankForm({ ...bankForm, clabe: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#16161c] border border-white/10 rounded-xl text-xs text-white font-mono outline-none focus:border-red-brand"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 font-medium block mb-1">Banco Receptor</label>
                      <input
                        type="text"
                        required
                        value={bankForm.bank}
                        onChange={(e) => setBankForm({ ...bankForm, bank: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#16161c] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-red-brand"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-zinc-400 font-medium block mb-1">Titular de la Cuenta</label>
                      <input
                        type="text"
                        required
                        value={bankForm.holder}
                        onChange={(e) => setBankForm({ ...bankForm, holder: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#16161c] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-red-brand"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 font-medium block mb-1">RFC con Homoclave</label>
                      <input
                        type="text"
                        required
                        value={bankForm.rfc}
                        onChange={(e) => setBankForm({ ...bankForm, rfc: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#16161c] border border-white/10 rounded-xl text-xs text-white uppercase outline-none focus:border-red-brand"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-red-brand hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                  >
                    Guardar Cuenta Bancaria
                  </button>
                </form>
              </div>

              {/* Security info */}
              <div className="p-6 bg-[#101013] border border-white/5 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <h4 className="font-bold text-sm text-white">Dispersión 100% Protegida</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Tus ganancias se transfieren de forma automática e inmediata al momento de la entrega presencial de la moto mediante el sistema SPEI certificado de Banco de México.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <span className="text-[11px] text-zinc-500 block">Soporte financiero:</span>
                  <span className="text-xs text-zinc-300 font-semibold">+52 56 4304 8865</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 8: CONFIGURACIÓN ================= */}
        {activeTab === 'configuracion' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Configuración del Vendedor</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Datos personales, canales de notificación y verificación de identidad.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                <h3 className="font-bold text-sm text-white">Datos de Contacto Oficial</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Nombre Completo:</span>
                    <span className="text-white font-semibold">{user?.name || 'Luis Ramírez'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Correo Electrónico:</span>
                    <span className="text-white font-semibold">{user?.email || 'vendedor@motoluv.mx'}</span>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-zinc-400 text-[11px] block">
                      Tus canales de contacto directo son gestionados de forma segura y confidencial por la plataforma Motoluv.
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                <h3 className="font-bold text-sm text-white">Insignias y Verificación</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-lg">
                    <span className="text-zinc-300">Identidad INE / Pasaporte:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Verificado
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-lg">
                    <span className="text-zinc-300">Validación de Cuenta Bancaria:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Activa
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= POPUP MODALS ================= */}

      {/* 1. Modal: Destacar Publicación (Con Stripe y Clip México) */}
      <BoostPublicationModal
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
        moto={selectedMotoForBoost}
        allMotos={displayMotos}
        onBoostSuccess={(motoId, plan) => {
          setMotos(prev => prev.map(m => (m.id === motoId || m === motoId) ? { ...m, is_boosted: true, boost_tier: plan.id } : m));
          setShowBoostModal(false);
        }}
      />

      {/* 2. Modal: Detalle de Inspección */}
      {showInspectionModal && selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 text-left relative shadow-2xl">
            <button
              onClick={() => setShowInspectionModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-brand/10 border border-red-brand/30 text-red-brand flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Inspección Técnica Motoluv</h3>
                <p className="text-xs text-zinc-400">{selectedInspection.moto}</p>
              </div>
            </div>

            <div className="space-y-2.5 p-3.5 bg-[#16161c] rounded-xl border border-white/5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Fecha y Hora:</span>
                <span className="text-white font-bold">{selectedInspection.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Ubicación:</span>
                <span className="text-zinc-200">{selectedInspection.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Inspector Certificado:</span>
                <span className="text-emerald-400 font-medium">{selectedInspection.inspector}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Protocolo:</span>
                <span className="text-white font-bold">{selectedInspection.protocol || 'Certificación Técnica'}</span>
              </div>
            </div>

            <div className="p-3 bg-white/[0.03] rounded-lg text-[11px] text-zinc-400">
              El dictamen se emitirá de manera digital en tu panel al concluir el peritaje técnico.
            </div>

            <button
              onClick={() => setShowInspectionModal(false)}
              className="w-full py-2.5 bg-red-brand hover:bg-red-600 text-white font-bold text-xs uppercase rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* 3. Modal: Contraoferta */}
      {counterOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 text-left relative shadow-2xl">
            <button
              onClick={() => setCounterOfferModal(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="font-bold text-base text-white">Enviar Contraoferta</h3>
              <p className="text-xs text-zinc-400">A {counterOfferModal.buyerName} por {counterOfferModal.motoModel}</p>
            </div>

            <form onSubmit={handleSendCounterOffer} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Monto propuesto (MXN)</label>
                <input
                  type="number"
                  required
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#16161c] border border-white/10 rounded-xl text-white font-bold text-sm outline-none focus:border-red-brand"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-brand hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Enviar Contraoferta
              </button>
            </form>
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

export default SellerDashboard;
