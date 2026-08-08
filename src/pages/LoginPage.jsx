import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <div className="text-center mb-10">
        <h1 className="font-display font-bold text-white text-3xl md:text-4xl uppercase">
          Iniciar <span className="text-red-brand">sesión</span>
        </h1>
        <p className="text-zinc-400 mt-3 text-sm">Accede a tu cuenta Motoluv</p>
      </div>

      <form onSubmit={submit} className="bg-[#111112] border border-white/5 rounded-md p-6 md:p-8 space-y-4">
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
          {loading ? 'Entrando...' : 'Entrar'}
          {!loading && <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />}
        </button>

        <div className="text-center text-sm text-zinc-500 pt-4 border-t border-white/5">
          ¿No tienes cuenta? <Link to="/registro" className="text-red-brand hover:underline">Regístrate gratis</Link>
        </div>
      </form>

      <div className="mt-6 text-center text-[11px] text-zinc-600">
        Cuenta demo: <span className="text-zinc-400">demo@motoluv.mx</span> / <span className="text-zinc-400">demo1234</span>
      </div>
    </div>
  );
};

export default LoginPage;
