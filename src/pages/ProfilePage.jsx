import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Shield, 
  CheckCircle2, 
  Save, 
  ArrowLeft, 
  Building2, 
  Lock, 
  AlertCircle, 
  Bike, 
  Tag, 
  Store, 
  Sparkles,
  Repeat
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';
import { MEXICAN_BANKS } from '../data/banks';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, activeView, setActiveView } = useAuth();

  const isSeller = user?.role === 'vendedor' || user?.role === 'both';
  const [showSellerClabe, setShowSellerClabe] = useState(isSeller);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bank_name: user?.bank_name || '',
    bank_clabe: user?.bank_clabe || '',
    bank_holder: user?.bank_holder || user?.name || '',
    role: user?.role || 'both',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bank_name: user.bank_name || '',
        bank_clabe: user.bank_clabe || '',
        bank_holder: user.bank_holder || user.name || '',
        role: user.role || 'both',
      });
      setShowSellerClabe(user.role === 'vendedor' || user.role === 'both');
    }
  }, [user]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast({
        title: 'Nombre requerido',
        description: 'Por favor ingresa tu nombre completo.',
        variant: 'destructive',
      });
      return;
    }

    // Si el usuario es vendedor o tiene habilitada la sección de CLABE y llenó algún campo bancario
    const clabeClean = form.bank_clabe ? form.bank_clabe.replace(/\s/g, '') : '';
    if (showSellerClabe && clabeClean) {
      if (!/^\d{18}$/.test(clabeClean)) {
        toast({
          title: 'CLABE inválida',
          description: 'La CLABE interbancaria debe tener exactamente 18 dígitos numéricos.',
          variant: 'destructive',
        });
        return;
      }
      if (!form.bank_name) {
        toast({
          title: 'Banco requerido',
          description: 'Selecciona la institución bancaria correspondiente a tu CLABE.',
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        role: form.role,
        ...(showSellerClabe
          ? {
              bank_clabe: clabeClean,
              bank_name: form.bank_name,
              bank_holder: form.bank_holder.trim() || form.name.trim(),
            }
          : {}),
      });

      toast({
        title: 'Perfil actualizado',
        description: 'Tus datos se han guardado exitosamente en tu cuenta Motoluv.',
      });
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      toast({
        title: 'Error al actualizar',
        description: err?.message || 'No se pudo guardar la información de tu perfil.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateSeller = () => {
    update('role', 'both');
    setShowSellerClabe(true);
    toast({
      title: 'Modo Vendedor Activado',
      description: 'Ahora puedes registrar tu CLABE interbancaria para recibir los fondos de tus ventas.',
    });
  };

  const initials = (form.name || user?.name || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-5 lg:px-8 space-y-8">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-brand transition-colors"
          >
            <ArrowLeft size={14} /> Volver al panel
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 font-mono">
              ID: {user?.id ? user.id.slice(0, 8) : 'MLV-USER'}
            </span>
          </div>
        </div>

        {/* Profile Card Banner */}
        <div className="bg-[#111112] border border-white/10 rounded-md p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-brand/30 to-red-900/40 border-2 border-red-brand/50 flex items-center justify-center text-red-brand font-display font-extrabold text-2xl sm:text-3xl shadow-lg flex-shrink-0">
                {initials}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display font-black text-white text-2xl sm:text-3xl uppercase tracking-wide">
                    {form.name || 'Mi Perfil'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-brand/10 border border-red-brand/30 text-red-brand">
                    <Shield size={11} /> Cuenta Verificada
                  </span>
                </div>
                <p className="text-zinc-400 text-xs sm:text-sm">{user?.email}</p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500">
                  <span>Rol de cuenta:</span>
                  <span className="text-zinc-300 font-medium">
                    {user?.role === 'vendedor' 
                      ? '🏍️ Vendedor Oficial' 
                      : user?.role === 'comprador' 
                      ? '🛒 Comprador' 
                      : '⭐ Vendedor y Comprador'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Link
                to={activeView === 'vendedor' ? '/panel' : '/panel/mis-ofertas'}
                className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-[#0a0a0a] hover:bg-white/5 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
              >
                Ir a mi Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#111112] border border-white/10 rounded-md p-6 sm:p-8 space-y-6 shadow-xl">
            
            <div className="border-b border-white/5 pb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-white text-lg uppercase tracking-wide flex items-center gap-2">
                  <User size={18} className="text-red-brand" /> Información Personal y de Contacto
                </h2>
                <p className="text-zinc-400 text-xs mt-1">
                  Datos principales vinculados a tu cuenta de cliente en Motoluv
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* NOMBRE */}
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                  <User size={13} className="text-red-brand" /> Nombre Completo <span className="text-red-brand">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Ej. Carlos Mendoza García"
                  required
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600 font-medium"
                />
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  Se utilizará para contratos de compraventa, facturación y contacto oficial.
                </p>
              </div>

              {/* CORREO ELECTRÓNICO */}
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                  <Mail size={13} className="text-red-brand" /> Correo Electrónico <span className="text-red-brand">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="w-full pl-4 pr-10 py-3 bg-[#0a0a0a]/60 border border-white/5 text-zinc-300 text-sm rounded-sm outline-none cursor-not-allowed font-mono"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" title="Correo vinculado y verificado por seguridad">
                    <Lock size={15} className="text-emerald-400" />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-400 inline" /> Correo verificado para inicio de sesión y alertas.
                </p>
              </div>

              {/* TELÉFONO */}
              <div className="md:col-span-2">
                <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                  <Phone size={13} className="text-red-brand" /> Teléfono Móvil / WhatsApp <span className="text-red-brand">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value.replace(/[^0-9+\s()-]/g, ''))}
                    placeholder="Ej. +52 55 1234 5678"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600 font-mono tracking-wide"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  Indispensable para coordinar citas de inspección técnica, entrega de motocicletas y notificaciones en tiempo real.
                </p>
              </div>

            </div>
          </div>

          {/* SECCIÓN CLABE (SOLO PARA VENDEDORES) */}
          <div className="bg-[#111112] border border-white/10 rounded-md p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-white text-lg uppercase tracking-wide flex items-center gap-2">
                    <CreditCard size={18} className="text-red-brand" /> CLABE Interbancaria para Pagos
                  </h2>
                  <span className="px-2 py-0.5 bg-red-brand/10 border border-red-brand/30 text-red-brand text-[10px] font-extrabold uppercase tracking-widest rounded-sm">
                    Solo Vendedores
                  </span>
                </div>
                <p className="text-zinc-400 text-xs mt-1">
                  Cuenta bancaria destino para transferir el pago neto tras concretar la venta de tus motos
                </p>
              </div>

              {form.bank_clabe && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-sm text-emerald-400 text-xs font-bold font-mono">
                  <CheckCircle2 size={13} /> CLABE Activa
                </div>
              )}
            </div>

            {showSellerClabe ? (
              <div className="space-y-6">
                
                {/* Active CLABE highlight if present */}
                {user?.bank_clabe && (
                  <div className="bg-[#0a0a0a] border border-emerald-500/20 rounded-sm p-4 flex items-start gap-3">
                    <Shield size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs space-y-0.5">
                      <div className="text-emerald-300 font-bold">Cuenta de recepción configurada</div>
                      <div className="text-zinc-300 font-mono">
                        {user.bank_name || 'Banco Registrado'} · CLABE ••••••••••••••{user.bank_clabe.slice(-4)}
                      </div>
                      <div className="text-zinc-500 text-[11px]">
                        Titular: {user.bank_holder || user.name}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* BANCO EMISOR */}
                  <div>
                    <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                      <Building2 size={13} className="text-red-brand" /> Banco Receptor <span className="text-red-brand">*</span>
                    </label>
                    <select
                      value={form.bank_name}
                      onChange={(e) => update('bank_name', e.target.value)}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors"
                    >
                      <option value="">Selecciona una institución bancaria</option>
                      {MEXICAN_BANKS.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-zinc-500 mt-1.5">
                      Instituciones autorizadas por CNBV y Banxico (SPEI) en México.
                    </p>
                  </div>

                  {/* CLABE INTERBANCARIA (18 DÍGITOS) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                        <CreditCard size={13} className="text-red-brand" /> CLABE Interbancaria (18 dígitos) <span className="text-red-brand">*</span>
                      </label>
                      <span className={`text-[11px] font-mono ${form.bank_clabe.length === 18 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {form.bank_clabe.length}/18
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={18}
                      value={form.bank_clabe}
                      onChange={(e) => update('bank_clabe', e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="18 dígitos exactos"
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors font-mono tracking-widest placeholder:text-zinc-600"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1.5">
                      Valida que sea tu CLABE estándar SPEI de 18 números.
                    </p>
                  </div>

                  {/* TITULAR DE LA CUENTA */}
                  <div className="md:col-span-2">
                    <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                      <User size={13} className="text-red-brand" /> Nombre Completo del Titular de la Cuenta
                    </label>
                    <input
                      type="text"
                      value={form.bank_holder}
                      onChange={(e) => update('bank_holder', e.target.value)}
                      placeholder={form.name || "Nombre del titular en el estado de cuenta"}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600 font-medium"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1.5">
                      Debe coincidir exactamente con el nombre de la cuenta bancaria para evitar devoluciones en SPEI.
                    </p>
                  </div>

                </div>

                {/* Security Note */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-sm p-4 flex items-start gap-3">
                  <Lock size={15} className="text-red-brand mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    <strong className="text-zinc-300">Privacidad y Seguridad Garantizada:</strong> Tus datos bancarios están cifrados y solo se utilizan para la dispersión de fondos por liquidación de ventas. Motoluv <strong className="text-white">nunca</strong> comparte tu CLABE ni datos bancarios con los compradores.
                  </p>
                </div>
              </div>
            ) : (
              /* Informative Callout for Buyers who don't have Seller mode enabled */
              <div className="bg-[#0a0a0a] border border-white/5 rounded-sm p-6 space-y-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-brand/10 border border-red-brand/30 flex items-center justify-center text-red-brand flex-shrink-0">
                    <Bike size={22} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      ¿Planeas vender motocicletas en Motoluv?
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Tu cuenta está en <strong className="text-zinc-300">Modo Comprador</strong>. Los compradores no requieren registrar CLABE para navegar ni hacer ofertas. Si deseas publicar motocicletas y recibir tus pagos por transferencia SPEI garantizada, activa tu perfil de vendedor.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={handleActivateSeller}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-brand hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors shadow-md"
                  >
                    <Sparkles size={14} /> Habilitar Modo Vendedor y Registrar CLABE
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-zinc-500 text-center sm:text-left">
              Los cambios se sincronizan de inmediato con tu cuenta protegida.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 sm:flex-none px-6 py-3.5 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors text-center"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-red-brand hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-all shadow-lg cursor-pointer"
              >
                <Save size={15} />
                {loading ? 'Guardando...' : 'Guardar Perfil'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ProfilePage;
