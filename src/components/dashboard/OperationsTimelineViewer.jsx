import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  FileText,
  CreditCard,
  Repeat,
  Bike,
  ChevronRight,
  Info,
  ChevronLeft,
  Calendar,
  Clock,
  ShieldCheck,
  Eye,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  X
} from 'lucide-react';
import { resolveSafeImageUrl } from '../../utils/imageFallback';

/**
 * Stages definition for Motoluv Operations Timeline
 * 1. Apartado
 * 2. Contrato
 * 3. Pago
 * 4. Transferencia
 * 5. Entrega
 */
const TIMELINE_STAGES = [
  { id: 'apartado', label: 'Apartado', icon: Check },
  { id: 'contrato', label: 'Contrato', icon: FileText },
  { id: 'pago', label: 'Pago', icon: CreditCard },
  { id: 'transferencia', label: 'Transferencia', icon: Repeat },
  { id: 'entrega', label: 'Entrega', icon: Bike },
];

/**
 * Resolves the operational progress and status for an apartado item
 */
export const resolveOperationTimeline = (item) => {
  if (!item) return null;

  const rawCertStatus = String(item.certification_status || '').toUpperCase();
  const rawAppStatus = String(item.certification_appointment_status || '').toUpperCase();
  const rawItemStatus = String(item.status || '').toUpperCase();
  const rawContractStatus = String(item.contract_status || '').toUpperCase();
  const rawPaymentStatus = String(item.payment_status || '').toUpperCase();
  const rawTransferStatus = String(item.transfer_status || '').toUpperCase();
  const rawDeliveryStatus = String(item.delivery_status || '').toUpperCase();

  // Helper date formatters
  const formatDate = (d) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const formatDateTime = (d) => {
    if (!d) return 'Fecha no disponible';
    try {
      const date = new Date(d);
      const datePart = date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const timePart = date.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return `${datePart}, ${timePart}`;
    } catch {
      return 'Fecha no disponible';
    }
  };

  // 1. Stage: Apartado
  // Since it exists as an apartado record, it's completed
  const apartadoDate = formatDate(item.created_at || item.apartado_at);
  const apartadoDateTime = formatDateTime(item.created_at || item.apartado_at);

  // 2. Stage: Contrato
  // Contrato is completed if contract is completed/signed or inspection completed with certified status
  const isContractCompleted =
    rawContractStatus === 'COMPLETADO' ||
    rawContractStatus === 'FIRMADO' ||
    Boolean(item.contract_signed_at) ||
    Boolean(item.paid_at) ||
    rawPaymentStatus === 'COMPLETADO' ||
    rawPaymentStatus === 'EN_PROCESO';

  const isContractInProgress =
    !isContractCompleted &&
    (rawContractStatus === 'EN_PROCESO' ||
      rawCertStatus === 'CERTIFICADA' ||
      rawCertStatus === 'APROBADA' ||
      rawAppStatus === 'COMPLETADA' ||
      rawAppStatus === 'PROGRAMADA' ||
      Boolean(item.certification_appointment_at));

  const contractDate = formatDate(item.contract_signed_at || item.contract_at || (isContractCompleted ? item.created_at : null));

  // 3. Stage: Pago
  const isPagoCompleted =
    rawPaymentStatus === 'COMPLETADO' ||
    rawPaymentStatus === 'PAGADO' ||
    Boolean(item.paid_at) ||
    rawTransferStatus === 'COMPLETADO' ||
    rawTransferStatus === 'EN_PROCESO' ||
    rawDeliveryStatus === 'COMPLETADO';

  const isPagoInProgress =
    !isPagoCompleted &&
    (rawPaymentStatus === 'EN_PROCESO' ||
      (isContractCompleted && !isPagoCompleted));

  const pagoDate = formatDate(item.paid_at || item.payment_at);

  // 4. Stage: Transferencia
  const isTransferCompleted =
    rawTransferStatus === 'COMPLETADO' ||
    Boolean(item.transferred_at) ||
    rawDeliveryStatus === 'COMPLETADO';

  const isTransferInProgress =
    !isTransferCompleted &&
    (rawTransferStatus === 'EN_PROCESO' || (isPagoCompleted && !isTransferCompleted));

  const transferDate = formatDate(item.transferred_at || item.transfer_at);

  // 5. Stage: Entrega
  const isDeliveryCompleted =
    rawDeliveryStatus === 'COMPLETADO' ||
    rawDeliveryStatus === 'ENTREGADO' ||
    rawItemStatus === 'COMPLETADO' ||
    rawItemStatus === 'ENTREGADO' ||
    Boolean(item.delivered_at);

  const isDeliveryInProgress =
    !isDeliveryCompleted &&
    (rawDeliveryStatus === 'EN_PROCESO' || (isTransferCompleted && !isDeliveryCompleted));

  const deliveryDate = formatDate(item.delivered_at || item.delivery_at);

  // Build the 5 step status objects
  const steps = [
    {
      id: 'apartado',
      label: 'Apartado',
      status: 'completed', // 'completed' | 'in_progress' | 'pending'
      date: apartadoDate,
      substatus: 'Completado',
    },
    {
      id: 'contrato',
      label: 'Contrato',
      status: isContractCompleted ? 'completed' : isContractInProgress ? 'in_progress' : 'pending',
      date: isContractCompleted ? (contractDate || apartadoDate) : null,
      substatus: isContractCompleted ? 'Completado' : isContractInProgress ? 'En proceso' : 'Pendiente',
    },
    {
      id: 'pago',
      label: 'Pago',
      status: isPagoCompleted ? 'completed' : isPagoInProgress ? 'in_progress' : 'pending',
      date: isPagoCompleted ? pagoDate : null,
      substatus: isPagoCompleted ? 'Completado' : isPagoInProgress ? 'En proceso' : 'Pendiente',
    },
    {
      id: 'transferencia',
      label: 'Transferencia',
      status: isTransferCompleted ? 'completed' : isTransferInProgress ? 'in_progress' : 'pending',
      date: isTransferCompleted ? transferDate : null,
      substatus: isTransferCompleted ? 'Completado' : isTransferInProgress ? 'En proceso' : 'Pendiente',
    },
    {
      id: 'entrega',
      label: 'Entrega',
      status: isDeliveryCompleted ? 'completed' : isDeliveryInProgress ? 'in_progress' : 'pending',
      date: isDeliveryCompleted ? deliveryDate : null,
      substatus: isDeliveryCompleted ? 'Completado' : isDeliveryInProgress ? 'En proceso' : 'Pendiente',
    },
  ];

  // Determine current active stage key for filter & badge
  let activeStageKey = 'apartado';
  let badgeLabel = 'Apartado';
  let badgeColor = 'amber';

  if (isDeliveryCompleted) {
    activeStageKey = 'entrega';
    badgeLabel = 'Completada';
    badgeColor = 'emerald';
  } else if (isDeliveryInProgress) {
    activeStageKey = 'entrega';
    badgeLabel = 'Entrega';
    badgeColor = 'blue';
  } else if (isTransferInProgress) {
    activeStageKey = 'transferencia';
    badgeLabel = 'Transferencia';
    badgeColor = 'blue';
  } else if (isPagoInProgress) {
    activeStageKey = 'pago';
    badgeLabel = 'En proceso';
    badgeColor = 'emerald';
  } else if (isContractInProgress) {
    activeStageKey = 'contrato';
    badgeLabel = 'Contrato';
    badgeColor = 'blue';
  } else {
    activeStageKey = 'apartado';
    badgeLabel = 'Apartado';
    badgeColor = 'amber';
  }

  // Derive folio
  const folio = item.folio || (item.id ? `ML-${String(item.id).replace(/\D/g, '').slice(0, 5).padStart(5, '0')}` : 'ML-00100');

  // Format counterparty initials and name
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return {
    raw: item,
    id: item.id,
    folio,
    moto_id: item.moto_id || item.moto?.id,
    brand: item.moto_brand || item.moto?.brand || 'Motocicleta',
    model: item.moto_model || item.moto?.model || '',
    year: item.moto_year || item.moto?.year || '',
    price: Number(item.moto_price || item.moto?.price || item.amount || 0),
    image: item.moto_image || item.moto?.images?.[0] || item.moto?.image,
    buyerName: item.buyer_name || item.buyer_email || 'Comprador Motoluv',
    buyerInitials: getInitials(item.buyer_name || item.buyer_email || 'Comprador'),
    sellerName: item.seller_name || item.moto?.owner_name || 'Vendedor Motoluv',
    sellerInitials: getInitials(item.seller_name || item.moto?.owner_name || 'Vendedor'),
    apartadoDateTime,
    steps,
    activeStageKey,
    badgeLabel,
    badgeColor,
  };
};

