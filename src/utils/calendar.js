/**
 * Utility to generate and download standard RFC 5545 .ics calendar files
 * for Motoluv inspection and certification appointments.
 * Compatible with Apple Calendar, Google Calendar, and Microsoft Outlook.
 */

// Helper to escape text fields in iCalendar standard format (RFC 5545)
function escapeIcsText(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// Helper to format Date as YYYYMMDD string for all-day events
function formatIcsDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Generates an .ics file string and triggers browser download.
 *
 * @param {Object} params
 * @param {string} params.nod - Real NOD of the operation (e.g. 'NOD-123456')
 * @param {string} params.brand - Motorcycle brand (e.g. 'Yamaha')
 * @param {string} params.model - Motorcycle model (e.g. 'MT-07')
 * @param {string|number} [params.year] - Motorcycle year (e.g. '2023')
 * @param {string} [params.workshopName] - Name of the chosen certified workshop
 * @param {string} [params.workshopAddress] - Physical address of the workshop
 * @param {string} params.dateStr - Selected date string in YYYY-MM-DD format (day only, no time)
 */
export function generateAndDownloadInspectionIcs({
  nod,
  brand = 'Motocicleta',
  model = '',
  year = '',
  workshopName = 'Taller Certificado Motoluv',
  workshopAddress = '',
  dateStr,
}) {
  if (!dateStr) {
    console.warn('generateAndDownloadInspectionIcs: dateStr is required');
    return;
  }

  // Parse dateStr (expected format: 'YYYY-MM-DD')
  const [yearPart, monthPart, dayPart] = dateStr.split('-').map(Number);
  if (!yearPart || !monthPart || !dayPart) {
    console.warn('generateAndDownloadInspectionIcs: invalid dateStr', dateStr);
    return;
  }

  const startDate = new Date(yearPart, monthPart - 1, dayPart);

  // Next day for exclusive DTEND in standard RFC 5545 all-day events
  const endDate = new Date(yearPart, monthPart - 1, dayPart);
  endDate.setDate(endDate.getDate() + 1);

  const dtStartStr = formatIcsDate(startDate);
  const dtEndStr = formatIcsDate(endDate);

  const cleanNod = String(nod || 'NOD-000100').trim();
  const vehicleName = `${brand} ${model}`.trim() + (year ? ` ${year}` : '');

  // SUMMARY: Inspección de certificación Motoluv — [marca] [modelo]
  const summary = `Inspección de certificación Motoluv — ${brand} ${model}`.trim();

  // DESCRIPTION: NOD, moto, año, taller y proceso de certificación.
  const descriptionLines = [
    `DETALLES DE LA OPERACIÓN MOTOLUV`,
    `----------------------------------------`,
    `Folio / NOD: ${cleanNod}`,
    `Motocicleta: ${vehicleName}`,
    year ? `Año: ${year}` : null,
    `Taller Asignado: ${workshopName}`,
    workshopAddress ? `Dirección del Taller: ${workshopAddress}` : null,
    `Horario de recepción en taller: 9:00 AM - 6:00 PM`,
    ``,
    `PROCESO DE CERTIFICACIÓN TÉCNICA MOTOLUV:`,
    `1. Presenta la motocicleta limpia con combustible en reserva y llaves originales.`,
    `2. Lleva la documentación original (factura/título, tarjeta de circulación, identificación oficial).`,
    `3. El perito certificado realizará el diagnóstico integral de 100 puntos (mecánica, eléctrica, estética, compresión de motor y verificación legal).`,
    `4. El dictamen digital se cargará en la plataforma Motoluv para continuar con el contrato, pago en custodia y entrega final.`,
    ``,
    `Soporte y atención inmediata por WhatsApp: +52 56 4304 8865`,
  ].filter((line) => line !== null);

  const descriptionRaw = descriptionLines.join('\n');
  const locationRaw = workshopAddress || workshopName || 'Taller Certificado Motoluv';

  const escapedSummary = escapeIcsText(summary);
  const escapedDescription = escapeIcsText(descriptionRaw);
  const escapedLocation = escapeIcsText(locationRaw);

  const now = new Date();
  const nowIso = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

  const uid = `motoluv-${cleanNod.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}@motoluv.com`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Motoluv Technologies//Inspeccion Certificacion v1.0//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowIso}`,
    `DTSTART;VALUE=DATE:${dtStartStr}`,
    `DTEND;VALUE=DATE:${dtEndStr}`,
    `SUMMARY:${escapedSummary}`,
    `DESCRIPTION:${escapedDescription}`,
    `LOCATION:${escapedLocation}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  try {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Nombre de archivo: Motoluv-[NOD]-Inspeccion.ics
    const sanitizedNod = cleanNod.replace(/[/\\?%*:|"<>]/g, '-');
    link.href = url;
    link.setAttribute('download', `Motoluv-${sanitizedNod}-Inspeccion.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (err) {
    console.error('Error generating .ics download:', err);
  }
}
