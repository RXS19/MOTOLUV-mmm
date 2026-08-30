import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, ArrowLeft, Save, Shield, User, ShieldCheck, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';
import { MEXICAN_BANKS } from '../data/banks';
import { authApi } from '../services/api';

const BankAccountPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, updateBank, refreshProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const [form, setForm] = useState({
    clabe: user?.bank_clabe || '',
    bank_name: user?.bank_name || '',
    holder: user?.bank_holder || user?.full_name || user?.name || '',
  });

  const hasAccount = !!(user?.bank_clabe || form.clabe);
  const isVerified = Boolean(user?.bank_account_verified);

  // Sincronizar form si el usuario carga de forma asíncrona
  useEffect(() => {
    if (user?.bank_clabe && !form.clabe) {
      setForm({
        clabe: user.bank_clabe || '',
        bank_name: user.bank_name || '',
        holder: user.bank_holder || user.full_name || user.name || '',
      });
    }
  }, [user]);

  // Verificar estado real desde backend al regresar de la validación
  useEffect(() => {
    const isReturn = searchParams.get('verify_return') === 'true';
    const isRefresh = searchParams.get('verify_refresh') === 'true';

    if (isReturn || isRefresh) {
      const runVerificationCheck = async () => {
        setCheckingStatus(true);
        try {
          const res = await authApi.checkBankVerificationStatus();
          if (refreshProfile) {
            await refreshProfile();
          }

          if (res?.bank_account_verified) {
            toast({
              title: 'Cuenta verificada con éxito',
              description: 'Tu cuenta ha sido validada para recibir transferencias de ventas.',
            });
          } else {
            toast({
              title: 'Verificación en proceso',
              description: 'La validación no ha concluido aún. Puedes completarla cuando lo desees.',
            });
          }
        } catch (err) {
          console.error('Error al comprobar estado de verificación:', err);
          toast({
            title: 'Aviso',
            description: 'No se pudo confirmar el estado de verificación. Intenta nuevamente.',
          });
        } finally {
          setCheckingStatus(false);
          setSearchParams({}, { replace: true });
        }
      };

      runVerificationCheck();
    }
  }, [searchParams, setSearchParams, refreshProfile]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const clabeClean = form.clabe.replace(/\s/g, '');
    if (!/^\d{18}$/.test(clabeClean)) {
      toast({ title: 'CLABE inválida', description: 'La CLABE debe tener exactamente 18 dígitos.' });
      return;
    }
    if (!form.bank_name) {
      toast({ title: 'Selecciona un banco', description: 'Elige el banco correspondiente a tu CLABE.' });
      return;
    }
    if (!form.holder.trim()) {
      toast({ title: 'Titular requerido', description: 'Indica el nombre del titular de la cuenta.' });
      return;
    }

    setLoading(true);
    try {
      await updateBank({
        clabe: clabeClean,
        bank_name: form.bank_name,
        holder: form.holder.trim(),
      });
      setSavedSuccessfully(true);
      toast({ 
        title: 'Cuenta bancaria guardada', 
        description: 'Tus datos se guardaron de forma segura. Ahora puedes verificar tu cuenta.' 
      });
    } catch (err) {
      console.error('Error al actualizar cuenta bancaria:', err);
      toast({ title: 'Error', description: err?.message || 'No se pudo guardar la cuenta bancaria.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartVerification = async () => {
    setVerifying(true);
    try {
      const res = await authApi.startBankVerification();
      if (res?.url) {
        window.location.href = res.url;
      } else {
        throw new Error('No se pudo generar el enlace de verificación.');
      }
    } catch (err) {
      console.error('Error al iniciar verificación:', err);
      toast({
        title: 'Error de verificación',
        description: err?.message || 'No fue posible iniciar el proceso de verificación.',
      });
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 py-10">
      <button 
        id="bank-account-back-btn"
        onClick={() => navigate(-1)} 
        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-brand transition-colors mb-4 cursor-pointer"
      >
        <ArrowLeft size={12} /> Volver
      </button>

      <div className="mb-8">
        <h1 className="font-display font-bold text-white text-3xl md:text-4xl uppercase">
          Cuenta <span className="text-red-brand">Bancaria</span>
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">Aquí recibirás los pagos de tus motos vendidas a través de Motoluv.</p>
      </div>

      {checkingStatus && (
        <div className="bg-white/5 border border-white/10 rounded-md p-4 mb-6 flex items-center gap-3">
          <Loader2 size={18} className="text-red-brand animate-spin" />
          <span className="text-zinc-300 text-sm">Comprobando estado de verificación de tu cuenta...</span>
        </div>
      )}

      {isVerified ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-md p-4 mb-6 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-emerald-300 text-sm font-bold uppercase tracking-wide">Cuenta bancaria verificada</div>
            <div className="text-zinc-300 text-xs mt-1">
              {user?.bank_name || form.bank_name} · CLABE terminada en ••••{String(user?.bank_clabe || form.clabe || '').slice(-4)}
            </div>
            <div className="text-emerald-400/80 text-[11px] mt-1">
              Habilitada para recibir transferencias de ventas de forma automática.
            </div>
          </div>
        </div>
      ) : hasAccount ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-4 mb-6 flex items-start gap-3">
          <ShieldAlert size={18} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-amber-300 text-sm font-medium">Cuenta bancaria guardada · Pendiente de verificación</div>
            <div className="text-zinc-400 text-xs mt-0.5">
              {user?.bank_name || form.bank_name} · CLABE terminada en ••••{String(user?.bank_clabe || form.clabe || '').slice(-4)}
            </div>
            <div className="text-amber-400/90 text-[11px] mt-1">
              Para recibir transferencias directas de compradores, completa la verificación de tu cuenta.
            </div>
          </div>
        </div>
      ) : null}

      <form onSubmit={submit} className="bg-[#111112] border border-white/5 rounded-md p-6 md:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-red-brand" />
            <h2 className="font-display font-bold text-white uppercase tracking-wide text-sm">Datos de la cuenta</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">
                Banco <span className="text-red-brand">*</span>
              </label>
              <select 
                id="bank-name-select"
                value={form.bank_name} 
                onChange={(e) => update('bank_name', e.target.value)} 
                required
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors"
              >
                <option value="">Selecciona un banco</option>
                {MEXICAN_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <p className="text-[11px] text-zinc-500 mt-1.5">Bancos e instituciones autorizadas para operar en México (CNBV / Banxico).</p>
            </div>

            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">
                CLABE Interbancaria <span className="text-red-brand">*</span>
              </label>
              <input 
                id="bank-clabe-input"
                value={form.clabe} 
                onChange={(e) => update('clabe', e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={18} 
                placeholder="18 dígitos" 
                required
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600 font-mono tracking-wider" 
              />
              <p className="text-[11px] text-zinc-500 mt-1.5">18 dígitos exactos. Se valida contra el estándar SPEI.</p>
            </div>

            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">
                Titular de la cuenta <span className="text-red-brand">*</span>
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  id="bank-holder-input"
                  value={form.holder} 
                  onChange={(e) => update('holder', e.target.value)} 
                  required
                  placeholder="Nombre completo del titular"
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-sm p-4 flex items-start gap-3">
          <Shield size={14} className="text-red-brand mt-0.5" />
          <p className="text-xs text-zinc-400 leading-relaxed">
            Tus datos bancarios están cifrados y solo se usan para transferir el pago cuando concretes una venta. Motoluv NUNCA compartirá esta información con el comprador.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button 
            type="button" 
            id="bank-cancel-btn"
            onClick={() => navigate(-1)} 
            className="btn-outline flex-1 sm:flex-initial text-xs font-bold tracking-widest uppercase px-6 py-3.5 rounded-sm"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            id="bank-save-btn"
            disabled={loading} 
            className="btn-red flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-6 py-3.5 rounded-sm disabled:opacity-70"
          >
            <Save size={14} /> {loading ? 'Guardando...' : (hasAccount ? 'Actualizar cuenta' : 'Guardar cuenta')}
          </button>
        </div>

        {/* Botón VERIFICAR TU CUENTA mostrado tras guardar exitosamente o cuando la cuenta no esté verificada aún */}
        {(savedSuccessfully || (hasAccount && !isVerified)) && (
          <div className="pt-6 border-t border-white/10 space-y-4">
            <div className="bg-gradient-to-r from-red-brand/15 to-transparent border border-red-brand/30 rounded-md p-4 flex items-start gap-3">
              <ShieldCheck size={20} className="text-red-brand shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-white font-medium text-sm">
                  Validación requerida para recibir transferencias
                </div>
                <p className="text-xs text-zinc-400">
                  Para habilitar los depósitos de tus motos vendidas, realiza la verificación de identidad y cuenta.
                </p>
              </div>
            </div>

            <button
              type="button"
              id="verify-bank-account-btn"
              onClick={handleStartVerification}
              disabled={verifying || loading || checkingStatus}
              className="w-full bg-red-brand hover:bg-red-600 active:scale-[0.99] text-white py-3.5 px-6 font-display font-bold tracking-widest uppercase text-xs rounded-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-brand/20 disabled:opacity-50 cursor-pointer"
            >
              {verifying ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  INICIANDO VERIFICACIÓN...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  VERIFICAR TU CUENTA
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default BankAccountPage;
