// Mock data for Motoluv marketplace clone

export const brands = [
  'Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'Ducati', 'Harley-Davidson', 'BMW', 'KTM', 'Triumph', 'Aprilia'
];

export const cities = [
  'Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro', 'Tijuana', 'León', 'Mérida', 'Toluca', 'CDMX'
];

export const categories = ['Deportiva', 'Naked', 'Cruiser', 'Adventure', 'Scooter', 'Touring', 'Trail', 'Custom'];

// Real-ish motorcycle images from unsplash / pexels
const motoImages = [
  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
  'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800',
  'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800',
  'https://images.unsplash.com/photo-1611241443322-b5c0f7f70e2f?w=800',
  'https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800',
  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
  'https://images.pexels.com/photos/30444779/pexels-photo-30444779.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800',
  'https://images.unsplash.com/photo-1508357941304-42a883c78f89?w=800',
  'https://images.unsplash.com/photo-1517846875602-9c8ce67cfe75?w=800',
];

const modelData = [
  { brand: 'Kawasaki', model: 'Ninja 400', category: 'Deportiva', engine: '399cc', price: 95000, year: 2022, km: 12000, color: 'Verde', city: 'Monterrey', score: 4.2, views: 89, featured: false, rating: 4 },
  { brand: 'Yamaha', model: 'MT-07', category: 'Naked', engine: '689cc', price: 185000, year: 2024, km: 0, color: 'Azul', city: 'Guadalajara', score: 5.0, views: 156, featured: true, rating: 5 },
  { brand: 'Honda', model: 'CB190R', category: 'Naked', engine: '184cc', price: 45000, year: 2023, km: 5000, color: 'Rojo', city: 'Ciudad de México', score: 4.5, views: 234, featured: true, rating: 5 },
  { brand: 'Honda', model: 'CBR600RR', category: 'Deportiva', engine: '599cc', price: 130000, year: 2024, km: 0, color: 'Negro', city: 'CDMX', score: 4.8, views: 45, featured: false, rating: 5 },
  { brand: 'Yamaha', model: 'NMAX', category: 'Scooter', engine: '155cc', price: 55000, year: 2024, km: 0, color: 'Gris', city: 'Puebla', score: 4.3, views: 78, featured: false, rating: 4 },
  { brand: 'Honda', model: 'PCX150', category: 'Scooter', engine: '149cc', price: 62000, year: 2024, km: 0, color: 'Blanco', city: 'Querétaro', score: 4.4, views: 34, featured: false, rating: 4 },
  { brand: 'Suzuki', model: 'V-Strom 650', category: 'Adventure', engine: '645cc', price: 165000, year: 2024, km: 0, color: 'Amarillo', city: 'León', score: 4.6, views: 92, featured: false, rating: 5 },
  { brand: 'Yamaha', model: 'Tenere 700', category: 'Adventure', engine: '689cc', price: 220000, year: 2024, km: 0, color: 'Azul', city: 'Mérida', score: 4.9, views: 121, featured: true, rating: 5 },
  { brand: 'Honda', model: 'Africa Twin', category: 'Adventure', engine: '1084cc', price: 320000, year: 2024, km: 0, color: 'Negro', city: 'Toluca', score: 4.7, views: 87, featured: false, rating: 5 },
  { brand: 'Harley-Davidson', model: 'Iron 883', category: 'Cruiser', engine: '883cc', price: 260000, year: 2024, km: 1200, color: 'Negro', city: 'Tijuana', score: 4.5, views: 210, featured: true, rating: 4 },
  { brand: 'Kawasaki', model: 'Ninja 400', category: 'Deportiva', engine: '399cc', price: 105000, year: 2024, km: 800, color: 'Verde', city: 'Guadalajara', score: 4.6, views: 65, featured: false, rating: 5 },
  { brand: 'Honda', model: 'CBR600RR', category: 'Deportiva', engine: '599cc', price: 145000, year: 2023, km: 3000, color: 'Rojo', city: 'CDMX', score: 4.4, views: 178, featured: false, rating: 4 },
  { brand: 'Ducati', model: 'Panigale V4', category: 'Deportiva', engine: '1103cc', price: 480000, year: 2024, km: 0, color: 'Rojo', city: 'Monterrey', score: 5.0, views: 342, featured: true, rating: 5 },
  { brand: 'Honda', model: 'CBR1000RR', category: 'Deportiva', engine: '999cc', price: 285000, year: 2024, km: 0, color: 'Negro', city: 'CDMX', score: 4.9, views: 156, featured: false, rating: 5 },
  { brand: 'Yamaha', model: 'MT-07', category: 'Naked', engine: '689cc', price: 140000, year: 2024, km: 5000, color: 'Gris', city: 'CDMX', score: 4.6, views: 92, featured: false, rating: 5 },
  { brand: 'Suzuki', model: 'V-Strom 650', category: 'Adventure', engine: '645cc', price: 172000, year: 2024, km: 2000, color: 'Amarillo', city: 'Puebla', score: 4.5, views: 43, featured: false, rating: 4 },
  { brand: 'Yamaha', model: 'Tenere 700', category: 'Adventure', engine: '689cc', price: 235000, year: 2024, km: 1500, color: 'Blanco', city: 'León', score: 4.7, views: 67, featured: false, rating: 5 },
  { brand: 'Honda', model: 'Africa Twin', category: 'Adventure', engine: '1084cc', price: 340000, year: 2024, km: 1000, color: 'Rojo', city: 'Querétaro', score: 4.8, views: 89, featured: false, rating: 5 },
  { brand: 'Harley-Davidson', model: 'Iron 883', category: 'Cruiser', engine: '883cc', price: 275000, year: 2023, km: 4500, color: 'Negro', city: 'Tijuana', score: 4.4, views: 145, featured: false, rating: 4 },
  { brand: 'Honda', model: 'CBR600RR', category: 'Deportiva', engine: '599cc', price: 130000, year: 2024, km: 0, color: 'Azul', city: 'Toluca', score: 4.7, views: 54, featured: false, rating: 5 },
  { brand: 'BMW', model: 'S1000RR', category: 'Deportiva', engine: '999cc', price: 420000, year: 2024, km: 0, color: 'Rojo/Blanco', city: 'CDMX', score: 4.9, views: 267, featured: true, rating: 5 },
  { brand: 'KTM', model: 'Duke 390', category: 'Naked', engine: '373cc', price: 98000, year: 2024, km: 500, color: 'Naranja', city: 'Guadalajara', score: 4.6, views: 112, featured: false, rating: 4 },
  { brand: 'BMW', model: 'GS 1250', category: 'Adventure', engine: '1254cc', price: 385000, year: 2024, km: 2000, color: 'Blanco', city: 'Monterrey', score: 4.8, views: 178, featured: false, rating: 5 },
  { brand: 'Triumph', model: 'Street Triple 765', category: 'Naked', engine: '765cc', price: 210000, year: 2024, km: 1200, color: 'Negro', city: 'Puebla', score: 4.7, views: 89, featured: false, rating: 5 },
  { brand: 'Ducati', model: 'Monster 937', category: 'Naked', engine: '937cc', price: 265000, year: 2024, km: 800, color: 'Rojo', city: 'CDMX', score: 4.8, views: 145, featured: false, rating: 5 },
  { brand: 'Aprilia', model: 'RS 660', category: 'Deportiva', engine: '659cc', price: 195000, year: 2024, km: 0, color: 'Negro/Rojo', city: 'Querétaro', score: 4.6, views: 76, featured: false, rating: 4 },
  { brand: 'Kawasaki', model: 'Z900', category: 'Naked', engine: '948cc', price: 205000, year: 2024, km: 3000, color: 'Verde', city: 'Guadalajara', score: 4.7, views: 132, featured: false, rating: 5 },
  { brand: 'Suzuki', model: 'GSX-R750', category: 'Deportiva', engine: '750cc', price: 175000, year: 2023, km: 6000, color: 'Azul', city: 'Monterrey', score: 4.4, views: 98, featured: false, rating: 4 },
  { brand: 'Yamaha', model: 'R7', category: 'Deportiva', engine: '689cc', price: 168000, year: 2024, km: 1500, color: 'Azul', city: 'Mérida', score: 4.5, views: 65, featured: false, rating: 5 },
  { brand: 'Honda', model: 'Rebel 500', category: 'Cruiser', engine: '471cc', price: 115000, year: 2024, km: 500, color: 'Negro', city: 'León', score: 4.4, views: 78, featured: false, rating: 4 },
  { brand: 'Kawasaki', model: 'Versys 650', category: 'Adventure', engine: '649cc', price: 145000, year: 2023, km: 8000, color: 'Verde', city: 'Toluca', score: 4.3, views: 54, featured: false, rating: 4 },
  { brand: 'KTM', model: '890 Adventure', category: 'Adventure', engine: '889cc', price: 245000, year: 2024, km: 1000, color: 'Naranja', city: 'CDMX', score: 4.7, views: 121, featured: false, rating: 5 },
  { brand: 'Triumph', model: 'Bonneville T120', category: 'Custom', engine: '1200cc', price: 245000, year: 2024, km: 800, color: 'Verde Militar', city: 'Puebla', score: 4.6, views: 87, featured: false, rating: 5 },
  { brand: 'Harley-Davidson', model: 'Sportster S', category: 'Cruiser', engine: '1252cc', price: 335000, year: 2024, km: 0, color: 'Negro', city: 'CDMX', score: 4.8, views: 156, featured: true, rating: 5 },
  { brand: 'Yamaha', model: 'XSR900', category: 'Naked', engine: '890cc', price: 195000, year: 2024, km: 1200, color: 'Amarillo', city: 'Guadalajara', score: 4.7, views: 92, featured: false, rating: 5 },
  { brand: 'Ducati', model: 'Scrambler 800', category: 'Custom', engine: '803cc', price: 175000, year: 2023, km: 3500, color: 'Amarillo', city: 'Monterrey', score: 4.5, views: 68, featured: false, rating: 4 },
];

