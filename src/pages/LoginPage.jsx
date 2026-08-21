import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast({ title: 'Bienvenido de vuelta', description: `Hola ${u.name.split(' ')[0]}, sesión iniciada.` });
      setTimeout(() => navigate('/panel'), 400);
    } catch (err) {
      toast({ title: 'Error al iniciar sesión', description: err?.response?.data?.detail || 'Verifica tus credenciales.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setOauthLoading(provider);
    try {
      const u = await loginWithOAuth(provider);
      toast({ title: `Acceso con ${provider.toUpperCase()}`, description: `Bienvenido a Motoluv, ${u?.name || 'usuario'}.` });
      setTimeout(() => navigate('/panel'), 400);
    } catch (err) {
      toast({ title: 'Error OAuth', description: err?.message || 'No se pudo completar el inicio de sesión.' });
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <div className="text-center mb-8">
        <h1 className="font-display font-bold text-white text-3xl md:text-4xl uppercase">
          Iniciar <span className="text-red-brand">sesión</span>
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Accede a tu cuenta Motoluv</p>
      </div>

      <div className="bg-[#111112] border border-white/5 rounded-md p-6 md:p-8 space-y-5">
        {/* Social / OAuth Logins */}
        <div className="space-y-2.5">
          <label className="text-xs text-zinc-500 uppercase tracking-widest block text-center mb-2">
            Iniciar sesión rápido con
          </label>
          
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={Boolean(oauthLoading)}
            className="w-full bg-[#0a0a0a] hover:bg-zinc-900 text-zinc-200 border border-white/10 hover:border-red-brand/40 transition-colors py-3 px-4 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-.9-1.3-2.1-1.3-3.5z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.1C3.7 19.8 7.5 23 12 23z"/>
            </svg>
            {oauthLoading === 'google' ? 'Conectando Google...' : 'Continuar con Google'}
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('icloud')}
            disabled={Boolean(oauthLoading)}
            className="w-full bg-[#0a0a0a] hover:bg-zinc-900 text-zinc-200 border border-white/10 hover:border-red-brand/40 transition-colors py-3 px-4 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.09-3.41-2.73-7.38-7.46-11.92-14.18-7.38-10.87-13.1-22.62-17.16-35.25-4.06-12.63-6.09-24.58-6.09-35.85 0-14.8 3.73-27.18 11.19-37.13 7.46-9.95 16.92-15 28.38-15.15 4.58 0 9.68 1.15 15.3 3.45 5.62 2.3 9.4 3.45 11.34 3.45 1.7 0 5.61-1.22 11.72-3.67 6.11-2.44 11.29-3.56 15.54-3.35 13.62.8 24.34 5.86 32.17 15.18-12.01 7.28-17.89 17.5-17.65 30.65.25 10.37 4.25 19.04 12 26 7.75 6.96 16.95 10.63 27.6 11.01-2.58 7.63-6.03 15.02-10.36 22.18zM119.22 31.81c0-7.38 2.65-14.49 7.95-21.32 5.3-6.84 12.03-10.87 20.19-12.09.25 1.01.38 1.9.38 2.68 0 7.51-2.71 14.72-8.13 21.63-5.42 6.91-12.23 10.9-20.43 11.97-.13-.88-.19-1.84-.19-2.87z"/>
            </svg>
            {oauthLoading === 'icloud' ? 'Conectando Apple/iCloud...' : 'Continuar con Apple / iCloud'}
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('facebook')}
            disabled={Boolean(oauthLoading)}
            className="w-full bg-[#0a0a0a] hover:bg-zinc-900 text-zinc-200 border border-white/10 hover:border-red-brand/40 transition-colors py-3 px-4 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {oauthLoading === 'facebook' ? 'Conectando Facebook...' : 'Continuar con Facebook'}
          </button>
        </div>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <span className="relative bg-[#111112] px-3 text-[11px] uppercase tracking-widest text-zinc-500">O ingresa con tu correo</span>
        </div>

        {/* Notice of Dual Profile Capability */}
        <div className="p-3 bg-red-brand/10 border border-red-brand/20 rounded-sm flex items-start gap-2.5">
          <ShieldCheck size={16} className="text-red-brand mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-zinc-300 leading-snug">
            <strong className="text-white">Perfil Dual Motoluv:</strong> Tu correo te da acceso simultáneo a tu <strong className="text-red-brand">Perfil de Comprador</strong> (ofertas y compras) y tu <strong className="text-red-brand">Perfil de Vendedor</strong> (publicaciones y pagos), manteniendo tu información totalmente separada.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="tucorreo@ejemplo.mx"
                className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-zinc-500 uppercase tracking-widest">Contraseña</label>
              <a href="#" className="text-xs text-red-brand hover:underline">¿Olvidaste?</a>
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                placeholder="Tu contraseña"
                className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-red group w-full inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-4 rounded-sm disabled:opacity-70">
            {loading ? 'Entrando...' : 'Entrar con correo'}
            {!loading && <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />}
          </button>
        </form>

        <div className="text-center text-sm text-zinc-500 pt-4 border-t border-white/5">
          ¿No tienes cuenta? <Link to="/registro" className="text-red-brand hover:underline font-semibold">Regístrate gratis</Link>
        </div>
      </div>

      <div className="mt-6 text-center text-[11px] text-zinc-600">
        Cuenta demo: <span className="text-zinc-400">demo@motoluv.mx</span> / <span className="text-zinc-400">demo1234</span>
      </div>
    </div>
  );
};

export default LoginPage;
