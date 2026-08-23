import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Plus, ChevronDown, User, LogOut, Shield, Repeat, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardHeaderBar = ({ mode = 'comprador' }) => {
  const { user, logout, activeView, setActiveView } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const isBuyer = mode === 'comprador';

  const getInitials = (name) => {
    if (!name) return isBuyer ? 'PC' : 'LR';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
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

  const notifications = [
    {
      id: 1,
      title: 'Inspección certificada en curso',
      desc: 'El especialista técnico está validando el peritaje y certificación vehicular.',
      time: 'Hace 2h',
      unread: true,
    },
    {
      id: 2,
      title: 'Nueva actualización de oferta',
      desc: 'El vendedor ha recibido y revisado tu propuesta de compra.',
      time: 'Hace 5h',
      unread: true,
    },
    {
      id: 3,
      title: 'Protección Motoluv Activa',
      desc: 'Tu cobertura de garantía mecánica por 30 días está vigente.',
      time: 'Ayer',
      unread: false,
    },
  ];

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
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#0a0a0c]">
            2
          </span>
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-[#121216] border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Notificaciones</h4>
              <span className="text-[10px] text-red-brand font-semibold">2 nuevas</span>
            </div>
            <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-2.5 rounded-lg text-xs transition-colors ${
                    n.unread ? 'bg-red-brand/5 border border-red-brand/20' : 'bg-white/[0.02] border border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-white text-[11px] leading-tight">{n.title}</span>
                    <span className="text-[10px] text-zinc-500 whitespace-nowrap">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{n.desc}</p>
                </div>
              ))}
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
