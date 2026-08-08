import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a] mt-24">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <div className="flex items-center justify-center py-1 px-1.5 rounded bg-black/60 border border-white/10 w-fit">
                <img src="/motoluv-logo.jpg" alt="Motoluv" className="h-10 w-auto object-contain rounded-sm" style={{ filter: 'contrast(1.1) brightness(1.05)' }} />
              </div>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              El marketplace más grande de motocicletas en México. Compra y vende de forma segura con nuestra garantía de depósito.
            </p>
            <div className="mt-6 text-xs tracking-[0.3em] text-zinc-500 font-medium">
              SUBE · CONECTA · RUEDA
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-zinc-500 mb-4">Enlaces</h4>
            <ul className="space-y-3 text-sm text-zinc-300">
              <li><Link to="/motos" className="hover:text-red-brand transition-colors">Catálogo de Motos</Link></li>
              <li><Link to="/tienda" className="hover:text-red-brand transition-colors">Tienda de Accesorios</Link></li>
              <li><Link to="/como-funciona" className="hover:text-red-brand transition-colors">Cómo Funciona</Link></li>
              <li><Link to="/registro" className="hover:text-red-brand transition-colors">Vender mi Moto</Link></li>
              <li><Link to="/sumate" className="hover:text-red-brand transition-colors font-medium">Súmate a nuestra red</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-zinc-500 mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex items-center gap-2"><Mail size={14} className="text-red-brand" /> contacto@motoluv.mx</li>
              <li className="flex items-center gap-2"><Phone size={14} className="text-red-brand" /> +52 55 1234 5678</li>
              <li className="flex items-center gap-2"><MapPin size={14} className="text-red-brand" /> Ciudad de México, MX</li>
            </ul>
            <div className="flex gap-3 mt-6">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-red-brand hover:border-red-brand/50 transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div>© 2026 Motoluv. Todos los derechos reservados.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a>
            <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
