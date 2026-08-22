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
  'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800',
  'https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800',
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800',
  'https://images.pexels.com/photos/30444779/pexels-photo-30444779.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800',
  'https://images.unsplash.com/photo-1558981420-87aa9dad1c89?w=800',
  'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800',
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
    'Motor': Math.min(100, 78 + ((i * 3) % 22)),
    'Frenos': Math.min(100, 80 + ((i * 5) % 20)),
    'Suspensión': Math.min(100, 75 + ((i * 7) % 25)),
    'Transmisión': Math.min(100, 82 + ((i * 4) % 18)),
    'Neumáticos': Math.min(100, 70 + ((i * 6) % 30)),
    'Eléctrico': Math.min(100, 80 + ((i * 2) % 20)),
    'Chasis y Cuadro': Math.min(100, 88 + ((i * 3) % 12)),
    'Documentación': 100,
  },
  score_details: {
    'Motor': Math.min(100, 78 + ((i * 3) % 22)),
    'Frenos': Math.min(100, 80 + ((i * 5) % 20)),
    'Suspensión': Math.min(100, 75 + ((i * 7) % 25)),
    'Transmisión': Math.min(100, 82 + ((i * 4) % 18)),
    'Neumáticos': Math.min(100, 70 + ((i * 6) % 30)),
    'Eléctrico': Math.min(100, 80 + ((i * 2) % 20)),
    'Chasis y Cuadro': Math.min(100, 88 + ((i * 3) % 12)),
    'Documentación': 100,
  },
  certification_id: `CERT-MLV-${2024000 + i + 1}`,
  certified_date: new Date(Date.now() - (i + 2) * 86400000).toISOString().split('T')[0],
  certifier: 'Taller Mecánico Especializado Motoluv MX • Perito #MLV-408',
  certified_status: 'Aprobada • 150 Puntos Verificados',
  inspection_notes: `Inspección de 150 puntos completada satisfactoriamente. Compresión de motor verificada en estándar óptimo. Sistema de frenos y suspensión sin holguras ni desgastes anómalos. Sistema eléctrico y arnés íntegro. Libre de reporte de robo, siniestros y con número de serie/VIN cotejado en REPUVE.`,
}));

