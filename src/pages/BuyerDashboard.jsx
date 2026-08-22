import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { offerApi } from '../services/api';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeaderBar from '../components/dashboard/DashboardHeaderBar';
import { resolveSafeImageUrl, handleImageError } from '../utils/imageFallback';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');
  const [offers, setOffers] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showProtectionModal, setShowProtectionModal] = useState(false);
  const [savedMotos, setSavedMotos] = useState([
    {
      id: 'saved-1',
      brand: 'BMW',
      model: 'F 850 GS',
      year: 2021,
      price: 189900,
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=80',
      isFavorite: true,
    },
    {
      id: 'saved-2',
      brand: 'Triumph',
      model: 'Street Twin',
      year: 2019,
      price: 117900,
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80',
      isFavorite: true,
    },
    {
      id: 'saved-3',
      brand: 'Honda',
      model: 'CB650R',
      year: 2020,
      price: 139900,
      image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&q=80',
      isFavorite: true,
    },
    {
      id: 'saved-4',
      brand: 'Benelli',
      model: 'TNT 300',
      year: 2022,
      price: 64900,
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80',
      isFavorite: true,
    },
  ]);

  // Default sample requests matching reference design + dynamic ones
  const defaultRequests = [
    {
      id: 'req-1',
      moto_brand: 'Yamaha',
      moto_model: 'MT-07',
      year: 2021,
      date: '18 May 2025',
      status: 'inspeccion',
      statusLabel: 'Inspección en curso',
      statusType: 'emerald',
      nextStep: 'Resultado de inspección',
      image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&q=80',
      amount: 128900,
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
    },
  ];

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

  // Toggle favorite
  const toggleFavorite = (id) => {
    setSavedMotos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m))
    );
  };

  return (
    <div className="min-h-screen bg-[#080809] text-zinc-100 flex flex-col lg:flex-row">
      {/* Left Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mode="comprador"
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Header Bar */}
        <DashboardHeaderBar mode="comprador" />

        {/* Greeting Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Hola, {firstName}</span>
              <span className="text-2xl">👋</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Este es el resumen de tu actividad en Motoluv.
            </p>
          </div>
        </div>

        {/* 4 KPI Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <KpiCard
            icon={FileText}
            label="Solicitudes activas"
            value="2"
            linkText="Ver detalles →"
            onClick={() => setActiveTab('solicitudes')}
          />
          <KpiCard
            icon={ShieldCheck}
            label="Inspecciones en curso"
            value="1"
            linkText="Ver detalles →"
            onClick={() => setActiveTab('inspecciones')}
          />
          <KpiCard
            icon={ShoppingBag}
            label="Compras en proceso"
            value="0"
            linkText="Ver detalles →"
            onClick={() => setActiveTab('compras')}
          />
          <KpiCard
            icon={CheckCircle2}
            label="Compras completadas"
            value="1"
            linkText="Ver detalles →"
            onClick={() => setActiveTab('completadas')}
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
                <Link
                  to="/panel/mis-ofertas"
                  className="text-xs text-red-brand hover:text-red-400 font-semibold transition-colors"
                >
                  Ver todas →
                </Link>
              </div>

              <div className="space-y-3">
                {defaultRequests.map((req) => (
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
                          Solicitud realizada el {req.date}
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

                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-zinc-500 block">Próximo paso:</span>
                        <span className="text-xs text-zinc-300 font-medium">
                          {req.nextStep}
                        </span>
                      </div>

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
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Motos guardadas
                </h2>
                <Link
                  to="/motos"
                  className="text-xs text-red-brand hover:text-red-400 font-semibold transition-colors"
                >
                  Ver todas →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
                {savedMotos.map((moto) => (
                  <div
                    key={moto.id}
                    className="group bg-[#141418] border border-white/5 hover:border-white/15 rounded-xl p-2.5 sm:p-3 transition-all relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black/40 mb-2.5 relative">
                        <img
                          src={resolveSafeImageUrl(moto.image, 'moto')}
                          alt={`${moto.brand} ${moto.model}`}
                          onError={(e) => handleImageError(e, 'moto')}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="text-white text-xs font-bold truncate">
                        {moto.brand} {moto.model} {moto.year}
                      </h4>
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-zinc-200 font-bold text-xs">
                        ${moto.price.toLocaleString()} MXN
                      </span>
                      <button
                        onClick={() => toggleFavorite(moto.id)}
                        className="text-red-brand hover:scale-110 transition-transform p-1"
                        title="Favorita"
                      >
                        <Heart
                          size={15}
                          className={moto.isFavorite ? 'fill-red-brand text-red-brand' : 'text-zinc-500'}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
                    <p className="text-xs text-zinc-400 mt-0.5">Vence el 24 May 2025</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProtectionModal(true)}
                  className="px-3 py-1.5 bg-[#1b1b20] hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  Ver mi protección
                </button>
              </div>
            </div>

            {/* Widget 2: Mensajes recientes */}
            <div className="bg-[#101013] border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Mensajes recientes
                </h3>
                <button
                  onClick={() => setActiveTab('mensajes')}
                  className="text-xs text-red-brand hover:text-red-400 font-semibold transition-colors"
                >
                  Ver todos
                </button>
              </div>

              <div className="space-y-3">
                {/* Message 1 */}
                <div className="p-3 bg-[#141418] border border-white/5 rounded-xl space-y-1 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-brand/10 text-red-brand flex items-center justify-center text-[10px] font-bold">
                        EM
                      </div>
                      <span className="text-xs font-bold text-white">Especialista Motoluv</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-500">Hace 2h</span>
                      <span className="w-2 h-2 rounded-full bg-red-brand"></span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1 pl-8">
                    Tu inspección para Yamaha MT-07 ha sido programada con éxito...
                  </p>
                </div>

                {/* Message 2 */}
                <div className="p-3 bg-[#141418] border border-white/5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#1e1e24] text-zinc-300 flex items-center justify-center text-[10px] font-bold">
                        LR
                      </div>
                      <span className="text-xs font-bold text-white">Luis Ramírez (Vendedor)</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">Hace 5h</span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1 pl-8">
                    ¡Hola! He aceptado tu oferta.
                  </p>
                </div>

                {/* Message 3 */}
                <div className="p-3 bg-[#141418] border border-white/5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-brand/10 text-red-brand flex items-center justify-center text-[10px] font-bold">
                        EM
                      </div>
                      <span className="text-xs font-bold text-white">Especialista Motoluv</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">Ayer</span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1 pl-8">
                    Documentos listos para revisión.
                  </p>
                </div>
              </div>
            </div>

            {/* Widget 3: Promo Banner ¿Listo para tu próxima moto? */}
            <div className="bg-[#101013] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[190px]">
              {/* Background Bike Image overlay */}
              <div
                className="absolute right-0 top-0 bottom-0 w-1/2 opacity-35 pointer-events-none bg-contain bg-right bg-no-repeat"
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b1b20] hover:bg-white/10 text-white font-semibold text-xs rounded-lg border border-white/10 transition-colors"
                >
                  <span>Explorar motos</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Detalle de Solicitud (NO DOWNLOAD / NO PRINT) */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-5 text-left relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">
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
                <span className="text-emerald-400 font-medium">150 Puntos Certificados</span>
              </div>
            </div>

            <div className="p-3 bg-white/[0.03] rounded-lg text-[11px] text-zinc-400 flex items-start gap-2">
              <Shield size={14} className="text-red-brand flex-shrink-0 mt-0.5" />
              <span>
                Visualización digital protegida en plataforma Motoluv. La descarga e impresión de documentos técnicos se encuentra restringida por seguridad.
              </span>
            </div>

            <button
              onClick={() => setSelectedRequest(null)}
              className="w-full py-2.5 bg-[#1b1b20] hover:bg-white/10 text-white font-bold text-xs rounded-lg transition-colors border border-white/10"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal: Estado de Protección */}
      {showProtectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 text-left relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">
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
                <p className="text-xs text-emerald-400 font-medium">Vigencia hasta el 24 de Mayo 2025</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2 p-2.5 bg-white/[0.02] rounded-lg">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Garantía Mecánica Motoluv por 30 días en tren motriz y motor.</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-white/[0.02] rounded-lg">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Validación legal 100% libre de reporte de robo y gravámenes.</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-white/[0.02] rounded-lg">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Custodia y resguardo de fondos en fideicomiso seguro hasta la entrega.</span>
              </div>
            </div>

            <button
              onClick={() => setShowProtectionModal(false)}
              className="w-full py-2.5 bg-red-brand hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-colors"
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
