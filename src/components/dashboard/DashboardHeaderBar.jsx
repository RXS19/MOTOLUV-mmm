import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Plus, ChevronDown, User, LogOut, Shield, Repeat, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { notificationApi } from '../../services/api';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (isNaN(diffMs) || diffMs < 0) return 'Ahora';
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} d`;
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
};

const DashboardHeaderBar = ({ mode = 'comprador' }) => {
  const { user, logout, activeView, setActiveView } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const isBuyer = mode === 'comprador';

  const getInitials = (name) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const initials = getInitials(user?.name);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch real unread notifications from Supabase and subscribe to Realtime
  useEffect(() => {
    let channel = null;

    const loadRealNotifications = async () => {
      try {
        const notifs = await notificationApi.getUnread();
        setNotifications(Array.isArray(notifs) ? notifs : []);
      } catch (err) {
        console.warn('Error fetching notifications:', err);
      }
    };

    loadRealNotifications();

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const currentUserId = session?.user?.id;
        if (!currentUserId) return;

        channel = supabase
          .channel(`public:notifications:recipient:${currentUserId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
            },
            (payload) => {
              const record = payload.new || payload.old || {};
              const targetRecipient = record.recipient_id || record.user_id;

              // Filtrar únicamente eventos destinados a este usuario
              if (targetRecipient && String(targetRecipient) !== String(currentUserId)) {
                return;
              }

              if (payload.eventType === 'INSERT') {
                const newRecord = payload.new;
                if (!newRecord.read_at) {
                  setNotifications((prev) => {
                    if (prev.some((p) => String(p.id) === String(newRecord.id))) return prev;
                    return [
                      {
                        id: String(newRecord.id),
                        recipient_id: newRecord.recipient_id || newRecord.user_id,
                        user_id: newRecord.user_id || newRecord.recipient_id,
                        type: newRecord.type,
                        title: newRecord.title || 'Notificación',
                        body: newRecord.body || newRecord.message || '',
                        message: newRecord.body || newRecord.message || '',
                        desc: newRecord.body || newRecord.message || '',
                        moto_id: newRecord.moto_id,
                        apartado_id: newRecord.apartado_id,
                        offer_id: newRecord.offer_id,
                        created_at: newRecord.created_at,
                        read_at: newRecord.read_at,
                        unread: true,
                      },
                      ...prev,
                    ];
                  });
                }
              } else if (payload.eventType === 'UPDATE') {
                const updatedRecord = payload.new;
                if (updatedRecord.read_at) {
                  setNotifications((prev) =>
                    prev.filter((p) => String(p.id) !== String(updatedRecord.id))
                  );
                }
              } else if (payload.eventType === 'DELETE') {
                const deletedRecord = payload.old;
                setNotifications((prev) =>
                  prev.filter((p) => String(p.id) !== String(deletedRecord.id))
                );
              }
            }
          )
          .subscribe();
      });
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id]);

  const handleNotificationClick = async (notif) => {
    // 1. Optimistically remove from state & counter
    setNotifications((prev) => prev.filter((n) => String(n.id) !== String(notif.id)));
    // 2. Persist read_at in Supabase
    try {
      await notificationApi.markAsRead(notif.id);
    } catch (err) {
      console.warn('Error marking notification as attended:', err);
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="flex items-center justify-end gap-3 pb-6 border-b border-white/5">
      {/* View Switcher Pill */}
      <div className="hidden sm:flex items-center bg-[#111114] p-1 rounded-lg border border-white/5 text-xs font-medium text-zinc-400">
        <button
          onClick={() => setActiveView('comprador')}
          className={`px-3 py-1.5 rounded-md transition-all ${
            isBuyer
              ? 'bg-red-brand/15 text-red-brand font-semibold border border-red-brand/30'
              : 'hover:text-white'
          }`}
        >
          Vista Comprador
        </button>
        <button
          onClick={() => setActiveView('vendedor')}
          className={`px-3 py-1.5 rounded-md transition-all ${
            !isBuyer
              ? 'bg-red-brand/15 text-red-brand font-semibold border border-red-brand/30'
              : 'hover:text-white'
          }`}
        >
          Vista Vendedor
        </button>
      </div>

      {/* Notifications Dropdown */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2.5 bg-[#111114] hover:bg-white/5 text-zinc-300 hover:text-white rounded-lg border border-white/5 transition-colors"
          title="Notificaciones"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#0a0a0c]">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-[#121216] border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Notificaciones</h4>
              <span className="text-[10px] text-zinc-400">{unreadCount > 0 ? `${unreadCount} nuevas` : 'Al día'}</span>
            </div>
            <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-zinc-500 text-xs">
                  No tienes notificaciones pendientes
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNotificationClick(n);
                      }
                    }}
                    className="p-2.5 rounded-lg text-xs transition-colors bg-red-brand/5 border border-red-brand/20 hover:bg-red-brand/10 hover:border-red-brand/40 cursor-pointer block text-left outline-none"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-white text-[11px] leading-tight">{n.title}</span>
                      <span className="text-[10px] text-zinc-500 whitespace-nowrap">{n.time || formatTimeAgo(n.created_at)}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{n.body || n.desc || n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Primary Action: Publicar mi moto */}
      <Link
        to="/panel/publicar"
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-brand hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-red-brand/20"
      >
        <Plus size={14} className="stroke-[2.5]" />
        <span>Publicar mi moto</span>
      </Link>

      {/* User Avatar & Dropdown */}
      <div className="relative" ref={userRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 p-1.5 bg-[#111114] hover:bg-white/5 border border-white/5 rounded-lg transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#1e1e24] text-white text-xs font-bold flex items-center justify-center border border-white/10">
            {initials}
          </div>
          <ChevronDown size={13} className="text-zinc-400 mr-1" />
        </button>

        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-[#121216] border border-white/10 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="px-3 py-2 border-b border-white/5">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Usuario Motoluv'}</p>
              <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <Link
                to="/panel/perfil"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <User size={14} className="text-red-brand" />
                <span>Mi Perfil</span>
              </Link>
              <button
                onClick={() => {
                  setActiveView(isBuyer ? 'vendedor' : 'comprador');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
              >
                <Repeat size={14} className="text-zinc-400" />
                <span>Cambiar a {isBuyer ? 'Vendedor' : 'Comprador'}</span>
              </button>
            </div>
            <div className="pt-1 border-t border-white/5">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
              >
                <LogOut size={14} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeaderBar;
