import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, Users, Shield, Wrench, CheckCircle, Eye, FileText, Search, Tag } from 'lucide-react';
import MotoCard from '../components/MotoCard';
import { motoApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import heroBikeImage from '../assets/images/motoluv_hero_bike_1787923976389.jpg';
import bobberImage from '../assets/images/cinematic_bobber_rider_1787497883792.jpg';

const HomePage = () => {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    motoApi.list({ featured: true, limit: 12 }).then((data) => {
      // Exclusively filter and display motorcycles with the featured label
      const onlyFeatured = (Array.isArray(data) ? data : []).filter((m) => Boolean(m.featured));
      setFeatured(onlyFeatured.slice(0, 6));
    }).catch(() => setFeatured([]));
  }, []);

  const stats = [
    { value: '1 asesor', label: 'Por cada operación' },
    { value: 'Somos el intermediario', label: 'Certeza para comprador y vendedor' },
    { value: 'Score mecánico', label: 'En cada moto listada' },
    { value: 'Nuevo concepto', label: 'En el mercado de motos' },
  ];

  const process = [
    { n: '01', title: 'Explora el catálogo', desc: 'Encuentra motocicletas con ficha técnica completa: año, kilometraje, motor, color y ubicación. Todo en un solo lugar.' },
    { n: '02', title: 'Score mecánico en cada moto', desc: 'Cada motocicleta en Motoluv tiene una calificación técnica para que sepas exactamente qué estás viendo antes de hacer cualquier movimiento.' },
    { n: '03', title: 'Tu asesor coordina todo', desc: 'Un asesor Motoluv acompaña la operación desde el inicio. Sin contacto directo entre partes.' },
    { n: '04', title: 'Entrega protegida', desc: 'Tu asesor coordina la entrega, documentación y traspaso. Tú solo apareces cuando todo está en orden.' },
  ];

  const features = [
    { icon: Users, title: 'Acompañamiento en cada operación', desc: 'Cada compra y venta tiene un asesor Motoluv que coordina la operación de principio a fin.' },
    { icon: Wrench, title: 'Score mecánico certificado', desc: 'Mecánicos certificados Motoluv evalúan cada motocicleta. Información real antes de decidir.' },
    { icon: Shield, title: 'Sin contacto directo entre partes', desc: 'Comprador y vendedor no interactúan directamente. Proceso ordenado.' },
    { icon: CheckCircle, title: 'Usuarios con historial', desc: 'Cada usuario tiene un perfil verificado con calificaciones reales de operaciones anteriores.' },
    { icon: Eye, title: 'Proceso transparente', desc: 'Seguimiento en tiempo real de cada paso. Sabes en qué etapa está tu operación en todo momento.' },
    { icon: FileText, title: 'Ficha técnica completa', desc: 'Año, kilometraje, motor, color, ubicación, score mecánico y documentación en un solo lugar.' },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[85vh] lg:min-h-[92vh] flex items-center bg-[#050505] overflow-hidden">
        {/* Background Motorcycle image positioned on the right */}
        <div className="absolute inset-0 flex justify-end items-center pointer-events-none select-none">
          <div className="relative w-full h-full lg:w-[65%] xl:w-[58%] flex items-center justify-end">
            <img
              src={heroBikeImage}
              alt="Motoluv Motorcycle"
              className="w-full h-full object-cover object-center lg:object-right opacity-60 lg:opacity-100"
              referrerPolicy="no-referrer"
            />
            {/* Gradients to blend motorcycle image seamlessly into the black background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent w-full lg:w-3/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/70" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-[#050505]" />
          </div>
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full py-16 sm:py-20 lg:py-28">
          <div className="max-w-2xl text-left">
            {/* Red Eyebrow */}
            <div className="text-[#E10600] font-bold text-xs sm:text-sm tracking-[0.25em] uppercase mb-4 sm:mb-6">
              SUBE. CONECTA. RUEDA.
            </div>

            {/* Headline */}
            <h1 className="hero-title text-white text-4xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-tight leading-[0.92]">
              DONDE COMPRAR Y VENDER
              <br />
              <span className="text-[#E10600]">SE SIENTE DIFERENTE.</span>
            </h1>

            {/* Description */}
            <p className="mt-6 sm:mt-7 text-zinc-300 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-xl">
              Motos verificadas. Personas conectadas.
              <br />
              Operaciones protegidas. Todo acompañado
              <br />
              por <span className="text-[#E10600] font-medium">Motoluv</span>.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/motos"
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 bg-[#E10600] hover:bg-[#c50500] active:bg-[#aa0400] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all shadow-lg hover:shadow-red-600/30 group"
              >
                <Search size={16} className="text-white group-hover:scale-110 transition-transform" />
                <span>COMPRAR UNA MOTO</span>
                <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to={user ? '/panel/publicar' : '/registro'}
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 bg-black/60 hover:bg-white/10 active:bg-white/15 border border-white/20 hover:border-white/40 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all backdrop-blur-sm group"
              >
                <Tag size={16} className="text-zinc-300 group-hover:text-white group-hover:scale-110 transition-transform" />
                <span>VENDER MI MOTO</span>
                <ArrowRight size={16} className="text-zinc-300 group-hover:text-white group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-black bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center md:text-left">
              <div className="font-display font-bold text-white uppercase tracking-wide text-sm md:text-base">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-24">
        <div className="max-w-2xl">
          <span className="inline-block text-red-brand text-[11px] tracking-widest uppercase border border-red-brand/60 rounded-full px-3 py-1.5 mb-6">
            El proceso
          </span>
          <h2 className="font-display font-bold text-white text-4xl md:text-5xl uppercase leading-tight">
            Una nueva forma de <br /><span className="text-red-brand">comprar y vender</span>
          </h2>
          <p className="text-zinc-400 mt-6 text-base leading-relaxed">
            Motoluv cambia el modelo: un asesor acompaña cada operación para que comprador y vendedor tengan una experiencia ordenada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          {process.map((p) => (
            <div
              key={p.n}
              className="bg-gradient-to-b from-[#151517] to-[#0d0d0e] hover:from-[#2a2a30] hover:to-[#18181c] border border-black rounded-md p-8 transition-all duration-300 shadow-md hover:shadow-xl cursor-default"
            >
              <div className="font-display font-bold text-red-brand text-5xl mb-6">{p.n}</div>
              <h3 className="font-display font-bold text-white uppercase tracking-wide text-lg mb-3">{p.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-24">
        <div className="max-w-2xl">
          <span className="inline-block text-red-brand text-[11px] tracking-widest uppercase border border-red-brand/60 rounded-full px-3 py-1.5 mb-6">
            Qué hace diferente Motoluv
          </span>
          <h2 className="font-display font-bold text-white text-4xl md:text-5xl uppercase leading-tight">
            Diseñado para que <br /><span className="text-red-brand">funcione bien</span>
          </h2>
          <p className="text-zinc-400 mt-6 text-base leading-relaxed">
            Cada parte del proceso Motoluv existe para que comprador y vendedor tengan una experiencia ordenada y sin fricciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-gradient-to-b from-[#151517] to-[#0d0d0e] hover:from-[#2a2a30] hover:to-[#18181c] border border-black rounded-md p-8 group transition-all duration-300 shadow-md hover:shadow-xl cursor-default"
            >
              <div className="w-11 h-11 rounded-md border border-[#E10600]/40 bg-[#E10600]/10 flex items-center justify-center mb-5 group-hover:border-[#E10600] group-hover:bg-[#E10600]/20 transition-all duration-300">
                <f.icon size={18} className="text-[#E10600]" />
              </div>
              <h3 className="font-display font-bold text-white uppercase tracking-wide text-base mb-3">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED MOTOS */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-24">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="font-display font-bold text-white text-4xl md:text-5xl uppercase leading-tight">
              Motos <span className="text-red-brand">destacadas</span>
            </h2>
          </div>
          <Link to="/motos" className="group inline-flex items-center gap-2 text-white text-xs tracking-widest uppercase hover:text-red-brand transition-colors">
            Ver todas <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((m) => <MotoCard key={m.id} moto={m} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 text-sm">
            Explora todas las motocicletas verificadas disponibles en nuestro catálogo.
          </div>
        )}

        <div className="text-center mt-14">
          <Link to="/motos" className="btn-outline group inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-sm">
            Ver todas las motos <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-70" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `url(${bobberImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7) contrast(1.15)',
          }}
        />
        <div className="absolute inset-0 hero-vignette opacity-80" />

        <div className="relative z-10 max-w-4xl mx-auto px-5 lg:px-8 py-28 text-center">
          <span className="inline-block border border-red-brand/60 text-red-brand text-[11px] tracking-widest uppercase px-3 py-1.5 rounded-full mb-8">
            Sé de los primeros
          </span>
          <h2 className="font-display font-bold text-white text-4xl md:text-6xl uppercase leading-tight">
            Una plataforma <br /><span className="text-red-brand">sin precedentes</span>
          </h2>
          <p className="text-zinc-300 mt-6 max-w-xl mx-auto text-base leading-relaxed">
            Desde el catálogo hasta la entrega, todo ocurre dentro de Motoluv. Ficha técnica, score mecánico, asesor, documentación y seguimiento en un solo lugar.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/registro" className="btn-red group inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-sm">
              Crear cuenta gratis <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/sumate" className="btn-outline inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-sm border-[#E10600]/60 text-white hover:border-[#E10600]">
              Súmate a nuestra red
            </Link>
            <Link to="/motos" className="btn-outline inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-sm">
              Explorar catálogo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
