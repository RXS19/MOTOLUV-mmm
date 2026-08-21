import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, Check, Bike } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loginWithOAuth } = useAuth();
  const [role, setRole] = useState('both'); // default to 'both' dual profile
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '', city: '', terms: false,
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleOAuth = async (provider) => {
    setOauthLoading(provider);
    try {
      const u = await loginWithOAuth(provider);
      toast({ title: `Registro exitoso con ${provider.toUpperCase()}`, description: `Bienvenido a Motoluv, ${u?.name || 'usuario'}.` });
      setTimeout(() => navigate('/panel'), 400);
    } catch (err) {
      toast({ title: 'Error OAuth', description: err?.message || 'No se pudo registrar.' });
    } finally {
      setOauthLoading(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast({ title: 'Contraseñas no coinciden', description: 'Verifica los datos.' });
      return;
    }
    if (!form.terms) {
      toast({ title: 'Acepta los términos', description: 'Debes aceptar los términos y condiciones.' });
      return;
    }
    setLoading(true);
    try {
      const u = await register({
        name: form.name, email: form.email, phone: form.phone,
        city: form.city, password: form.password, role: 'both',
      });
      toast({ title: '¡Cuenta creada!', description: `Bienvenido a Motoluv, ${u.name.split(' ')[0]}. Tu correo da acceso a Comprador y Vendedor.` });
      setTimeout(() => navigate('/panel'), 500);
    } catch (err) {
      toast({ title: 'Error al registrar', description: err?.response?.data?.detail || 'Intenta nuevamente.' });
    } finally { setLoading(false); }
  };

  const benefits = [
    'Acceso a más de 500 motocicletas verificadas',
    'Score mecánico certificado en cada moto',
    'Un asesor personal coordina tu operación',
    'Transacciones y pagos 100% verificados',
    'Sin contacto directo entre comprador y vendedor',
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="hidden lg:block sticky top-24">
          <span className="inline-block text-red-brand text-[11px] tracking-widest uppercase border border-red-brand/60 rounded-full px-3 py-1.5 mb-6">
            Únete a Motoluv
          </span>
          <h1 className="font-display font-bold text-white text-4xl md:text-5xl uppercase leading-tight">
            Comienza a <br /><span className="text-red-brand">rodar seguro</span>
          </h1>
          <p className="text-zinc-400 mt-5 max-w-md">
            Regístrate gratis y accede al marketplace de motocicletas más seguro de México.
          </p>

          <ul className="mt-10 space-y-4">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-brand/10 border border-red-brand/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={12} className="text-red-brand" />
                </div>
                <span className="text-zinc-300 text-sm">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#111112] border border-white/5 rounded-md p-6 md:p-8">
          <h2 className="font-display font-bold text-white text-2xl uppercase mb-2">Crear cuenta</h2>
          <p className="text-zinc-400 text-xs mb-6">Accede con el mismo correo a tus perfiles de Comprador y Vendedor</p>

          {/* OAuth options */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={Boolean(oauthLoading)}
              className="bg-[#0a0a0a] hover:bg-zinc-900 text-zinc-300 border border-white/10 hover:border-red-brand/40 py-2.5 px-2 rounded-sm text-[11px] font-bold uppercase flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              title="Registrarse con Google"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-.9-1.3-2.1-1.3-3.5z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.1C3.7 19.8 7.5 23 12 23z"/>
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('icloud')}
              disabled={Boolean(oauthLoading)}
              className="bg-[#0a0a0a] hover:bg-zinc-900 text-zinc-300 border border-white/10 hover:border-red-brand/40 py-2.5 px-2 rounded-sm text-[11px] font-bold uppercase flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              title="Registrarse con Apple / iCloud"
            >
              <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.09-3.41-2.73-7.38-7.46-11.92-14.18-7.38-10.87-13.1-22.62-17.16-35.25-4.06-12.63-6.09-24.58-6.09-35.85 0-14.8 3.73-27.18 11.19-37.13 7.46-9.95 16.92-15 28.38-15.15 4.58 0 9.68 1.15 15.3 3.45 5.62 2.3 9.4 3.45 11.34 3.45 1.7 0 5.61-1.22 11.72-3.67 6.11-2.44 11.29-3.56 15.54-3.35 13.62.8 24.34 5.86 32.17 15.18-12.01 7.28-17.89 17.5-17.65 30.65.25 10.37 4.25 19.04 12 26 7.75 6.96 16.95 10.63 27.6 11.01-2.58 7.63-6.03 15.02-10.36 22.18zM119.22 31.81c0-7.38 2.65-14.49 7.95-21.32 5.3-6.84 12.03-10.87 20.19-12.09.25 1.01.38 1.9.38 2.68 0 7.51-2.71 14.72-8.13 21.63-5.42 6.91-12.23 10.9-20.43 11.97-.13-.88-.19-1.84-.19-2.87z"/>
              </svg>
              iCloud
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('facebook')}
              disabled={Boolean(oauthLoading)}
              className="bg-[#0a0a0a] hover:bg-zinc-900 text-zinc-300 border border-white/10 hover:border-red-brand/40 py-2.5 px-2 rounded-sm text-[11px] font-bold uppercase flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              title="Registrarse con Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <span className="relative bg-[#111112] px-3 text-[10px] uppercase tracking-widest text-zinc-500">O crea con correo electrónico</span>
          </div>

          <form onSubmit={submit}>

          <div className="grid grid-cols-2 gap-2 mb-6 bg-[#0a0a0a] border border-white/5 rounded-sm p-1">
            {[
              { id: 'comprador', label: 'Quiero Comprar' },
              { id: 'vendedor', label: 'Quiero Vender' },
            ].map((r) => (
              <button
                key={r.id} type="button" onClick={() => setRole(r.id)}
                className={`py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm transition-colors flex items-center justify-center gap-2 ${
                  role === r.id ? 'bg-red-brand text-white' : 'text-zinc-400 hover:text-red-brand'
                }`}
              >
                <Bike size={13} /> {r.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <Field icon={User} label="Nombre completo" value={form.name} onChange={(v) => update('name', v)} placeholder="Juan Pérez" required />
            <Field icon={Mail} type="email" label="Email" value={form.email} onChange={(v) => update('email', v)} placeholder="juan@correo.mx" required />
            <Field icon={Phone} type="tel" label="Teléfono" value={form.phone} onChange={(v) => update('phone', v)} placeholder="+52 55 1234 5678" required />
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Ciudad</label>
              <select value={form.city} onChange={(e) => update('city', e.target.value)} required className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors">
                <option value="">Selecciona una ciudad</option>
                {['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro', 'Tijuana', 'León', 'Mérida', 'Toluca'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <Field icon={Lock} type="password" label="Contraseña" value={form.password} onChange={(v) => update('password', v)} placeholder="Mínimo 8 caracteres" required />
            <Field icon={Lock} type="password" label="Confirmar contraseña" value={form.confirm} onChange={(v) => update('confirm', v)} required />
          </div>

          <label className="mt-6 flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.terms} onChange={(e) => update('terms', e.target.checked)} className="mt-1 accent-red-500" />
            <span className="text-xs text-zinc-400 leading-relaxed">
              Acepto los <a href="#" className="text-red-brand hover:underline">Términos y Condiciones</a> y la <a href="#" className="text-red-brand hover:underline">Política de Privacidad</a> de Motoluv.
            </span>
          </label>

          <button type="submit" disabled={loading} className="btn-red group mt-6 w-full inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-4 rounded-sm disabled:opacity-70">
            {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
            {!loading && <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />}
          </button>

          <div className="mt-6 text-center text-sm text-zinc-500">
            ¿Ya tienes cuenta? <Link to="/iniciar-sesion" className="text-red-brand hover:underline">Inicia sesión</Link>
          </div>
        </form>
      </div>
    </div>
  </div>
);
};

const Field = ({ icon: Icon, label, type = 'text', value, onChange, placeholder, required }) => (
  <div>
    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">{label}</label>
    <div className="relative">
      <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600"
      />
    </div>
  </div>
);

export default RegisterPage;
