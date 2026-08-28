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
      await loginWithOAuth(provider);
    } catch (err) {
      console.error('Error OAuth:', err);
      toast({ title: 'Error OAuth', description: err?.message || 'No se pudo conectar con el proveedor.' });
      setOauthLoading(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast({ title: 'Nombre requerido', description: 'Por favor ingresa tu nombre completo.', variant: 'destructive' });
      return;
    }
    if (!form.email.trim()) {
      toast({ title: 'Email requerido', description: 'Por favor ingresa un correo electrónico válido.', variant: 'destructive' });
      return;
    }
    const cleanPhoneDigits = form.phone.replace(/[^0-9]/g, '');
    if (!cleanPhoneDigits || cleanPhoneDigits.length < 10) {
      toast({
        title: 'Teléfono obligatorio',
        description: 'Por favor ingresa un número de teléfono / WhatsApp válido de al menos 10 dígitos.',
        variant: 'destructive',
      });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: 'Contraseña muy corta', description: 'La contraseña debe tener al menos 6 caracteres.', variant: 'destructive' });
      return;
    }
    if (form.password !== form.confirm) {
      toast({ title: 'Contraseñas no coinciden', description: 'Por favor verifica que ambas contraseñas sean idénticas.', variant: 'destructive' });
      return;
    }
    if (!form.terms) {
      toast({ title: 'Acepta los términos', description: 'Debes aceptar los términos y condiciones para continuar.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: form.name,
        email: form.email,
        phone: form.phone.trim(),
        city: form.city,
        password: form.password,
        role: role || 'both',
      });

      if (res?.requiresEmailConfirmation) {
        toast({
          title: '¡Cuenta creada!',
          description: 'Te hemos enviado un correo de confirmación. Revisa tu bandeja de entrada para verificar tu cuenta.',
        });
        setTimeout(() => navigate('/iniciar-sesion'), 1800);
      } else {
        toast({
          title: '¡Registro exitoso!',
          description: `Bienvenido a Motoluv, ${res?.name ? res.name.split(' ')[0] : 'usuario'}. Tu cuenta está lista.`,
        });
        setTimeout(() => navigate('/panel'), 400);
      }
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      toast({
        title: 'Error al registrar',
        description: err?.message || 'No fue posible crear la cuenta. Por favor verifica tus datos.',
      });
    } finally {
      setLoading(false);
    }
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
          <div className="mb-6">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={Boolean(oauthLoading)}
              className="w-full bg-[#0a0a0a] hover:bg-zinc-900 text-zinc-300 border border-white/10 hover:border-red-brand/40 py-2.5 px-4 rounded-sm text-xs font-bold uppercase flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50"
              title="Registrarse con Google"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-.9-1.3-2.1-1.3-3.5z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.1C3.7 19.8 7.5 23 12 23z"/>
              </svg>
              {oauthLoading === 'google' ? 'Conectando Google...' : 'Registrarse con Google'}
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
            <Field icon={Phone} type="tel" label="Teléfono / WhatsApp (Obligatorio)" value={form.phone} onChange={(v) => update('phone', v)} placeholder="55 1234 5678" required />
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Ciudad</label>
              <select value={form.city} onChange={(e) => update('city', e.target.value)} required className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors">
                <option value="">Selecciona una ciudad</option>
                {['Ciudad de México', 'Estado de México', 'Nuevo León'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <Field icon={Lock} type="password" label="Contraseña" value={form.password} onChange={(v) => update('password', v)} placeholder="Mínimo 6 caracteres" required />
            <Field icon={Lock} type="password" label="Confirmar contraseña" value={form.confirm} onChange={(v) => update('confirm', v)} required />
          </div>

          <label className="mt-6 flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.terms} onChange={(e) => update('terms', e.target.checked)} className="mt-1 accent-red-500" />
            <span className="text-xs text-zinc-400 leading-relaxed">
              Acepto los <Link to="/aviso-de-privacidad" target="_blank" className="text-red-brand hover:underline">Términos y Condiciones</Link> y la <Link to="/aviso-de-privacidad" target="_blank" className="text-red-brand hover:underline">Política de Privacidad</Link> de Motoluv.
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