export const motos = modelData.map((m, i) => ({
  id: `moto_${(i + 1).toString().padStart(4, '0')}`,
  ...m,
  image: motoImages[i % motoImages.length],
  images: [
    motoImages[i % motoImages.length],
    motoImages[(i + 1) % motoImages.length],
    motoImages[(i + 2) % motoImages.length],
    motoImages[(i + 3) % motoImages.length],
  ],
  description: `Excelente ${m.brand} ${m.model} en muy buen estado. Mantenimientos al día en agencia. Ideal para quien busca una moto ${m.category.toLowerCase()} confiable y con historial verificado.`,
  seller: {
    name: ['Carlos R.', 'Ana G.', 'Luis M.', 'María F.', 'Roberto S.', 'Diana T.'][i % 6],
    rating: 4.5 + (i % 5) * 0.1,
    operations: 3 + (i % 10),
    joined: 2023 - (i % 3),
  },
  specs: {
    'Marca': m.brand,
    'Modelo': m.model,
    'Año': m.year,
    'Kilometraje': `${m.km.toLocaleString()} km`,
    'Motor': m.engine,
    'Color': m.color,
    'Categoría': m.category,
    'Ubicación': m.city,
  },
  scoreDetails: {
    'Motor': Math.min(100, 70 + (i * 3) % 30),
    'Frenos': Math.min(100, 75 + (i * 5) % 25),
    'Suspensión': Math.min(100, 72 + (i * 7) % 28),
    'Transmisión': Math.min(100, 80 + (i * 4) % 20),
    'Neumáticos': Math.min(100, 65 + (i * 6) % 35),
    'Eléctrico': Math.min(100, 78 + (i * 2) % 22),
  },
}));