const OperationsTimelineViewer = ({
  items = [],
  mode = 'vendedor', // 'vendedor' | 'comprador'
  onScheduleAppointment,
}) => {
  const [activeFilter, setActiveFilter] = useState('todas');
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isSeller = mode === 'vendedor';

  // Process all items with timeline resolver
  const processedItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.map(resolveOperationTimeline).filter(Boolean);
  }, [items]);

  // Dynamic counts for filter pills
  const counts = useMemo(() => {
    const res = {
      todas: processedItems.length,
      apartado: 0,
      contrato: 0,
      pago: 0,
      transferencia: 0,
      entrega: 0,
    };
    processedItems.forEach((op) => {
      if (res[op.activeStageKey] !== undefined) {
        res[op.activeStageKey]++;
      }
    });
    return res;
  }, [processedItems]);

  // Filter items based on active pill
  const filteredItems = useMemo(() => {
    if (activeFilter === 'todas') return processedItems;
    return processedItems.filter((op) => op.activeStageKey === activeFilter);
  }, [processedItems, activeFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const filterTabs = [
    { id: 'todas', label: 'Todas', count: counts.todas },
    { id: 'apartado', label: 'Apartado', count: counts.apartado },
    { id: 'contrato', label: 'Contrato', count: counts.contrato },
    { id: 'pago', label: 'Pago', count: counts.pago },
    { id: 'transferencia', label: 'Transferencia', count: counts.transferencia },
    { id: 'entrega', label: 'Entrega', count: counts.entrega },
  ];

  return (
    <div className="space-y-6">
      {/* Header Area matching attached reference */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {isSeller ? 'Ventas en proceso' : 'Mis compras'}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          {isSeller
            ? 'Aquí puedes consultar el avance de todas las operaciones que ya tienen apartado.'
            : 'Aquí puedes consultar el avance de todas tus compras que ya tienen apartado.'}
        </p>
      </div>

      {/* Filter Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-red-950/40 border border-red-800/40 text-red-400 shadow-sm'
                  : 'bg-[#121216] hover:bg-[#18181f] border border-white/5 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[11px] font-bold ${
                  isActive ? 'bg-red-600/30 text-red-300' : 'bg-white/5 text-zinc-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Operations List */}
      {processedItems.length === 0 ? (
        <div className="p-16 bg-[#101013] border border-white/5 rounded-2xl text-center space-y-3">
          <Clock size={36} className="text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No hay operaciones activas</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {isSeller
              ? 'Cuando un comprador aparte una de tus motocicletas, el visor de línea de tiempo aparecerá aquí.'
              : 'Cuando apartes una motocicleta en el catálogo oficial, podrás seguir el progreso paso a paso aquí.'}
          </p>
          {!isSeller && (
            <Link
              to="/motos"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-brand hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors shadow"
            >
              <Bike size={14} /> Explorar catálogo
            </Link>
          )}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 bg-[#101013] border border-white/5 rounded-2xl text-center space-y-2">
          <Info size={28} className="text-zinc-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">Sin operaciones en esta etapa</h3>
          <p className="text-xs text-zinc-400">
            No hay operaciones que coincidan con el filtro seleccionado.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedItems.map((op) => {
            const counterpartyName = isSeller ? op.buyerName : op.sellerName;
            const counterpartyInitials = isSeller ? op.buyerInitials : op.sellerInitials;
            const counterpartyRole = isSeller ? 'Comprador' : 'Vendedor';

            return (
              <div
                key={op.id}
                className="p-5 sm:p-6 bg-[#101013] border border-white/5 rounded-2xl hover:border-white/10 transition-colors flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6"
              >
                {/* 1. LEFT COLUMN: Vehicle Thumbnail, Title, Folio, Price & Counterparty */}
                <div className="flex items-center gap-4 min-w-[280px] sm:min-w-[320px]">
                  {/* Motorcycle Image */}
                  <div className="w-24 h-20 sm:w-28 sm:h-22 rounded-xl bg-black/50 border border-white/10 overflow-hidden flex-shrink-0 relative">
                    <img
                      src={resolveSafeImageUrl(op.image, 'moto')}
                      alt={op.model || 'Motocicleta'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>

                  {/* Vehicle Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate leading-snug">
                      {op.brand} {op.model} {op.year}
                    </h3>
                    <div className="text-xs font-mono text-zinc-400">
                      {op.folio}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white">
                      ${op.price.toLocaleString('es-MX')} MXN
                    </div>

                    {/* Counterparty avatar and name */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-6 h-6 rounded-full bg-[#1e1e24] border border-white/10 text-zinc-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {counterpartyInitials}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-zinc-500 block leading-tight">
                          {counterpartyRole}
                        </span>
                        <span className="text-xs font-medium text-zinc-200 block leading-tight truncate">
                          {counterpartyName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. CENTER COLUMN: 5-Stage Timeline */}
                <div className="flex-1 w-full py-2 px-1 sm:px-4">
                  <div className="relative flex items-center justify-between">
                    {/* Connecting background track lines */}
                    <div className="absolute top-3.5 left-6 right-6 h-[2px] -translate-y-1/2 flex">
                      {op.steps.slice(0, -1).map((st, idx) => {
                        const nextStep = op.steps[idx + 1];
                        const isLineGreen = st.status === 'completed';
                        return (
                          <div
                            key={idx}
                            className={`flex-1 h-full transition-colors ${
                              isLineGreen ? 'bg-emerald-500' : 'bg-white/10'
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Step Nodes */}
                    {op.steps.map((st, index) => {
                      const isCompleted = st.status === 'completed';
                      const isInProgress = st.status === 'in_progress';

                      const StageIcon = TIMELINE_STAGES[index]?.icon || Check;

                      return (
                        <div
                          key={st.id}
                          className="relative z-10 flex flex-col items-center text-center flex-1"
                        >
                          {/* Step Circle */}
                          {isCompleted ? (
                            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          ) : isInProgress ? (
                            <div className="w-7 h-7 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-500/15">
                              <StageIcon size={12} strokeWidth={2.5} />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#18181d] border border-white/15 flex items-center justify-center text-zinc-500">
                              <StageIcon size={12} strokeWidth={2} />
                            </div>
                          )}

                          {/* Step Label & Substatus */}
                          <div className="mt-2 space-y-0.5 min-h-[36px]">
                            <span
                              className={`text-xs block font-semibold leading-tight ${
                                isCompleted || isInProgress ? 'text-white' : 'text-zinc-400'
                              }`}
                            >
                              {st.label}
                            </span>
                            {st.date && (
                              <span className="text-[10px] text-zinc-400 block leading-tight">
                                {st.date}
                              </span>
                            )}
                            <span
                              className={`text-[10px] block font-medium leading-tight ${
                                isCompleted
                                  ? 'text-zinc-400'
                                  : isInProgress
                                  ? 'text-blue-400 font-semibold'
                                  : 'text-zinc-500'
                              }`}
                            >
                              {st.substatus}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. RIGHT COLUMN: Fecha de apartado, Status Badge & Ver Detalle button */}
                <div className="flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-3 pt-3 xl:pt-0 border-t xl:border-t-0 border-white/5 min-w-[170px]">
                  <div className="text-left xl:text-right space-y-0.5">
                    <span className="text-[11px] text-zinc-500 block">Fecha de apartado</span>
                    <span className="text-xs text-zinc-300 font-medium block">
                      {op.apartadoDateTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                        op.badgeColor === 'emerald'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : op.badgeColor === 'blue'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {op.badgeLabel}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedOperation(op)}
                    className="px-4 py-2 bg-[#17171c] hover:bg-[#22222a] text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Ver detalle</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info note & Pagination Footer */}
      {processedItems.length > 0 && (
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-zinc-500 flex-shrink-0" />
            <span>
              Los tiempos pueden variar dependiendo de la disponibilidad del comprador y los procesos de verificación.
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4">
            <span className="text-zinc-400">
              Mostrando {filteredItems.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a{' '}
              {Math.min(currentPage * itemsPerPage, filteredItems.length)} de {filteredItems.length} operaciones
            </span>

            {/* Pagination buttons */}
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg bg-[#141418] border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {currentPage}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg bg-[#141418] border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DETAIL MODAL ================= */}
      {selectedOperation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-6 text-left relative shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-black/60 border border-white/10 overflow-hidden flex-shrink-0">
                  <img
                    src={resolveSafeImageUrl(selectedOperation.image, 'moto')}
                    alt={selectedOperation.model}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedOperation.brand} {selectedOperation.model} {selectedOperation.year}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">
                    Folio de Operación: <span className="text-white font-semibold">{selectedOperation.folio}</span>
                  </p>
                  <p className="text-sm font-bold text-red-brand mt-0.5">
                    ${selectedOperation.price.toLocaleString('es-MX')} MXN
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOperation(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Summary Progress bar inside modal */}
            <div className="p-4 bg-[#18181f] border border-white/5 rounded-xl space-y-3">
              <span className="text-xs font-bold text-zinc-300 block">Etapas de la Operación</span>
              <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                {selectedOperation.steps.map((st) => (
                  <div key={st.id} className="space-y-1">
                    <div
                      className={`h-1.5 rounded-full ${
                        st.status === 'completed'
                          ? 'bg-emerald-500'
                          : st.status === 'in_progress'
                          ? 'bg-blue-500 animate-pulse'
                          : 'bg-white/10'
                      }`}
                    />
                    <span className="font-semibold block truncate text-zinc-300">{st.label}</span>
                    <span
                      className={`text-[10px] block truncate ${
                        st.status === 'completed'
                          ? 'text-emerald-400'
                          : st.status === 'in_progress'
                          ? 'text-blue-400 font-semibold'
                          : 'text-zinc-500'
                      }`}
                    >
                      {st.substatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Key-Values */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Fecha y Hora de Apartado:</span>
                <span className="text-zinc-200 font-medium">{selectedOperation.apartadoDateTime}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">{isSeller ? 'Comprador' : 'Vendedor'}:</span>
                <span className="text-zinc-200 font-medium">
                  {isSeller ? selectedOperation.buyerName : selectedOperation.sellerName}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Dictamen de Inspección Técnica:</span>
                <span className="font-bold text-emerald-400 uppercase">
                  {selectedOperation.raw?.certification_status || 'PENDIENTE'}
                </span>
              </div>

              {isSeller && selectedOperation.raw?.certification_workshop && (
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-zinc-400">Taller Oficial Asignado:</span>
                  <span className="text-zinc-200 font-medium">
                    {selectedOperation.raw.certification_workshop}
                  </span>
                </div>
              )}

              {isSeller && selectedOperation.raw?.certification_appointment_at && (
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-zinc-400">Cita de Peritaje:</span>
                  <span className="text-zinc-200 font-medium">
                    {new Date(selectedOperation.raw.certification_appointment_at).toLocaleString('es-MX')}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/525643048865"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle size={15} />
                <span>Contactar Asesor Motoluv</span>
              </a>

              {selectedOperation.moto_id && (
                <Link
                  to={`/motos/${selectedOperation.moto_id}`}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <Eye size={14} />
                  <span>Ver Moto</span>
                </Link>
              )}

              <button
                onClick={() => setSelectedOperation(null)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition-colors"
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

export default OperationsTimelineViewer;
