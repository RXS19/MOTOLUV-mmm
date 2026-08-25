import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Sparkles,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured, logAuthDiagnostic, fetchUserProfile } from '../lib/supabase';
import { toast } from '../hooks/use-toast';
import { MEXICAN_BANKS } from '../data/banks';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: authContextUser, updateProfile, activeView } = useAuth();
  const loadedUserIdRef = useRef(null);

  // Estados de ciclo de vida: 'loading' | 'loaded' | 'error'
  const [pageStatus, setPageStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Perfil unificado en memoria
  const [profileData, setProfileData] = useState(() => ({
    id: authContextUser?.id || '',
    email: authContextUser?.email || '',
    full_name: authContextUser?.full_name || authContextUser?.name || '',
    name: authContextUser?.full_name || authContextUser?.name || '',
    phone: authContextUser?.phone || '',
    city: authContextUser?.city || 'Ciudad de México',
    role: authContextUser?.role || 'both',
    avatar_url: authContextUser?.avatar_url || '',
    phone_updated_once: Boolean(authContextUser?.phone_updated_once),
    phone_change_count: authContextUser?.phone_change_count || 0,
    bank_clabe: authContextUser?.bank_clabe ? String(authContextUser.bank_clabe) : '',
    bank_name: authContextUser?.bank_name || '',
    bank_holder: authContextUser?.bank_holder || authContextUser?.full_name || authContextUser?.name || '',
    bank_updated_at: authContextUser?.bank_updated_at || null,
    rating: authContextUser?.rating ?? 5.0,
    operations: authContextUser?.operations ?? 0,
    created_at: authContextUser?.created_at || new Date().toISOString(),
    updated_at: authContextUser?.updated_at || new Date().toISOString(),
  }));

  const [showSellerClabe, setShowSellerClabe] = useState(
    authContextUser?.role === 'vendedor' || authContextUser?.role === 'both'
  );

  const [form, setForm] = useState(() => ({
    name: authContextUser?.full_name || authContextUser?.name || '',
    email: authContextUser?.email || '',
    phone: authContextUser?.phone || '',
    city: authContextUser?.city || 'Ciudad de México',
    bank_name: authContextUser?.bank_name || '',
    bank_clabe: authContextUser?.bank_clabe ? String(authContextUser.bank_clabe) : '',
    bank_holder: authContextUser?.bank_holder || authContextUser?.full_name || authContextUser?.name || '',
    role: authContextUser?.role || 'both',
  }));

  /**
   * Carga del Perfil según la arquitectura oficial:
   * 1. Obtener UUID real desde supabase.auth.getUser()
   * 2. Consultar public.profiles (única fuente de verdad)
   * 3. Fallback a auth metadata si no existe registro
   * 4. Si hay errores: NO dejar la pantalla vacía, usar datos de sesión.
   */
  const loadProfile = useCallback(async () => {
    setPageStatus('loading');
    setErrorMessage(null);

    let userId = authContextUser?.id || null;
    let userEmail = authContextUser?.email || '';
    let userMetadata = authContextUser?.raw?.user_metadata || {};

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user: sbUser }, error: sbUserErr } = await supabase.auth.getUser();
        if (sbUser) {
          userId = sbUser.id;
          userEmail = sbUser.email || userEmail;
          userMetadata = sbUser.user_metadata || userMetadata;
        } else if (sbUserErr) {
          console.warn('[ProfilePage] Aviso al consultar auth.getUser():', sbUserErr.message);
        }
      } catch (err) {
        console.warn('[ProfilePage] Excepción en auth.getUser():', err?.message || err);
      }
    }

    if (!userId && authContextUser?.id) {
      userId = authContextUser.id;
    }

    if (!userId) {
      setPageStatus('loaded');
      return;
    }

    loadedUserIdRef.current = userId;

    let profile = null;
    let queryErrorDetected = false;

    try {
      profile = await fetchUserProfile(userId, userMetadata);
    } catch (err) {
      queryErrorDetected = true;
      console.warn('[ProfilePage] Error al obtener perfil desde Supabase:', err);
    }

    const resolvedFullName = profile?.full_name 
      || profile?.name 
      || userMetadata?.full_name 
      || userMetadata?.name 
      || authContextUser?.full_name 
      || authContextUser?.name 
      || (userEmail ? userEmail.split('@')[0] : 'Usuario');

    const resolvedPhone = profile?.phone 
      || userMetadata?.phone 
      || authContextUser?.phone 
      || '';

    const resolvedPhoneUpdatedOnce = Boolean(
      profile?.phone_updated_once 
      ?? userMetadata?.phone_updated_once 
      ?? authContextUser?.phone_updated_once 
      ?? ((profile?.phone_change_count && profile.phone_change_count >= 1) || false)
    );

    const resolvedPhoneChangeCount = profile?.phone_change_count 
      ?? userMetadata?.phone_change_count 
      ?? authContextUser?.phone_change_count 
      ?? (resolvedPhoneUpdatedOnce ? 1 : 0);

    const resolvedCity = profile?.city 
      || userMetadata?.city 
      || authContextUser?.city 
      || 'Ciudad de México';

    const resolvedRole = profile?.role 
      || userMetadata?.role 
      || authContextUser?.role 
      || 'both';

    const resolvedAvatarUrl = profile?.avatar_url 
      || userMetadata?.avatar_url 
      || authContextUser?.avatar_url 
      || '';

    const resolvedBankClabe = profile?.bank_clabe !== undefined && profile?.bank_clabe !== null
      ? String(profile.bank_clabe)
      : (authContextUser?.bank_clabe ? String(authContextUser.bank_clabe) : '');

    const resolvedBankName = profile?.bank_name 
      || userMetadata?.bank_name 
      || authContextUser?.bank_name 
      || '';

    const resolvedBankHolder = profile?.bank_holder 
      || userMetadata?.bank_holder 
      || authContextUser?.bank_holder 
      || resolvedFullName;

    const resolvedBankUpdatedAt = profile?.bank_updated_at 
      || userMetadata?.bank_updated_at 
      || authContextUser?.bank_updated_at 
      || null;

    const resolvedRating = profile?.rating ?? authContextUser?.rating ?? 5.0;
    const resolvedOperations = profile?.operations ?? authContextUser?.operations ?? 0;
    const resolvedCreatedAt = profile?.created_at || authContextUser?.created_at || new Date().toISOString();
    const resolvedUpdatedAt = profile?.updated_at || authContextUser?.updated_at || new Date().toISOString();

    const builtProfile = {
      id: userId,
      email: userEmail,
      full_name: resolvedFullName,
      name: resolvedFullName,
      phone: resolvedPhone,
      city: resolvedCity,
      role: resolvedRole,
      avatar_url: resolvedAvatarUrl,
      phone_updated_once: resolvedPhoneUpdatedOnce,
      phone_change_count: resolvedPhoneChangeCount,
      bank_clabe: resolvedBankClabe,
      bank_name: resolvedBankName,
      bank_holder: resolvedBankHolder,
      bank_updated_at: resolvedBankUpdatedAt,
      rating: resolvedRating,
      operations: resolvedOperations,
      created_at: resolvedCreatedAt,
      updated_at: resolvedUpdatedAt,
    };

    setProfileData(builtProfile);
    setForm({
      name: builtProfile.full_name,
      email: builtProfile.email,
      phone: builtProfile.phone,
      city: builtProfile.city,
      bank_name: builtProfile.bank_name,
      bank_clabe: builtProfile.bank_clabe,
      bank_holder: builtProfile.bank_holder,
      role: builtProfile.role,
    });
    setShowSellerClabe(builtProfile.role === 'vendedor' || builtProfile.role === 'both');

    if (queryErrorDetected) {
      setErrorMessage('La información se cargó desde la sesión local de respaldo.');
      setPageStatus('error');
    } else {
      setPageStatus('loaded');
    }
  }, [authContextUser?.id, authContextUser?.email]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanName = (form.name || '').trim();
    if (!cleanName) {
      toast({
        title: 'Nombre requerido',
        description: 'Por favor ingresa tu nombre completo.',
        variant: 'destructive',
      });
      return;
    }

    // Validación de CLABE si aplica
    const clabeClean = form.bank_clabe ? String(form.bank_clabe).replace(/\s/g, '').replace(/\D/g, '') : '';
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

    setIsSaving(true);
    try {
      // Guardar cambios: actualiza exclusivamente public.profiles
      const updatedUser = await updateProfile({
        name: cleanName,
        phone: (form.phone || '').trim(),
        city: (form.city || '').trim(),
        role: form.role,
        ...(showSellerClabe
          ? {
              bank_clabe: clabeClean,
              bank_name: form.bank_name,
              bank_holder: (form.bank_holder || '').trim() || cleanName,
            }
          : {}),
      });

      // Actualizar estado local inmediato sin recargar la página ni poner pantalla de carga
      setProfileData((prev) => ({
        ...prev,
        ...updatedUser,
        full_name: cleanName,
        name: cleanName,
        phone: (form.phone || '').trim(),
        city: (form.city || '').trim(),
        role: form.role,
        bank_clabe: showSellerClabe ? clabeClean : prev.bank_clabe,
        bank_name: showSellerClabe ? form.bank_name : prev.bank_name,
        bank_holder: showSellerClabe ? ((form.bank_holder || '').trim() || cleanName) : prev.bank_holder,
      }));

      setForm((prev) => ({
        ...prev,
        name: cleanName,
        phone: (form.phone || '').trim(),
        city: (form.city || '').trim(),
        role: form.role,
        bank_clabe: showSellerClabe ? clabeClean : prev.bank_clabe,
        bank_name: showSellerClabe ? form.bank_name : prev.bank_name,
        bank_holder: showSellerClabe ? ((form.bank_holder || '').trim() || cleanName) : prev.bank_holder,
      }));

      toast({
        title: 'Perfil actualizado',
        description: 'Tus datos se han guardado exitosamente en tu cuenta Motoluv.',
      });
    } catch (err) {
      console.error('[ProfilePage] Error al actualizar perfil:', err);
      toast({
        title: 'Error al actualizar',
        description: err?.message || 'No se pudo guardar la información de tu perfil.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivateSeller = () => {
    updateField('role', 'both');
    setShowSellerClabe(true);
    toast({
      title: 'Modo Vendedor Activado',
      description: 'Ahora puedes registrar tu CLABE interbancaria para recibir los fondos de tus ventas.',
    });
  };

  const displayName = form.name || profileData.full_name || profileData.name || 'Usuario Motoluv';
  const initials = String(displayName)
    .split(' ')
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  // SKELETON / LOADING STATE: Muestra la estructura sin dejar pantalla vacía
  if (pageStatus === 'loading') {
    return (
      <div className="min-h-screen py-10" id="profile-loading-view">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 space-y-8 animate-pulse">
          
          {/* Top Bar Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-white/5 rounded"></div>
            <div className="h-4 w-24 bg-white/5 rounded"></div>
          </div>

          {/* Banner Skeleton */}
          <div className="bg-[#111112] border border-white/10 rounded-md p-6 sm:p-8 flex items-center gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 flex-shrink-0"></div>
            <div className="space-y-3 flex-1">
              <div className="h-7 w-48 bg-white/10 rounded"></div>
              <div className="h-4 w-36 bg-white/5 rounded"></div>
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="bg-[#111112] border border-white/10 rounded-md p-6 sm:p-8 space-y-6">
            <div className="h-6 w-56 bg-white/10 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-12 bg-white/5 rounded"></div>
              <div className="h-12 bg-white/5 rounded"></div>
              <div className="h-12 bg-white/5 rounded md:col-span-2"></div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10" id="profile-main-view">
      <div className="max-w-4xl mx-auto px-5 lg:px-8 space-y-8">
        
        {/* Aviso controlado en caso de error o advertencia */}
        {pageStatus === 'error' && errorMessage && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-4 flex items-center justify-between gap-3 text-amber-300 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={loadProfile}
              className="flex items-center gap-1 text-amber-200 hover:text-white font-bold underline cursor-pointer"
            >
              <RefreshCw size={12} /> Reintentar sincronización
            </button>
          </div>
        )}

        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <button 
            id="profile-back-button"
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-brand transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Volver al panel
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 font-mono">
              ID: {profileData.id ? String(profileData.id).slice(0, 8) : 'MLV-USER'}
            </span>
          </div>
        </div>

        {/* Profile Card Banner */}
        <div className="bg-[#111112] border border-white/10 rounded-md p-6 sm:p-8 relative overflow-hidden shadow-xl" id="profile-banner-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-brand/30 to-red-900/40 border-2 border-red-brand/50 flex items-center justify-center text-red-brand font-display font-extrabold text-2xl sm:text-3xl shadow-lg flex-shrink-0">
                {initials}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display font-black text-white text-2xl sm:text-3xl uppercase tracking-wide">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-brand/10 border border-red-brand/30 text-red-brand">
                    <Shield size={11} /> Cuenta Verificada
                  </span>
                </div>
                <p className="text-zinc-400 text-xs sm:text-sm">{profileData.email}</p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500">
                  <span>Rol de cuenta:</span>
                  <span className="text-zinc-300 font-medium">
                    {profileData.role === 'vendedor' 
                      ? '🏍️ Vendedor Oficial' 
                      : profileData.role === 'comprador' 
                      ? '🛒 Comprador' 
                      : '⭐ Vendedor y Comprador'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Link
                id="profile-goto-dashboard"
                to={activeView === 'vendedor' ? '/panel' : '/panel/mis-ofertas'}
                className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-[#0a0a0a] hover:bg-white/5 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
              >
                Ir a mi Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6" id="profile-edit-form">
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
              
              {/* NOMBRE COMPLETO (full_name) */}
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                  <User size={13} className="text-red-brand" /> Nombre Completo <span className="text-red-brand">*</span>
                </label>
                <input
                  id="profile-fullname-input"
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
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
                    id="profile-email-input"
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <Phone size={13} className="text-red-brand" /> Teléfono Móvil / WhatsApp <span className="text-red-brand">*</span>
                  </label>
                  {profileData.phone_updated_once ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Lock size={10} /> Modificación única utilizada
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400/90 font-medium">
                      (1 modificación disponible)
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="profile-phone-input"
                    type="tel"
                    value={form.phone}
                    disabled={Boolean(profileData.phone_updated_once)}
                    onChange={(e) => updateField('phone', e.target.value.replace(/[^0-9+\s()-]/g, ''))}
                    placeholder="Ej. +52 56 4304 8865"
                    className={`w-full px-4 py-3 bg-[#0a0a0a] border text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600 font-mono tracking-wide ${
                      profileData.phone_updated_once
                        ? 'border-white/5 text-zinc-400 cursor-not-allowed bg-[#08080a]'
                        : 'border-white/10 focus:border-red-brand text-white'
                    }`}
                  />
                  {profileData.phone_updated_once && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" title="Número protegido">
                      <Lock size={15} className="text-zinc-500" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  {profileData.phone_updated_once
                    ? 'Por seguridad antifraude en contratos e inspecciones, tu teléfono está verificado. Para una corrección adicional, solicita asistencia a soporte.'
                    : 'Indispensable para coordinar citas de inspección técnica, entrega de motocicletas y alertas. Podrás actualizarlo 1 sola vez por seguridad.'}
                </p>
              </div>

              {/* CIUDAD */}
              <div className="md:col-span-2">
                <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                  <MapPin size={13} className="text-red-brand" /> Ciudad / Ubicación
                </label>
                <input
                  id="profile-city-input"
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Ej. Ciudad de México"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600 font-medium"
                />
              </div>

            </div>
          </div>

          {/* SECCIÓN CLABE (SOLO PARA VENDEDORES) */}
          <div className="bg-[#111112] border border-white/10 rounded-md p-6 sm:p-8 space-y-6 shadow-xl" id="profile-clabe-section">
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
                {profileData.bank_clabe && (
                  <div className="bg-[#0a0a0a] border border-emerald-500/20 rounded-sm p-4 flex items-start gap-3">
                    <Shield size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs space-y-0.5">
                      <div className="text-emerald-300 font-bold">Cuenta de recepción configurada</div>
                      <div className="text-zinc-300 font-mono">
                        {profileData.bank_name || 'Banco Registrado'} · CLABE ••••••••••••••{String(profileData.bank_clabe).slice(-4)}
                      </div>
                      <div className="text-zinc-500 text-[11px]">
                        Titular: {profileData.bank_holder || profileData.full_name || profileData.name}
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
                      id="profile-bank-select"
                      value={form.bank_name}
                      onChange={(e) => updateField('bank_name', e.target.value)}
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
                      <span className={`text-[11px] font-mono ${(form.bank_clabe || '').length === 18 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {(form.bank_clabe || '').length}/18
                      </span>
                    </div>
                    <input
                      id="profile-clabe-input"
                      type="text"
                      maxLength={18}
                      value={form.bank_clabe}
                      onChange={(e) => updateField('bank_clabe', e.target.value.replace(/[^0-9]/g, ''))}
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
                      id="profile-bankholder-input"
                      type="text"
                      value={form.bank_holder}
                      onChange={(e) => updateField('bank_holder', e.target.value)}
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
                    id="profile-activate-seller-btn"
                    type="button"
                    onClick={handleActivateSeller}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-brand hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors shadow-md cursor-pointer"
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
                id="profile-cancel-btn"
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 sm:flex-none px-6 py-3.5 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors text-center cursor-pointer"
              >
                Cancelar
              </button>

              <button
                id="profile-submit-btn"
                type="submit"
                disabled={isSaving}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-red-brand hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-all shadow-lg cursor-pointer"
              >
                <Save size={15} />
                {isSaving ? 'Guardando...' : 'Guardar Perfil'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ProfilePage;
