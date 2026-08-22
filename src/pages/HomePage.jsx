import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, Clock, Users, Shield, Wrench, Sparkles, CheckCircle, Eye, FileText, Handshake } from 'lucide-react';
import MotoCard from '../components/MotoCard';
import { motoApi } from '../services/api';

const HomePage = () => {
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
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1920')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(0.2) brightness(0.7) contrast(1.15)',
          }}
        />
        <div className="absolute inset-0 hero-vignette opacity-80" />

        <div className="relative z-10 max-w-5xl mx-auto px-5 lg:px-8 text-center py-24">
          <div className="inline-flex items-center justify-center border border-red-brand/60 text-red-brand text-[11px] font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-10">
            SUBE · CONECTA · RUEDA
          </div>

          <h1 className="hero-title text-white text-5xl md:text-7xl lg:text-8xl uppercase">
            El marketplace
            <br />
            que <span className="text-red-brand">lo cambia todo.</span>
          </h1>

          <p className="mt-8 text-zinc-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Una nueva forma de comprar y vender motocicletas. Regístrate y sé de los primeros en acceder.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/registro"
              className="btn-red group inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-sm"
            >
              Quiero Registrarme
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/como-funciona"
              className="btn-outline inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-sm"
            >
              Cómo Funciona
            </Link>
          </div>

          <div className="mt-20 text-xs tracking-widest text-zinc-500 flex flex-col items-center gap-2">
            DESCUBRIR
            <ArrowDown size={14} className="bounce-arrow" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-white/5 bg-[#0a0a0a]">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 mt-16 border border-white/5">
          {process.map((p) => (
            <div key={p.n} className="bg-[#0a0a0a] p-8 hover:bg-[#111112] transition-colors">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 mt-16 border border-white/5">
          {features.map((f, i) => (
            <div key={i} className="bg-[#0a0a0a] p-8 group hover:bg-[#111112] transition-colors">
              <div className="w-11 h-11 rounded-md border border-[#E10600]/40 bg-[#E10600]/10 flex items-center justify-center mb-5 group-hover:border-[#E10600] transition-colors">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((m) => <MotoCard key={m.id} moto={m} />)}
        </div>

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
          className="absolute inset-0 opacity-55"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(0.3) brightness(0.65) contrast(1.1)',
          }}
        />
        <div className="absolute inset-0 hero-vignette opacity-80" />

        <div className="relative z-10 max-w-4xl mx-auto px-5 lg:px-8 py-28 text-center">
          <span className="inline-flex items-center gap-2 border border-red-brand/60 text-red-brand text-[11px] tracking-widest uppercase px-3 py-1.5 rounded-full mb-8">
            <Sparkles size={12} /> Sé de los primeros
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
              <Handshake size={16} className="text-[#E10600]" />
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
