export const OPERATION_STATUSES = [
  'Publicada',
  'Apartada',
  'Certificación',
  'Oferta',
  'Proceso de entrega',
  'Entregada',
  'Vendida',
];

export function normalizeStatus(rawStatus) {
  if (!rawStatus) return 'Publicada';
  if (rawStatus === 'active') return 'Publicada';
  if (rawStatus === 'reserved') return 'Apartada';
  if (rawStatus === 'sold') return 'Vendida';
  return rawStatus;
}

export function getStatusStyle(rawStatus) {
  const status = normalizeStatus(rawStatus);
  switch (status) {
    case 'Publicada':
      return {
        label: 'Publicada',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dotClass: 'bg-emerald-400',
      };
    case 'Apartada':
      return {
        label: 'Apartada',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dotClass: 'bg-amber-400',
      };
    case 'Certificación':
      return {
        label: 'Certificación',
        badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        dotClass: 'bg-cyan-400',
      };
    case 'Oferta':
      return {
        label: 'Oferta',
        badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        dotClass: 'bg-purple-400',
      };
    case 'Proceso de entrega':
      return {
        label: 'Proceso de entrega',
        badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        dotClass: 'bg-orange-400',
      };
    case 'Entregada':
      return {
        label: 'Entregada',
        badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        dotClass: 'bg-blue-400',
      };
    case 'Vendida':
      return {
        label: 'Vendida',
        badgeClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
        dotClass: 'bg-zinc-500',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
        dotClass: 'bg-zinc-400',
      };
  }
}
