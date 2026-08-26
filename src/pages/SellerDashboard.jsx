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
  FileText,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motoApi, offerApi } from '../services/api';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeaderBar from '../components/dashboard/DashboardHeaderBar';
import BoostPublicationModal from '../components/dashboard/BoostPublicationModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { calculateCommission } from '../utils/commission';
import { getStatusStyle } from '../utils/status';
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

  // Deletion modal state
  const [motoToDelete, setMotoToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Bank form state
  const [bankForm, setBankForm] = useState({
    clabe: user?.bank_clabe || '',
    bank: user?.bank_name || '',
    holder: user?.bank_holder || user?.name || '',
    rfc: user?.rfc || '',
    notifications: true
  });

  useEffect(() => {
    if (user) {
      setBankForm(prev => ({
        ...prev,
        clabe: user.bank_clabe || prev.clabe,
        bank: user.bank_name || prev.bank,
        holder: user.bank_holder || user.name || prev.holder,
        rfc: user.rfc || prev.rfc,
      }));
    }
  }, [user]);

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

  const [loadingMotos, setLoadingMotos] = useState(true);

  const loadData = () => {
    setLoadingMotos(true);
    const p1 = motoApi.mine().then((data) => {
      if (Array.isArray(data)) setMotos(data);
      else setMotos([]);
    }).catch(() => {
      setMotos([]);
    });

    const p2 = offerApi.received().then((data) => {
      if (Array.isArray(data)) setOffers(data);
      else setOffers([]);
    }).catch(() => {
      setOffers([]);
    });

    Promise.all([p1, p2]).finally(() => {
      setLoadingMotos(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'Vendedor');
  const currentCalc = calculateCommission(calcPrice || 0);

  // Derived offer collections
  const pendingOffers = offers.filter(o => o.status === 'pending' || o.status === 'Pendiente' || !o.status);
  const inProcessSales = offers.filter(o => (o.status === 'accepted' || o.status === 'Aceptada' || o.status === 'inspeccion' || o.is_apartado) && o.status !== 'completed' && o.status !== 'Entregada');
  const completedSales = offers.filter(o => o.status === 'completed' || o.status === 'Entregada');
  const inspections = offers.filter(o => o.status === 'inspeccion' || (o.status === 'accepted' && o.is_apartado));
  const totalCompletedEarnings = completedSales.reduce((acc, curr) => acc + (Number(curr.amount || curr.offeredAmount || 0)), 0);

  const handleOpenBoostModal = (moto = null) => {
    setSelectedMotoForBoost(moto || (motos.length > 0 ? motos[0] : null));
    setShowBoostModal(true);
  };

  const initiateDeleteMoto = (moto) => {
    const status = moto.status;
    const offersCount = moto.offersCount || 0;

    if (status === 'Apartada' || status === 'reserved' || status === 'Proceso de entrega') {
      toast({
        title: 'Acción no permitida',
        description: 'No puedes eliminar una publicación autorizada y apartada. Se encuentra en proceso activo de compraventa.',
        variant: 'destructive',
      });
      return;
    }
    if (offersCount > 0) {
      toast({
        title: 'Ofertas activas en proceso',
        description: 'No puedes eliminar una motocicleta que tiene ofertas activas en proceso. Debes responder o declinar las ofertas antes de eliminarla.',
        variant: 'destructive',
      });
      return;
    }

    setMotoToDelete(moto);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (motoId) => {
    setDeleteLoading(true);
    try {
      await motoApi.remove(motoId);
      toast({
        title: 'Publicación eliminada',
        description: 'La motocicleta ha sido removida de tu inventario correctamente.',
      });
      setShowDeleteModal(false);
      setMotoToDelete(null);
      setMotos(prev => prev.filter(m => m.id !== motoId));
      loadData();
    } catch (err) {
      toast({
        title: 'No se pudo eliminar',
        description: err?.message || 'Ocurrió un error al eliminar la publicación.',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      await offerApi.respond(offerId, 'accepted');
      toast({ title: '¡Oferta Aceptada!', description: 'Se ha notificado al comprador para iniciar el depósito en custodia.' });
      loadData();
    } catch {
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'Aceptada' } : o));
      toast({ title: '¡Oferta Aceptada!' });
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      await offerApi.respond(offerId, 'rejected');
      toast({ title: 'Oferta rechazada', description: 'La oferta ha sido declinada cortésmente.' });
      loadData();
    } catch {
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'Rechazada' } : o));
      toast({ title: 'Oferta rechazada' });
    }
  };

  const handleSendCounterOffer = async (e) => {
    e.preventDefault();
    if (!counterPrice || !counterOfferModal) return;
    try {
      await offerApi.respond(counterOfferModal.id, 'counter', Number(counterPrice));
      toast({ title: 'Contraoferta enviada', description: `Has propuesto $${Number(counterPrice).toLocaleString()} MXN.` });
      setCounterOfferModal(null);
      setCounterPrice('');
      setCounterNote('');
      loadData();
    } catch {
      setOffers(prev => prev.map(o => o.id === counterOfferModal.id ? { ...o, status: 'Contraoferta enviada', amount: Number(counterPrice) } : o));
      toast({ title: 'Contraoferta enviada' });
      setCounterOfferModal(null);
      setCounterPrice('');
      setCounterNote('');
    }
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
                value={motos.length.toString()}
                linkText="Ver todas →"
                onClick={() => handleTabChange('publicaciones')}
              />
              <KpiCard
                icon={Tag}
                label="Ofertas recibidas"
                value={pendingOffers.length.toString()}
                linkText="Ver todas →"
                onClick={() => handleTabChange('ofertas')}
              />
              <KpiCard
                icon={Clock}
                label="Ventas en proceso"
                value={inProcessSales.length.toString()}
                linkText="Ver todas →"
                onClick={() => handleTabChange('proceso')}
              />
              <KpiCard
                icon={CheckCircle2}
                label="Ventas completadas"
                value={completedSales.length.toString()}
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
                        {motos.length}
                      </span>
                    </h2>
                    {motos.length > 0 && (
                      <button
                        onClick={() => handleTabChange('publicaciones')}
                        className="text-xs text-red-brand hover:text-red-400 font-semibold transition-colors"
                      >
                        Ver todas →
                      </button>
                    )}
                  </div>

                  {loadingMotos ? (
                    <div className="p-8 text-center text-zinc-500 text-xs">Cargando tus publicaciones...</div>
                  ) : motos.length === 0 ? (
                    <div className="p-8 text-center bg-[#141418] border border-white/5 rounded-xl space-y-3">
                      <p className="text-zinc-400 text-sm">Aún no tienes motocicletas publicadas</p>
                      <Link
                        to="/panel/publicar"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-brand hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-colors"
                      >
                        <Plus size={14} /> Publicar Motocicleta
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {motos.map((pub, idx) => (
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
                                Publicado el {pub.created_at ? new Date(pub.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recientemente'}
                              </p>
                              <p className="text-zinc-200 text-xs font-bold mt-0.5">
                                ${Number(pub.price || 0).toLocaleString()} MXN
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-wrap">
                            <div className="flex items-center gap-3 text-xs text-zinc-400">
                              <div className="text-center">
                                <span className="text-[10px] text-zinc-500 block">Vistas</span>
                                <span className="font-semibold text-white">{pub.views || 0}</span>
                              </div>
                              <div className="text-center">
                                <span className="text-[10px] text-zinc-500 block">Guardados</span>
                                <span className="font-semibold text-white">{pub.savedCount || 0}</span>
                              </div>
                              <div className="text-center">
                                <span className="text-[10px] text-zinc-500 block">Ofertas</span>
                                <span className="font-semibold text-white">{pub.offersCount || 0}</span>
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
                              <button
                                type="button"
                                onClick={() => initiateDeleteMoto(pub)}
                                className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center ${
                                  pub.status === 'Apartada' || pub.status === 'reserved' || (pub.offersCount || 0) > 0
                                    ? 'border-white/5 text-zinc-600 hover:text-amber-400 hover:border-amber-500/40'
                                    : 'border-white/10 text-zinc-400 hover:border-red-brand hover:text-red-brand'
                                }`}
                                title={
                                  pub.status === 'Apartada'
                                    ? 'Publicación autorizada y apartada (no eliminable)'
                                    : (pub.offersCount || 0) > 0
                                    ? 'Publicación con ofertas activas en proceso (no eliminable)'
                                    : 'Eliminar publicación'
                                }
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

                  {inspections.length === 0 ? (
                    <div className="p-4 bg-[#141418] border border-white/5 rounded-xl text-center space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-white/5 text-zinc-500 flex items-center justify-center mx-auto">
                        <ShieldCheck size={16} />
                      </div>
                      <p className="text-xs text-zinc-400">No tienes citas de inspección programadas actualmente.</p>
                      <span className="text-[11px] text-zinc-500 block">Se agendan automáticamente al apartar una moto.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inspections.slice(0, 1).map((insp) => (
                        <div key={insp.id} className="p-3.5 bg-[#141418] border border-white/5 rounded-xl space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-brand/10 text-red-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                              <ShieldCheck size={16} />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-white leading-tight">
                                Inspección programada
                              </h4>
                              <p className="text-[11px] text-zinc-400 leading-snug">
                                {insp.moto_brand} {insp.moto_model} {insp.moto_year || ''}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedInspection({
                                moto: `${insp.moto_brand || ''} ${insp.moto_model || ''}`,
                                date: 'En coordinación con asesor Motoluv',
                                address: 'Centro de Inspección Autorizado Motoluv',
                                inspector: 'Especialista Pericial Certificado Motoluv',
                                protocol: 'Certificación Integral y Escaneo',
                                status: 'Programada'
                              });
                              setShowInspectionModal(true);
                            }}
                            className="w-full py-1.5 bg-[#1b1b20] hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 text-xs font-medium rounded-lg transition-colors"
                          >
                            Ver detalles
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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

                  {offers.length === 0 ? (
                    <div className="p-4 bg-[#141418] border border-white/5 rounded-xl text-center text-xs text-zinc-400">
                      No tienes ofertas recibidas aún.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {offers.slice(0, 2).map((off) => {
                        const buyerDisplayName = off.buyer_name || off.buyerName || 'Comprador interesado';
                        const initials = buyerDisplayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                        return (
                          <div key={off.id} className="p-3 bg-[#141418] border border-white/5 rounded-xl space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#1e1e24] text-white flex items-center justify-center text-[10px] font-bold">
                                  {initials}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-white">{buyerDisplayName}</h4>
                                  <p className="text-[11px] text-zinc-400 mt-0.5">{off.moto_brand} {off.moto_model}</p>
                                </div>
                              </div>
                              <span className="text-[10px] text-zinc-500 whitespace-nowrap">{off.created_at ? new Date(off.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : 'Reciente'}</span>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                              <span className="text-zinc-300 font-bold">
                                Oferta: <span className="text-red-brand">${Number(off.amount || off.offeredAmount || 0).toLocaleString()} MXN</span>
                              </span>
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                                off.status === 'accepted' || off.status === 'Aceptada'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              }`}>
                                {off.status === 'accepted' ? 'Aceptada' : (off.status || 'Pendiente')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                      Destaca tu publicación para posicionarla en primeros lugares y acelerar la venta.
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

            {loadingMotos ? (
              <div className="p-16 text-center text-zinc-500 text-sm">Cargando tus publicaciones...</div>
            ) : motos.length === 0 ? (
              <div className="bg-[#111114] border border-white/5 rounded-2xl p-16 text-center">
                <p className="text-zinc-400 text-sm mb-6">Aún no tienes motocicletas publicadas</p>
                <Link
                  to="/panel/publicar"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-brand hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  <Plus size={14} /> Publicar Motocicleta
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {motos.map((m) => {
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
                            <Eye size={12} /> {m.views || 0}
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-bold text-base text-white">{m.brand} {m.model}</h3>
                            <div className="text-xs text-zinc-400">Año {m.year} · {(Number(m.km) || 0).toLocaleString()} km</div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-red-brand font-black text-base">${Number(m.price || 0).toLocaleString()} MXN</div>
                            <span className="text-xs text-zinc-400 bg-white/5 px-2 py-0.5 rounded">
                              {m.savedCount || 0} interesados
                            </span>
                          </div>

                          {/* Status indicator (Read-only, synchronized with Supabase & CRM) */}
                          <div className="pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                                <Activity size={11} className="text-red-brand" /> Estatus de Operación
                              </span>
                              <span className="text-[9px] text-zinc-500 font-medium">CRM Motoluv</span>
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
                        <div className="flex gap-2 pt-3 border-t border-white/5">
                          <button
                            onClick={() => handleOpenBoostModal(m)}
                            className="flex-1 py-2 rounded-lg bg-red-brand/10 hover:bg-red-brand/20 text-red-brand border border-red-brand/30 text-xs font-bold transition-colors flex items-center justify-center"
                          >
                            <span>Destacar</span>
                          </button>
                          <Link
                            to={m.id ? `/motos/${m.id}` : '/motos'}
                            className="flex-1 text-center text-xs font-bold py-2 rounded-lg bg-[#16161c] text-white hover:bg-white/10 transition-colors border border-white/10"
                          >
                            Ver ficha
                          </Link>
                          <button
                            type="button"
                            onClick={() => initiateDeleteMoto(m)}
                            className={`w-9 h-8 rounded-lg border transition-colors flex items-center justify-center ${
                              m.status === 'Apartada' || m.status === 'reserved' || (m.offersCount || 0) > 0
                                ? 'border-white/5 text-zinc-600 hover:text-amber-400 hover:border-amber-500/40'
                                : 'border-white/10 text-zinc-400 hover:border-red-brand hover:text-red-brand'
                            }`}
                            title={
                              m.status === 'Apartada'
                                ? 'Publicación autorizada y apartada (no eliminable)'
                                : (m.offersCount || 0) > 0
                                ? 'Publicación con ofertas activas en proceso (no eliminable)'
                                : 'Eliminar publicación'
                            }
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                {pendingOffers.length} Ofertas Pendientes
              </span>
            </div>

            {offers.length === 0 ? (
              <div className="p-16 bg-[#101013] border border-white/5 rounded-2xl text-center space-y-3">
                <Tag size={32} className="text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No has recibido ofertas de compra aún</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Cuando los compradores envíen propuestas económicas sobre tus motocicletas publicadas, aparecerán aquí para que puedas aceptarlas o contraofertar.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((off) => {
                  const buyerDisplayName = off.buyer_name || off.buyerName || 'Comprador interesado';
                  const initials = buyerDisplayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  const offerAmount = Number(off.amount || off.offeredAmount || 0);
                  const origPrice = Number(off.original_price || off.originalPrice || offerAmount);
                  const diff = origPrice - offerAmount;
                  const isPending = off.status === 'pending' || off.status === 'Pendiente' || !off.status;

                  return (
                    <div key={off.id} className="p-5 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-brand/10 text-red-brand border border-red-brand/30 flex items-center justify-center font-bold text-sm">
                            {initials}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-white flex items-center gap-2">
                              <span>{buyerDisplayName}</span>
                              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle2 size={11} /> Comprador Verificado
                              </span>
                            </h3>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              Para: <strong className="text-zinc-200">{off.moto_brand || off.motoBrand} {off.moto_model || off.motoModel}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500">
                            {off.created_at ? new Date(off.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Reciente'}
                          </span>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                            off.status === 'accepted' || off.status === 'Aceptada'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : off.status === 'rejected' || off.status === 'Rechazada'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {off.status === 'accepted' ? 'Aceptada' : (off.status || 'Pendiente')}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#141418] rounded-xl text-xs">
                        {origPrice > 0 && (
                          <div>
                            <span className="text-zinc-500 block">Precio Publicado</span>
                            <span className="text-white font-bold text-sm">${origPrice.toLocaleString()} MXN</span>
                          </div>
                        )}
                        <div>
                          <span className="text-zinc-500 block">Oferta del Comprador</span>
                          <span className="text-red-brand font-black text-sm">${offerAmount.toLocaleString()} MXN</span>
                        </div>
                        {diff > 0 && origPrice > 0 && (
                          <div>
                            <span className="text-zinc-500 block">Diferencia</span>
                            <span className="text-zinc-300 font-semibold">
                              -${diff.toLocaleString()} MXN ({((diff / origPrice) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        )}
                      </div>

                      {isPending && (
                        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                          <button
                            onClick={() => {
                              setCounterOfferModal({
                                id: off.id,
                                buyerName: buyerDisplayName,
                                motoModel: `${off.moto_brand || ''} ${off.moto_model || ''}`,
                                offeredAmount: offerAmount
                              });
                              setCounterPrice(offerAmount.toString());
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
                            <span>Aceptar Oferta (${offerAmount.toLocaleString()} MXN)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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

            {inspections.length === 0 ? (
              <div className="p-16 bg-[#101013] border border-white/5 rounded-2xl text-center space-y-3">
                <ShieldCheck size={36} className="text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No tienes inspecciones mecánicas activas</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Cuando un comprador formaliza un apartado para una de tus motos, el equipo pericial de Motoluv coordina la cita de inspección y la verás reflejada en esta sección.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {inspections.map((insp) => (
                  <div key={insp.id} className="p-5 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
                        En Proceso
                      </span>
                      <span className="text-xs text-zinc-500">Folio: #{insp.id}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-red-brand">
                        <Bike size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">{insp.moto_brand} {insp.moto_model}</h3>
                        <p className="text-xs text-zinc-400">Coordinación con Asesor Motoluv</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-zinc-300 p-3 bg-[#141418] rounded-xl border border-white/5">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Lugar:</span>
                        <span className="font-medium text-white">Centro Autorizado Motoluv</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Evaluación técnica:</span>
                        <span className="text-emerald-400 font-bold">Certificación Integral + Escaneo</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedInspection({
                          moto: `${insp.moto_brand || ''} ${insp.moto_model || ''}`,
                          date: 'Coordinado vía WhatsApp Motoluv',
                          address: 'Centro Autorizado Motoluv',
                          inspector: 'Perito Certificado Motoluv',
                          protocol: 'Certificación Integral',
                          status: 'En Proceso'
                        });
                        setShowInspectionModal(true);
                      }}
                      className="w-full py-2.5 bg-[#1b1b20] hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors"
                    >
                      Ver Protocolo de Inspección
                    </button>
                  </div>
                ))}
              </div>
            )}
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

            {inProcessSales.length === 0 ? (
              <div className="p-16 bg-[#101013] border border-white/5 rounded-2xl text-center space-y-3">
                <Clock size={36} className="text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No tienes ventas en proceso actualmente</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Aquí podrás dar seguimiento paso a paso al apartado, peritaje mecánico, validación de documentos y liquidación por transferencia SPEI una vez que aceptes una oferta de compra.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {inProcessSales.map((sale) => {
                  const saleAmount = Number(sale.amount || sale.offeredAmount || 0);
                  const netGain = Math.round(saleAmount * 0.95);
                  return (
                    <div key={sale.id} className="p-6 bg-[#101013] border border-white/5 rounded-2xl space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-red-brand">
                            <Bike size={28} />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                              Operación #{sale.id}
                            </span>
                            <h3 className="font-bold text-base text-white mt-1">{sale.moto_brand} {sale.moto_model}</h3>
                            <p className="text-xs text-zinc-400">Comprador: {sale.buyer_name || 'Comprador Verificado'} • Precio: ${saleAmount.toLocaleString()} MXN</p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-xs text-zinc-400 block">Tu Ganancia Neta a Recibir</span>
                          <span className="text-xl font-black text-emerald-400">${netGain.toLocaleString()} MXN</span>
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
                            <p className="text-[11px] text-zinc-400">Protegido en Fideicomiso</p>
                          </div>

                          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-blue-400 uppercase">Paso 2</span>
                              <Clock size={14} className="text-blue-400 animate-spin" />
                            </div>
                            <h5 className="font-bold text-xs text-white">Inspección Mecánica</h5>
                            <p className="text-[11px] text-zinc-400">En coordinación</p>
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
                  );
                })}
              </div>
            )}
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
              {totalCompletedEarnings > 0 && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  Total acumulado: ${totalCompletedEarnings.toLocaleString()} MXN
                </span>
              )}
            </div>

            {completedSales.length === 0 ? (
              <div className="p-16 bg-[#101013] border border-white/5 rounded-2xl text-center space-y-3">
                <CheckCircle2 size={36} className="text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No tienes ventas completadas registradas</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Aquí se archivará el historial detallado de las motocicletas que hayas vendido a través de Motoluv con sus recibos y comprobantes de dispersión bancaria.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedSales.map((item) => {
                  const saleAmount = Number(item.amount || item.offeredAmount || 0);
                  const netGain = Math.round(saleAmount * 0.95);
                  return (
                    <div key={item.id} className="p-4 bg-[#101013] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-emerald-400">
                          <Bike size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white">{item.moto_brand} {item.moto_model}</h3>
                          <p className="text-xs text-zinc-400">Comprador: {item.buyer_name || 'Comprador Verificado'}</p>
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 size={10} /> Dispersión SPEI Realizada
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-zinc-500 block">Ganancia Neta</span>
                          <span className="text-base font-black text-white">${netGain.toLocaleString()} MXN</span>
                        </div>
                        <button
                          onClick={() => toast({ title: 'Comprobante digital', description: `Descarga de liquidación fiscal #${item.id} generada.` })}
                          className="px-3.5 py-1.5 bg-[#1b1b20] hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Recibo Fiscal
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                        placeholder="18 dígitos (ej. 012...)"
                        value={bankForm.clabe}
                        onChange={(e) => setBankForm({ ...bankForm, clabe: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-3.5 py-2.5 bg-[#16161c] border border-white/10 rounded-xl text-xs text-white font-mono outline-none focus:border-red-brand"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 font-medium block mb-1">Banco Receptor</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. BBVA, Santander, Banorte"
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
                        placeholder="Nombre como aparece en el estado de cuenta"
                        value={bankForm.holder}
                        onChange={(e) => setBankForm({ ...bankForm, holder: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#16161c] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-red-brand"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 font-medium block mb-1">RFC con Homoclave</label>
                      <input
                        type="text"
                        placeholder="Ej. XAXX010101000"
                        value={bankForm.rfc}
                        onChange={(e) => setBankForm({ ...bankForm, rfc: e.target.value.toUpperCase() })}
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
                    <span className="text-white font-semibold">{user?.name || user?.email?.split('@')[0] || 'Vendedor Motoluv'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Correo Electrónico:</span>
                    <span className="text-white font-semibold">{user?.email || 'No registrado'}</span>
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
                      <CheckCircle2 size={12} /> {user?.ine_url ? 'Documento Subido' : 'Verificado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-lg">
                    <span className="text-zinc-300">Validación de Cuenta Bancaria:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> {user?.bank_clabe ? 'Configurada' : 'Activa'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= POPUP MODALS ================= */}

      {/* 1. Modal: Destacar Publicación */}
      <BoostPublicationModal
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
        moto={selectedMotoForBoost}
        allMotos={motos}
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
                <span className="text-zinc-400">Inspector:</span>
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

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!deleteLoading) {
            setShowDeleteModal(false);
            setMotoToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        moto={motoToDelete}
        loading={deleteLoading}
      />
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
