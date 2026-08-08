import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Handshake, ArrowRight, User, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { partnerApi } from '../services/api';
import { toast } from '../hooks/use-toast';

const LOCATIONS = [
  { id: 'certificacion', label: 'Centro de Certificación' },
  { id: 'accesorios', label: 'Venta de Accesorios' },
  { id: 'partner', label: 'Partner' },
];

const PartnersPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', location: '', message: '',
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.location) {
      toast({ title: 'Datos incompletos', description: 'Nombre, teléfono y ubicación son requeridos.' });
      return;
    }
    setLoading(true);
    try {
      await partnerApi.apply(form);
      setSuccess(true);
      toast({ title: '¡Solicitud enviada!', description: 'Nuestro equipo te contactará muy pronto.' });
    } catch (err) {
      toast({ title: 'Error al enviar', description: err?.response?.data?.detail || 'Intenta de nuevo.' });
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={28} className="text-emerald-400" />
        </div>
        <h1 className="font-display font-bold text-white text-3xl md:text-4xl uppercase mb-4">
          ¡Solicitud <span className="text-red-brand">enviada</span>!
        </h1>
        <p className="text-zinc-400 mb-8">
          Gracias por tu interés en unirte a la red Motoluv. Un miembro de nuestro equipo te contactará en las próximas 48 horas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-outline inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-sm">
            Volver al inicio
          </Link>
          <Link to="/motos" className="btn-red inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-sm">
            Explorar Motos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-14">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div>
          <span className="inline-flex items-center gap-2 border border-red-brand/60 text-red-brand text-[11px] tracking-widest uppercase px-3 py-1.5 rounded-full mb-6">
            <Handshake size={12} /> Red Motoluv
          </span>
          <h1 className="font-display font-bold text-white text-4xl md:text-5xl uppercase leading-tight">
            Súmate a <br /><span className="text-red-brand">nuestra red</span>
          </h1>
          <p className="text-zinc-400 mt-6 text-base leading-relaxed max-w-md">
            ¿Quieres ser parte del ecosistema Motoluv? Estamos creciendo con centros de certificación, tiendas de accesorios y partners estratégicos.
          </p>

          <ul className="mt-10 space-y-5 max-w-md">
            {[
              { title: 'Centro de Certificación', desc: 'Mecánicos certificados que evalúan y validan cada motocicleta con nuestro score técnico.' },
              { title: 'Venta de Accesorios', desc: 'Vende cascos, ropa, equipamiento y refacciones en nuestra tienda oficial.' },
              { title: 'Partner', desc: 'Alianzas estratégicas: financieras, aseguradoras, escuelas de manejo y más.' },
            ].map((it, i) => (
              <li key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-md border border-red-brand/40 bg-red-brand/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-brand font-bold text-sm">{i + 1}</span>
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{it.title}</div>
                  <div className="text-zinc-500 text-xs mt-0.5">{it.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={submit} className="bg-[#111112] border border-white/5 rounded-md p-6 md:p-8">
          <h2 className="font-display font-bold text-white text-2xl uppercase mb-6">Solicitud de alianza</h2>

          <div className="space-y-4">
            <Field icon={User} label="Nombre completo" required value={form.name} onChange={(v) => update('name', v)} placeholder="Tu nombre o el de tu empresa" />
            <Field icon={Phone} label="Teléfono" type="tel" required value={form.phone} onChange={(v) => update('phone', v)} placeholder="+52 55 1234 5678" />
            <Field icon={Mail} label="Email (opcional)" type="email" value={form.email} onChange={(v) => update('email', v)} placeholder="contacto@empresa.mx" />

            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">
                Ubicación en la red <span className="text-red-brand">*</span>
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none z-10" />
                <select value={form.location} onChange={(e) => update('location', e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors">
                  <option value="">Selecciona una ubicación</option>
                  {LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">
                Mensaje (opcional)
              </label>
              <textarea value={form.message} onChange={(e) => update('message', e.target.value)}
                rows={3} placeholder="Cuéntanos más sobre tu propuesta..."
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600 resize-none" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-red group mt-6 w-full inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-4 rounded-sm disabled:opacity-70">
            {loading ? 'Enviando...' : 'Enviar solicitud'}
            {!loading && <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />}
          </button>

          <p className="mt-4 text-[11px] text-zinc-500 leading-relaxed text-center">
            Nuestro equipo de alianzas te contactará en menos de 48 horas hábiles.
          </p>
        </form>
      </div>
    </div>
  );
};

const Field = ({ icon: Icon, label, type = 'text', value, onChange, placeholder, required }) => (
  <div>
    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">
      {label} {required && <span className="text-red-brand">*</span>}
    </label>
    <div className="relative">
      <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600" />
    </div>
  </div>
);

export default PartnersPage;
