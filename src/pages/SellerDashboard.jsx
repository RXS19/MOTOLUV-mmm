import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bike,
  Tag,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Plus,
  X,
  Calculator,
  Activity,
  CreditCard,
  Building2,
  Check,
  Trash2,
  BookmarkCheck,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motoApi, offerApi, apartadoApi } from '../services/api';
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
  const [apartados, setApartados] = useState([]);
  const [calcPrice, setCalcPrice] = useState(95000);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [selectedMotoForBoost, setSelectedMotoForBoost] = useState(null);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [loading, setLoading] = useState(true);

  // Deletion modal state
  const [motoToDelete, setMotoToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Offer rejection modal state
  const [offerToReject, setOfferToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Bank form state
  const [bankForm, setBankForm] = useState({
    clabe: user?.bank_clabe || '',
    bank: user?.bank_name || '',
    holder: user?.bank_holder || user?.name || '',
    rfc: user?.rfc || '',
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

  const loadData = () => {
    setLoading(true);
    const p1 = motoApi.mine().then((data) => {
      if (Array.isArray(data)) setMotos(data);
      else setMotos([]);
    }).catch(() => setMotos([]));

    const p2 = offerApi.received().then((data) => {
      if (Array.isArray(data)) setOffers(data);
      else setOffers([]);
    }).catch(() => setOffers([]));

    const p3 = apartadoApi.received().then((data) => {
      if (Array.isArray(data)) setApartados(data);
      else setApartados([]);
    }).catch(() => setApartados([]));

    Promise.all([p1, p2, p3]).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'Vendedor');
  const currentCalc = calculateCommission(calcPrice || 0);

  const pendingOffers = offers.filter(o => o.status === 'ENVIADA' || o.status === 'PENDIENTE' || o.status === 'pending' || !o.status);
  const acceptedOffers = offers.filter(o => o.status === 'ACEPTADA' || o.status === 'accepted');
  const activeApartados = apartados.filter(a => a.status === 'REALIZADO');
  const inspections = apartados.filter(a => a.certification_status || a.certification_appointment_at);

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
        description: 'No puedes eliminar una publicación autorizada y apartada. Se encuentra en proceso activo.',
        variant: 'destructive',
      });
      return;
    }
    if (offersCount > 0) {
      toast({
        title: 'Ofertas activas en proceso',
        description: 'No puedes eliminar una motocicleta que tiene ofertas activas.',
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
        description: 'La motocicleta ha sido removida de tu inventario.',
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
      await offerApi.respond(offerId, 'ACEPTADA');
      toast({ title: '¡Oferta Aceptada!', description: 'Se ha notificado la aceptación de la oferta.' });
      loadData();
    } catch {
      toast({ title: 'Error al actualizar', description: 'No se pudo procesar la respuesta.', variant: 'destructive' });
    }
  };

  const handleOpenRejectModal = (offer) => {
    setOfferToReject(offer);
    setRejectionReason('');
    setRejectionError('');
  };

  const handleCloseRejectModal = () => {
    if (!rejectLoading) {
      setOfferToReject(null);
      setRejectionReason('');
      setRejectionError('');
    }
  };

  const handleConfirmRejectOffer = async (e) => {
    if (e) e.preventDefault();
    const reasonTrimmed = rejectionReason.trim();
    if (!reasonTrimmed) {
      setRejectionError('El motivo de rechazo es obligatorio.');
      return;
    }
    if (!offerToReject?.id) return;

    setRejectLoading(true);
    try {
      await offerApi.respond(offerToReject.id, 'RECHAZADA', reasonTrimmed);
      toast({
        title: 'Oferta rechazada',
        description: 'La oferta ha sido declinada con el motivo capturado.',
      });
      handleCloseRejectModal();
      loadData();
    } catch {
      toast({
        title: 'Error al actualizar',
        description: 'No se pudo procesar la respuesta.',
        variant: 'destructive',
      });
    } finally {
      setRejectLoading(false);
    }
  };

  const handleSaveBank = (e) => {
    e.preventDefault();
    toast({ title: 'Cuenta bancaria guardada', description: 'Tus liquidaciones se transferirán a la CLABE registrada.' });
  };

  const getOfferBadge = (st) => {
    const s = (st || '').toUpperCase();
    switch (s) {
      case 'ACEPTADA':
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Aceptada</span>;
      case 'RECHAZADA':
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Rechazada</span>;
      case 'EXPIRADA':
      case 'EXPIRED':
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">Expirada</span>;
      case 'ENVIADA':
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Enviada</span>;
      case 'PENDIENTE':
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Pendiente</span>;
    }
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
                  Administra tus publicaciones y ofertas en Motoluv.
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
                value={offers.length.toString()}
                linkText="Ver todas →"
                onClick={() => handleTabChange('ofertas')}
              />
              <KpiCard
                icon={BookmarkCheck}
                label="Apartados recibidos"
                value={activeApartados.length.toString()}
                linkText="Ver todos →"
                onClick={() => handleTabChange('apartados')}
              />
              <KpiCard
                icon={ShieldCheck}
                label="Inspecciones técnicas"
                value={inspections.length.toString()}
                linkText="Ver todas →"
                onClick={() => handleTabChange('inspecciones')}
              />
            </div>

            {/* 2-Column Main Dashboard Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Center Column */}
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

                  {loading ? (
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
                      {motos.slice(0, 3).map((pub, idx) => (
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
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-white text-sm font-bold truncate flex items-center gap-1.5">
                                <span>{pub.brand} {pub.model} {pub.year}</span>
                              </h3>
                              <p className="text-zinc-200 text-xs font-bold mt-0.5">
                                ${Number(pub.price || 0).toLocaleString()} MXN
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
                            <Link
                              to={pub.id ? `/motos/${pub.id}` : '/motos'}
                              className="px-3 py-1.5 bg-[#1b1b20] hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                            >
                              Ver publicación
                            </Link>
                            <button
                              type="button"
                              onClick={() => initiateDeleteMoto(pub)}
                              className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:border-red-brand hover:text-red-brand transition-colors"
                              title="Eliminar publicación"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Simulator */}
                <div className="bg-[#101013] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Calculator size={18} className="text-red-brand" />
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        Simulador de Ganancia Neta
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Precio estimado (MXN)</label>
                      <input
                        type="number"
                        value={calcPrice}
                        onChange={(e) => setCalcPrice(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3.5 py-2.5 bg-[#16161c] border border-white/10 rounded-xl text-white font-bold text-sm outline-none focus:border-red-brand"
                      />
                    </div>
                    <div className="p-3 bg-[#16161c] rounded-xl border border-white/5 flex justify-between items-center">
                      <div>
                        <span className="text-[11px] text-zinc-500 block">Recibirás neto aprox.</span>
                        <span className="text-lg font-black text-emerald-400">
                          ${Number(currentCalc?.netEarnings ?? currentCalc?.netAmount ?? 0).toLocaleString()} MXN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Ofertas recientes */}
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
                      {offers.slice(0, 3).map((off) => (
                        <div key={off.id} className="p-3 bg-[#141418] border border-white/5 rounded-xl space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-white">{off.moto_brand} {off.moto_model}</h4>
                              <span className="text-[10px] text-zinc-500">Monto: ${Number(off.amount || 0).toLocaleString()} MXN</span>
                            </div>
                            {getOfferBadge(off.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  Gestiona tus motocicletas activas en el catálogo.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Link
                  to="/panel/publicar"
                  className="px-4 py-2 bg-red-brand hover:bg-red-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow"
                >
                  <Plus size={14} />
                  <span>Nueva Moto</span>
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="p-16 text-center text-zinc-500 text-sm">Cargando publicaciones...</div>
            ) : motos.length === 0 ? (
              <div className="bg-[#111114] border border-white/5 rounded-2xl p-16 text-center space-y-4">
                <p className="text-zinc-400 text-sm">Aún no tienes motocicletas publicadas</p>
                <Link
                  to="/panel/publicar"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-brand hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow"
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
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-bold text-base text-white">{m.brand} {m.model}</h3>
                            <div className="text-xs text-zinc-400">Año {m.year} · {(Number(m.km) || 0).toLocaleString()} km</div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-red-brand font-black text-base">${Number(m.price || 0).toLocaleString()} MXN</div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${style.badgeClass}`}>
                              {style.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0 space-y-2">
                        <div className="flex gap-2 pt-3 border-t border-white/5">
                          <Link
                            to={m.id ? `/motos/${m.id}` : '/motos'}
                            className="flex-1 text-center text-xs font-bold py-2 rounded-lg bg-[#16161c] text-white hover:bg-white/10 transition-colors border border-white/10"
                          >
                            Ver publicación
                          </Link>
                          <button
                            type="button"
                            onClick={() => initiateDeleteMoto(m)}
                            className="w-9 h-8 rounded-lg border border-white/10 text-zinc-400 hover:border-red-brand hover:text-red-brand transition-colors flex items-center justify-center"
                            title="Eliminar publicación"
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
                  Aún no tienes actividad.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((off) => {
                  const offerAmount = Number(off.amount || 0);
                  const isPending = off.status === 'ENVIADA' || off.status === 'PENDIENTE' || off.status === 'pending' || !off.status;

                  return (
                    <div key={off.id} className="p-5 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                        <div>
                          <h3 className="font-bold text-base text-white">
                            {off.moto_brand} {off.moto_model} {off.moto_year || ''}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Fecha: {off.created_at ? new Date(off.created_at).toLocaleDateString('es-MX') : 'Reciente'}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {getOfferBadge(off.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#141418] rounded-xl text-xs">
                        <div>
                          <span className="text-zinc-500 block">Monto Ofertado</span>
                          <span className="text-red-brand font-black text-sm">${offerAmount.toLocaleString()} MXN</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Estado de la Oferta</span>
                          <span className="text-zinc-200 font-semibold uppercase">{off.status || 'PENDIENTE'}</span>
                        </div>
                      </div>

                      {off.package && (
                        <div className="text-xs text-zinc-400">
                          Paquete de protección: <span className="text-zinc-200 uppercase font-semibold">{off.package}</span>
                        </div>
                      )}

                      {off.status === 'RECHAZADA' && off.message && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs space-y-1">
                          <span className="text-red-400 font-bold block">Motivo de rechazo registrado:</span>
                          <p className="text-zinc-300">{off.message}</p>
                        </div>
                      )}

                      {isPending && (
                        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                          <button
                            onClick={() => handleOpenRejectModal(off)}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition-colors"
                          >
                            Rechazar
                          </button>
                          <button
                            onClick={() => handleAcceptOffer(off.id)}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow flex items-center gap-1.5"
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

        {/* ================= TAB: APARTADOS RECIBIDOS ================= */}
        {activeTab === 'apartados' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Apartados Recibidos</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Registros de motocicletas apartadas en custodia por compradores.
              </p>
            </div>

            {apartados.length === 0 ? (
              <div className="p-16 bg-[#101013] border border-white/5 rounded-2xl text-center space-y-3">
                <BookmarkCheck size={32} className="text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-white">Aún no tienes actividad.</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Cuando un comprador aparte una de tus motocicletas, aparecerá en esta sección.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {apartados.map((ap) => (
                  <div key={ap.id} className="p-5 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                      <div>
                        <h3 className="font-bold text-base text-white">
                          {ap.moto_brand} {ap.moto_model} {ap.moto_year || ''}
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Fecha: {ap.created_at ? new Date(ap.created_at).toLocaleDateString('es-MX') : 'Reciente'}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {ap.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#141418] rounded-xl text-xs">
                      <div>
                        <span className="text-zinc-500 block">Dictamen de Certificación</span>
                        <span className="text-white font-bold text-sm uppercase">{ap.certification_status || 'PENDIENTE'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Cita de Inspección</span>
                        <span className="text-zinc-200 font-semibold">
                          {ap.certification_appointment_at ? new Date(ap.certification_appointment_at).toLocaleString('es-MX') : 'Por programar'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Estado de Cita</span>
                        <span className="text-zinc-200 font-semibold">{ap.certification_appointment_status || 'Pendiente'}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
                  Control de peritajes técnicos certificados asociados a tus apartados.
                </p>
              </div>
            </div>

            {inspections.length === 0 ? (
              <div className="p-16 bg-[#101013] border border-white/5 rounded-2xl text-center space-y-3">
                <ShieldCheck size={36} className="text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-white">Aún no tienes actividad.</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Cuando un comprador formalice un apartado para una de tus motos, el peritaje técnico se reflejará aquí.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {inspections.map((insp) => (
                  <div key={insp.id} className="p-5 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase">
                        {insp.certification_status || 'PENDIENTE'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-red-brand">
                        <Bike size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">{insp.moto_brand} {insp.moto_model}</h3>
                        <p className="text-xs text-zinc-400">Inspección de Apartado</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-zinc-300 p-3 bg-[#141418] rounded-xl border border-white/5">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Cita:</span>
                        <span className="font-medium text-white">
                          {insp.certification_appointment_at ? new Date(insp.certification_appointment_at).toLocaleString('es-MX') : 'Por programar'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Dictamen:</span>
                        <span className="text-emerald-400 font-bold uppercase">{insp.certification_status || 'PENDIENTE'}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
                Configura tu cuenta CLABE para recibir las liquidaciones.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        placeholder="18 dígitos"
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

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-red-brand hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                  >
                    Guardar Cuenta Bancaria
                  </button>
                </form>
              </div>

              <div className="p-6 bg-[#101013] border border-white/5 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <h4 className="font-bold text-sm text-white">Dispersión Protegida</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Tus pagos se transfieren al momento de la entrega de la motocicleta.
                  </p>
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
                Datos de tu cuenta de vendedor.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 bg-[#101013] border border-white/5 rounded-2xl space-y-4">
                <h3 className="font-bold text-sm text-white">Datos de Contacto</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Nombre Completo:</span>
                    <span className="text-white font-semibold">{user?.name || user?.email?.split('@')[0] || 'Vendedor'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Correo Electrónico:</span>
                    <span className="text-white font-semibold">{user?.email || 'No registrado'}</span>
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

      {/* Modal: Captura Obligatoria de Motivo de Rechazo de Oferta */}
      {offerToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 text-left relative shadow-2xl">
            <button
              onClick={handleCloseRejectModal}
              disabled={rejectLoading}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white disabled:opacity-50"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Rechazar Oferta</h3>
                <p className="text-xs text-zinc-400">
                  {offerToReject.moto_brand || offerToReject.motoBrand} {offerToReject.moto_model || offerToReject.motoModel} • ${Number(offerToReject.amount || offerToReject.offeredAmount || 0).toLocaleString()} MXN
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              Indica al comprador el motivo por el cual no puedes aceptar esta oferta. Este campo es <strong className="text-white">obligatorio</strong>.
            </p>

            <form onSubmit={handleConfirmRejectOffer} className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-400 uppercase tracking-wider block mb-1.5 font-bold">
                  Motivo de rechazo *
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (rejectionError) setRejectionError('');
                  }}
                  placeholder="Ej. El precio ofrecido está por debajo de mi margen mínimo actual..."
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-white/15 focus:border-red-500 text-white text-xs rounded-xl outline-none resize-none transition-colors"
                  disabled={rejectLoading}
                  autoFocus
                />
                {rejectionError && (
                  <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {rejectionError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCloseRejectModal}
                  disabled={rejectLoading}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={rejectLoading || !rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow"
                >
                  {rejectLoading ? 'Rechazando...' : 'Confirmar Rechazo'}
                </button>
              </div>
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