export const accessories = [
  { 
    id: 'acc_1', 
    name: 'Casco Integral AGV K3 SV Top', 
    brand: 'AGV', 
    price: 8500, 
    category: 'Cascos', 
    image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800', 
    images: [
      'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800',
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
      'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800'
    ],
    rating: 4.8,
    reviewsCount: 42,
    inStock: 8,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro Mate', 'Negro/Rojo Corsa', 'Blanco Neón'],
    description: 'El casco AGV K3 SV es el referente de aerodinámica, ventilación y confort para uso urbano y deportivo. Incluye visor solar desplegable integrado y mica antirrayaduras con preparación para Pinlock 100% Max Vision.',
    features: [
      'Homologación europea ECE 22.06 y certificación DOT',
      'Calota exterior en resina termoplástica de alta resistencia HIR-TH',
      'Visor solar interno abatible (ISV) anti-rayaduras',
      'Sistema de ventilación IVS con 4 entradas de aire frontales y 2 extractores traseros',
      'Interiores lavables en tejido Dry-Comfort hipoalergénico',
      'Cierre micrométrico en acero de liberación rápida'
    ],
    specs: {
      'Material': 'Resina HIR-TH de alta resistencia',
      'Peso': '1,490g ± 50g',
      'Homologación': 'ECE 22.06 / DOT',
      'Tipo de Cierre': 'Micrométrico reforzado',
      'Garantía': '2 años con Motoluv & AGV Oficial'
    }
  },
  { 
    id: 'acc_2', 
    name: 'Chamarra Pro-Leather Alpinestars GP Plus v3', 
    brand: 'Alpinestars', 
    price: 12500, 
    category: 'Ropa', 
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', 
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800'
    ],
    rating: 4.9,
    reviewsCount: 29,
    inStock: 5,
    sizes: ['S (48)', 'M (50)', 'L (52)', 'XL (54)'],
    colors: ['Negro / Rojo Corsa', 'Negro Stealth', 'Blanco / Azul GP'],
    description: 'Chamarra de cuero vacuno de 1.3 mm de primera calidad diseñada para pista y carretera. Diseñada anatómicamente con protección interna Nucleon Flex Plus en hombros y codos para máxima protección contra impacto.',
    features: [
      'Piel vacuna genuina de 1.3 mm ultrarresistente a la abrasión',
      'Protecciones desmontables Bio-Armor nivel 2 en hombros y codos',
      'Deslizadores DSF (Dynamic Friction Shield) en hombros',
      'Paneles elásticos HRSF de alta elasticidad en brazos y abdomen',
      'Compatibilidad integrada para sistema de airbag Tech-Air 5',
      'Cierre de conexión en cintura para pantalones Alpinestars'
    ],
    specs: {
      'Material': 'Piel vacuna de 1.3mm + Stretch Kevlar',
      'Protección': 'CE Nivel 2 en Hombros y Codos',
      'Temporada': '3 Estaciones (Primavera / Otoño / Invierno)',
      'Ajuste': 'Deportivo / Precurvado',
      'Garantía': '2 años de fábrica'
    }
  },
  { 
    id: 'acc_3', 
    name: 'Guantes de Cuero Racing Dainese Full Metal 6', 
    brand: 'Dainese', 
    price: 3200, 
    category: 'Guantes', 
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800', 
    images: [
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800'
    ],
    rating: 4.7,
    reviewsCount: 35,
    inStock: 12,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro / Carbono', 'Negro / Fluo Red'],
    description: 'Guantes de caña larga desarrollados para la alta competencia con inserciones de titanio y fibra de carbono en nudillos y dorso de la mano. Confeccionados en piel de cabra suave y resistente.',
    features: [
      'Inserciones de titanio y fibra de carbono en nudillos y nudillos métricos',
      'Refuerzos en piel de cabra en la palma y zonas de alto desgaste',
      'Costuras en hilo de Aramida (Kevlar) superresistente',
      'Control de distorsión DCP en dedo meñique',
      'Ajuste con dobles cinchas de seguridad con velcro'
    ],
    specs: {
      'Palma': 'Piel de cabra superSuave con Micro-Inyección',
      'Protecciones': 'Titanio + Carbono + Poliuretano',
      'Certificación': 'CE - Cat. II - Pr-EN 13594/2015 niv. 2',
      'Garantía': '1 año'
    }
  },
  { 
    id: 'acc_4', 
    name: 'Botas Racing SMX-6 v2 Drystar', 
    brand: 'Alpinestars', 
    price: 6800, 
    category: 'Calzado', 
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
      'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=800'
    ],
    rating: 4.9,
    reviewsCount: 18,
    inStock: 6,
    sizes: ['26.0 MX (41 EU)', '27.0 MX (42 EU)', '28.0 MX (43 EU)', '29.0 MX (44 EU)'],
    colors: ['Negro / Rojo', 'Negro Mate'],
    description: 'Botas deportivas de caña media con membrana impermeable y transpirable Drystar. Estructura anatómica de microfibra de alta densidad con protector biomecánico TPU en tobillo.',
    features: [
      'Membrana Drystar 100% impermeable y altamente transpirable',
      'Protector lateral TPU biomecánico de tobillo que limita torsión excesiva',
      'Deslizador de puntera TPU intercambiable de fácil reemplazo con tornillo',
      'Suela de goma vulcanizada de compuesto exclusivo para agarre y flexibilidad',
      'Entrada amplia con cremallera elástica montada en panel amortiguado'
    ],
    specs: {
      'Material Exterior': 'Microfibra técnica de alta abrasión',
      'Impermeabilidad': 'Membrana Drystar®',
      'Suela': 'Compuesto vulcanizado antideslizante',
      'Garantía': '18 meses'
    }
  },
  { 
    id: 'acc_5', 
    name: 'Escape Deportivo Akrapovič Slip-On Line Titanium', 
    brand: 'Akrapovic', 
    price: 18500, 
    category: 'Escapes', 
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', 
    images: [
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800'
    ],
    rating: 5.0,
    reviewsCount: 54,
    inStock: 3,
    sizes: ['Compatibilidad Estándar (Slip-On)'],
    colors: ['Titanio Mate / Tapa Carbono'],
    description: 'Sistema de escape de silenciador Slip-On en titanio genuino de grado de carreras con tapa final en fibra de carbono mate. Optimiza la entrega de torque, incrementa la potencia en +3.2 HP y reduce el peso en -2.8 kg.',
    features: [
      'Construcción 100% en Aleación de Titanio ultraligera',
      'Tapa final y abrazadera en Fibra de Carbono auténtica',
      'Sonido profundo y resonante homologado para carretera (con dB Killer removible)',
      'Instalación plug & play sin necesidad de reprogramar la computadora ECU',
      'Cumple normativas de emisiones Euro 5'
    ],
    specs: {
      'Material': 'Titanio & Fibra de Carbono',
      'Aumento de Potencia': '+3.2 HP @ 9,800 RPM',
      'Reducción de Peso': '-2.8 kg vs Escape Original',
      'Homologación': 'EC / ECE Type Approved',
      'Garantía': '2 años Akrapovič México'
    }
  },
  { 
    id: 'acc_6', 
    name: 'Alforjas Laterales Impermeables Givi Canyon 35L', 
    brand: 'Givi', 
    price: 4500, 
    category: 'Maletas', 
    image: 'https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800', 
    images: [
      'https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800',
      'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800',
      'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800'
    ],
    rating: 4.6,
    reviewsCount: 22,
    inStock: 10,
    sizes: ['35 Litros por Lado (Set de 2)'],
    colors: ['Negro Técnico / Reflejante'],
    description: 'Par de alforjas suaves impermeables con capacidad total de 70 litros para motos trail, enduro y adventure. Fabricadas en Poliéster 1200D de altísima tenacidad con funda interna IPX5 impermeable removable.',
    features: [
      'Capacidad de 35 Litros por alforja (70L total en el juego)',
      'Cierre enrollable Roll-Top con sellado térmico IPX5 antirroll',
      'Sistema de sujeción universal con cinchas micrométricas reforzadas',
      'Bolsillo exterior con cierre para herramientas de rápido acceso',
      'Detalles y estampados reflectantes de alta visibilidad nocturna'
    ],
    specs: {
      'Capacidad': '2x 35 Litros (70L Total)',
      'Material': 'Poliéster 1200D + Hypalon Anti-desgarre',
      'Resistencia al Agua': 'Grado IPX5 impermeable',
      'Garantía': '2 años'
    }
  },
  { 
    id: 'acc_7', 
    name: 'Casco Modular Abatible Shark Evo-ES', 
    brand: 'Shark', 
    price: 11200, 
    category: 'Cascos', 
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
      'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800',
      'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800'
    ],
    rating: 4.8,
    reviewsCount: 38,
    inStock: 7,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gris Nardo', 'Negro Mate', 'Blanco Perla'],
    description: 'El casco modular definitivo con mentonera abatible a 180° que cuenta con doble homologación P/J (Jet e Integral). Sistema Auto-up / Auto-down para apertura suave simultánea del visor.',
    features: [
      'Doble Homologación P/J (Aprobado para circular abierto o cerrado)',
      'Mentonera giratoria de 180 grados con fijación aerodinámica posterior',
      'Mica VZ150 anti-rayaduras y anti-empañante',
      'Visor solar interno accionable con la mano izquierda',
      'Espacio lateral adaptado para lentes oftálmicos (EasyFit)'
    ],
    specs: {
      'Mecanismo': 'Abatible 180° Auto-Up',
      'Homologación': 'ECE 22.05 P/J & DOT',
      'Peso': '1,650g',
      'Garantía': '5 años garantía de fábrica Shark'
    }
  },
  { 
    id: 'acc_8', 
    name: 'Kit de Servicio de Sintético Motul 7100 4T 10W40', 
    brand: 'Motul', 
    price: 950, 
    category: 'Lubricantes', 
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800', 
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800',
      'https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800'
    ],
    rating: 4.9,
    reviewsCount: 110,
    inStock: 25,
    sizes: ['Kit 4 Litros + Filtro Universal'],
    colors: ['Rojo Rubí Sintético Éster'],
    description: 'Lubricante 100% sintético con tecnología de Éster diseñado para motores de 4 tiempos de alta gama. Proporciona protección suprema para el motor, caja de cambios y embrague húmedo.',
    features: [
      'Tecnología 100% Sintético Éster con película lubricante de alta estabilidad',
      'Cumple especificaciones JASO MA2 y API SP para máximo agarre de embrague',
      'Reducción drástica de fricción interna y temperatura de trabajo',
      'Incluye 4 botellas de 1 Litro + Limpiador de cadena Motul Chain Clean gratis'
    ],
    specs: {
      'Viscosidad': '10W-40 100% Synthetic Ester',
      'Normativa': 'JASO MA2 / API SP / SN',
      'Contenido': '4 Litros + Regalo de mantenimiento',
      'Garantía': 'Calidad Certificada Motul France'
    }
  }
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