export const accessories = [
  { id: 'acc_1', name: 'Casco Integral AGV K3', brand: 'AGV', price: 8500, category: 'Cascos', image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600', rating: 4.8 },
  { id: 'acc_2', name: 'Chamarra de Piel Alpinestars', brand: 'Alpinestars', price: 12500, category: 'Ropa', image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600', rating: 4.7 },
  { id: 'acc_3', name: 'Guantes de Cuero Racing', brand: 'Dainese', price: 3200, category: 'Guantes', image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600', rating: 4.6 },
  { id: 'acc_4', name: 'Botas Racing SMX-6', brand: 'Alpinestars', price: 6800, category: 'Calzado', image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600', rating: 4.9 },
  { id: 'acc_5', name: 'Escape Deportivo Akrapovic', brand: 'Akrapovic', price: 18500, category: 'Escapes', image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600', rating: 5.0 },
  { id: 'acc_6', name: 'Alforjas Impermeables', brand: 'Givi', price: 4500, category: 'Maletas', image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600', rating: 4.5 },
  { id: 'acc_7', name: 'Casco Modular Shark Evo', brand: 'Shark', price: 11200, category: 'Cascos', image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600', rating: 4.7 },
  { id: 'acc_8', name: 'Kit de Aceite Motul 7100', brand: 'Motul', price: 950, category: 'Lubricantes', image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600', rating: 4.8 },
];

export const packages = [
  {
    id: 'basico',
    name: 'Básico',
    price: 'Gratis',
    subtitle: 'Sin costo adicional',
    recommended: false,
    features: [
      'Informe de inspección completo',
      'Revisión legal exprés',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '$1,800 MXN',
    subtitle: '100% reembolsable si no concretas la compra',
    recommended: true,
    features: [
      'Prioridad en gestión',
      'Acompañamiento por chat',
      'Notificaciones push prioritarias',
      'Garantía mecánica limitada',
      'Asistencia vial',
      'Revisión postventa gratuita',
    ],
  },
  {
    id: 'total',
    name: 'Total',
    price: '$3,500 MXN',
    subtitle: '100% reembolsable, descontando proceso iniciado',
    recommended: false,
    features: [
      'Informe de inspección completo',
      'Revisión legal exprés',
      'Prioridad en gestión',
      'Acompañamiento por chat',
      'Seguro de cancelación',
      'Notificaciones push prioritarias',
      'Garantía mecánica limitada',
      'Asistencia vial',
      'Revisión postventa gratuita',
      'Gestión de cambio de propietario',
    ],
  },
];

export const sellerPackages = [
  {
    id: 'publicacion',
    name: 'Publicación',
    price: 'Gratis',
    subtitle: 'Publica tu moto sin costo',
    recommended: false,
    features: [
      'Publicación en el catálogo',
      'Hasta 6 fotografías',
      'Ficha técnica completa',
      'Dashboard de gestión',
      'Recibe ofertas de compradores verificados',
    ],
  },
  {
    id: 'destacada',
    name: 'Destacada',
    price: '$499 MXN',
    subtitle: 'Duplica tu visibilidad',
    recommended: true,
    features: [
      'Todo lo del plan Publicación',
      'Badge "DESTACADA" en la tarjeta',
      'Prioridad en resultados del catálogo',
      'Aparece en la sección "Motos Destacadas"',
      'Estadísticas de vistas detalladas',
      'Renovación automática cada 30 días',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$1,299 MXN',
    subtitle: 'Máxima exposición y confianza',
    recommended: false,
    features: [
      'Todo lo del plan Destacada',
      'Score mecánico certificado presencial',
      'Sesión de fotos profesional (opcional)',
      'Asesor de ventas dedicado',
      'Publicación en redes sociales de Motoluv',
      'Soporte prioritario 24/7',
      'Boost cada 7 días automáticamente',
    ],
  },
];
