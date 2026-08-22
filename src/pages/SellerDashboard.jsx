import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motoApi, offerApi } from '../services/api';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeaderBar from '../components/dashboard/DashboardHeaderBar';
import { calculateCommission } from '../utils/commission';
import { OPERATION_STATUSES, getStatusStyle } from '../utils/status';
import { resolveSafeImageUrl, handleImageError } from '../utils/imageFallback';
import { toast } from '../hooks/use-toast';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');
  const [motos, setMotos] = useState([]);
  const [offers, setOffers] = useState([]);
  const [calcPrice, setCalcPrice] = useState(95000);
  const [showToolsTab, setShowToolsTab] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);

  // Sample default publications matching reference design
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
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80',
    },
  ];

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
      toast({ title: 'Error', description: 'No se pudo cambiar el estatus de la operación.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#080809] text-zinc-100 flex flex-col lg:flex-row">
      {/* Left Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mode="vendedor"
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Header Bar */}
        <DashboardHeaderBar mode="vendedor" />

        {/* Greeting Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Hola, {firstName}</span>
              <span className="text-2xl">👋</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Administra tus publicaciones y ventas en Motoluv.
            </p>
          </div>
        </div>

        {/* 4 KPI Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <KpiCard
            icon={Bike}
            label="Publicaciones activas"
            value="3"
            linkText="Ver todas →"
            onClick={() => setActiveTab('publicaciones')}
          />
          <KpiCard
            icon={Tag}
            label="Ofertas recibidas"
            value="2"
            linkText="Ver todas →"
            onClick={() => setActiveTab('ofertas')}
          />
          <KpiCard
            icon={Clock}
            label="Ventas en proceso"
            value="1"
            linkText="Ver todas →"
            onClick={() => setActiveTab('proceso')}
          />
          <KpiCard
            icon={CheckCircle2}
            label="Ventas completadas"
            value="4"
            linkText="Ver todas →"
            onClick={() => setActiveTab('completadas')}
          />
        </div>

        {/* 2-Column Main Dashboard Layout: Center List + Right Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Center Column (2 cols width on XL) */}
          <div className="xl:col-span-2 space-y-6">
            {/* Section: Mis publicaciones */}
            <div className="bg-[#101013] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Mis publicaciones
                </h2>
                <Link
                  to="/panel/mis-motos"
                  className="text-xs text-red-brand hover:text-red-400 font-semibold transition-colors"
                >
                  Ver todas →
                </Link>
              </div>

              <div className="space-y-3">
                {displayMotos.map((pub, idx) => (
                  <div
                    key={pub.id || idx}
                    className="p-3.5 sm:p-4 bg-[#141418] border border-white/5 hover:border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={resolveSafeImageUrl(pub.image, 'moto')}
                        alt={`${pub.brand} ${pub.model}`}
                        onError={(e) => handleImageError(e, 'moto')}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg bg-black/40 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-white text-sm font-bold truncate">
                          {pub.brand} {pub.model} {pub.year}
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

                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {pub.status || 'Activa'}
                      </span>

                      <div className="flex items-center gap-2">
                        <Link
                          to={pub.id ? `/motos/${pub.id}` : '/motos'}
                          className="px-3.5 py-1.5 bg-[#1b1b20] hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                        >
                          Ver publicación
                        </Link>
                        <button
                          onClick={() => setShowToolsTab(!showToolsTab)}
                          className="p-1.5 text-zinc-400 hover:text-white bg-[#1b1b20] hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                          title="Opciones"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collapsible Section: Calculadora y Estatus de Operaciones */}
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
                    <span className="text-zinc-500 text-[10px] uppercase block">Comisión</span>
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
                  onClick={() => setShowInspectionModal(true)}
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
                      Tu moto Yamaha MT-07 2021 será inspeccionada el 20 May 2025 a las 11:00 AM.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInspectionModal(true)}
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
                <Link
                  to="/panel/mis-ofertas"
                  className="text-xs text-red-brand hover:text-red-400 font-semibold transition-colors"
                >
                  Ver todas
                </Link>
              </div>

              <div className="space-y-3">
                {/* Offer 1 */}
                <div className="p-3 bg-[#141418] border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#1e1e24] text-white flex items-center justify-center text-[10px] font-bold">
                        PC
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Pedro Contreras</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Yamaha MT-07 2021
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 whitespace-nowrap">Hace 1h</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                    <span className="text-zinc-300 font-bold">
                      Oferta: <span className="text-red-brand">$123,000 MXN</span>
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                      Pendiente
                    </span>
                  </div>
                </div>

                {/* Offer 2 */}
                <div className="p-3 bg-[#141418] border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#1e1e24] text-white flex items-center justify-center text-[10px] font-bold">
                        AM
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Andrés Molina</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          KTM Duke 390 2022
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 whitespace-nowrap">Hace 3h</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                    <span className="text-zinc-300 font-bold">
                      Oferta: <span className="text-red-brand">$92,500 MXN</span>
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                      Pendiente
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 3: Promo Banner ¿Necesitas vender más rápido? */}
            <div className="bg-[#101013] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[190px]">
              {/* Background Bike overlay */}
              <div
                className="absolute right-0 top-0 bottom-0 w-1/2 opacity-35 pointer-events-none bg-contain bg-right bg-no-repeat"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80')`,
                }}
              />
              <div className="relative z-10 space-y-3 max-w-[210px]">
                <h3 className="text-base font-bold text-white leading-tight">
                  ¿Necesitas vender más rápido?
                </h3>
                <p className="text-xs text-zinc-400 leading-snug">
                  Destaca tu publicación y llega a más compradores certificados.
                </p>
                <button
                  onClick={() => setShowBoostModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b1b20] hover:bg-white/10 text-white font-semibold text-xs rounded-lg border border-white/10 transition-colors"
                >
                  <span>Destacar mi publicación</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Destacar Publicación */}
      {showBoostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 text-left relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowBoostModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-brand/10 border border-red-brand/20 text-red-brand flex items-center justify-center">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Destacar Publicación</h3>
                <p className="text-xs text-zinc-400">Multiplica las visitas y ofertas por 4x</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Plan Destacado 7 Días</div>
                  <div className="text-[11px] text-zinc-400">Primer lugar en catálogo y banner principal</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-brand">$399 MXN</div>
                </div>
              </div>

              <div className="p-3 bg-red-brand/10 border border-red-brand/30 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Plan Premium 15 Días (Recomendado)</div>
                  <div className="text-[11px] text-zinc-300">Insignia "Verificada Destacada" + Push a Compradores</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-brand">$699 MXN</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowBoostModal(false);
                toast({ title: 'Plan seleccionado', description: 'Tu solicitud de publicación destacada ha sido registrada.' });
              }}
              className="w-full py-2.5 bg-red-brand hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-colors"
            >
              Activar Plan Destacado
            </button>
          </div>
        </div>
      )}

      {/* Modal: Detalle de Inspección Programada (NO DOWNLOAD / NO PRINT) */}
      {showInspectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 text-left relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowInspectionModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Inspección Mecánica y Legal</h3>
                <p className="text-xs text-emerald-400 font-medium">Programada: 20 May 2025 • 11:00 AM</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="p-3 bg-white/[0.02] rounded-xl space-y-1.5 border border-white/5">
                <div className="text-zinc-400 font-semibold">Ubicación y Especialista:</div>
                <div className="text-white font-medium">Taller Certificado Motoluv CDMX Sur</div>
                <div className="text-zinc-400 text-[11px]">Inspector Asignado: Ing. Roberto Garza</div>
              </div>

              <div className="p-3 bg-white/[0.02] rounded-xl space-y-1.5 border border-white/5">
                <div className="text-zinc-400 font-semibold">Puntos de control:</div>
                <div className="text-zinc-300 text-[11px]">
                  150 puntos mecánicos, eléctricos, compresión de motor, escaneo OBD y peritaje legal REPUVE.
                </div>
              </div>
            </div>

            <div className="p-3 bg-white/[0.03] rounded-lg text-[11px] text-zinc-400 flex items-start gap-2">
              <Shield size={14} className="text-red-brand flex-shrink-0 mt-0.5" />
              <span>
                Visualización protegida en plataforma Motoluv. La descarga e impresión de certificados técnicos está restringida por directiva de seguridad.
              </span>
            </div>

            <button
              onClick={() => setShowInspectionModal(false)}
              className="w-full py-2.5 bg-red-brand hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-colors"
            >
              Cerrar
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

export const OfferRow = ({ offer, isSeller, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleStatus = async (status) => {
    setLoading(true);
    try {
      await offerApi.updateStatus(offer.id, status);
      toast({
        title: status === 'accepted' ? 'Oferta Aceptada' : 'Oferta Rechazada',
        description: `Se ha actualizado el estado de la oferta para ${offer.moto_brand} ${offer.moto_model}.`
      });
      onUpdate && onUpdate();
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar la oferta.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-[#141418] border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm">{offer.moto_brand} {offer.moto_model} {offer.year || ''}</span>
          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
            offer.status === 'accepted'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : offer.status === 'rejected'
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          }`}>
            {offer.status === 'accepted' ? 'Aceptada' : offer.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
          </span>
        </div>
        <p className="text-zinc-400 text-xs mt-1">
          Monto propuesto: <span className="text-white font-bold">${Number(offer.amount || 0).toLocaleString()} MXN</span>
        </p>
        {offer.buyer_name && <p className="text-[11px] text-zinc-500">Comprador: {offer.buyer_name}</p>}
      </div>

      {isSeller && offer.status === 'pending' && (
        <div className="flex items-center gap-2">
          <button
            disabled={loading}
            onClick={() => handleStatus('accepted')}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs rounded-lg transition-colors border border-emerald-500/30"
          >
            Aceptar
          </button>
          <button
            disabled={loading}
            onClick={() => handleStatus('rejected')}
            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs rounded-lg transition-colors border border-red-500/30"
          >
            Rechazar
          </button>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
