import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHeartbeat, FaChartPie, FaPlusCircle, FaFileInvoiceDollar, FaUserMd,
  FaCogs, FaSignOutAlt, FaBars, FaTimes, FaUsers, FaFlask, FaClipboardList,
  FaBarcode, FaChevronDown, FaChevronRight, FaBalanceScale, FaPalette,
  FaNetworkWired, FaDownload, FaWhatsapp, FaXRay, FaMoon, FaSun
} from 'react-icons/fa';
import api from './services/api.js';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RegistroInteligente from './components/RegistroInteligente';
import ConsultaRapida from './components/ConsultaRapida';
import Facturas from './components/Facturas';
import PortalMedico from './components/PortalMedico';
import AdminPanel from './components/AdminPanel';
import AdminUsuarios from './components/AdminUsuarios';
import AdminEquipos from './components/AdminEquipos';
import GestionEstudios from './components/GestionEstudios';
import Contabilidad from './components/Contabilidad';
import Resultados from './components/Resultados';
import Imagenologia from './components/Imagenologia';
import DescargarApp from './components/DescargarApp';
import CampanaWhatsApp from './components/CampanaWhatsApp';
import PortalPaciente from './components/PortalPaciente';

const ROLE_COLORS = {
  admin: '#8e44ad',
  medico: '#16a085',
  laboratorio: '#e67e22',
  recepcion: '#2980b9'
};

const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/registro': 'Nuevo Registro',
  '/consulta': 'Consulta Rápida',
  '/facturas': 'Facturas',
  '/medico': 'Portal Médico',
  '/admin': 'Administración',
  '/admin/usuarios': 'Usuarios',
  '/admin/equipos': 'Equipos',
  '/admin/estudios': 'Catálogo de Estudios',
  '/contabilidad': 'Contabilidad',
  '/resultados': 'Resultados',
  '/imagenologia': 'Imagenología',
  '/descargar-app': 'Descargar App',
  '/campana-whatsapp': 'Campañas WhatsApp'
};

function getMenuItems(role) {
  const items = [
    { path: '/', label: 'Dashboard', icon: FaChartPie, roles: ['admin', 'recepcion', 'medico', 'laboratorio'] },
    { path: '/registro', label: 'Nuevo Registro', icon: FaPlusCircle, roles: ['admin', 'recepcion'] },
    { path: '/consulta', label: 'Consulta Rápida', icon: FaBarcode, roles: ['admin', 'recepcion', 'laboratorio'] },
    { path: '/facturas', label: 'Facturas', icon: FaFileInvoiceDollar, roles: ['admin', 'recepcion'] },
    { path: '/medico', label: 'Portal Médico', icon: FaUserMd, roles: ['admin', 'medico'] },
    { path: '/resultados', label: 'Resultados', icon: FaFlask, roles: ['admin', 'medico', 'laboratorio'] },
    { path: '/imagenologia', label: 'Imagenología', icon: FaXRay, roles: ['admin', 'recepcion', 'medico', 'laboratorio'] },
    { path: '/descargar-app', label: 'Descargar App', icon: FaDownload, roles: ['admin', 'recepcion', 'medico', 'laboratorio'] }
  ];
  return items.filter(i => i.roles.includes(role));
}

const ADMIN_SUBMENU = [
  { path: '/admin', label: 'Personalización', icon: FaPalette },
  { path: '/admin/usuarios', label: 'Usuarios', icon: FaUsers },
  { path: '/admin/equipos', label: 'Equipos', icon: FaCogs },
  { path: '/admin/estudios', label: 'Catálogo Estudios', icon: FaClipboardList },
  { path: '/contabilidad', label: 'Contabilidad', icon: FaBalanceScale },
  { path: '/campana-whatsapp', label: 'Campañas WhatsApp', icon: FaWhatsapp }
];

function AppContent({ user, onLogout, darkMode, setDarkMode, empresa }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarHover, setSidebarHover] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const role = user?.role || user?.rol || 'recepcion';
  const expanded = sidebarHover || mobileOpen;
  const menuItems = getMenuItems(role);
  const pageTitle = ROUTE_TITLES[location.pathname] || 'Centro Diagnóstico';

  const closeMobile = () => setMobileOpen(false);

  const handleNav = (path) => {
    navigate(path);
    closeMobile();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 998, display: 'none'
          }}
          className="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
        className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: expanded ? 240 : 64,
          minWidth: expanded ? 240 : 64,
          background: 'linear-gradient(180deg, #0d1f2d 0%, #0f4c75 60%, #1a3a5c 100%)',
          color: '#fff',
          transition: 'width 0.25s ease, min-width 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 999,
          overflow: 'hidden'
        }}
      >
        {/* Logo / Company */}
        <div style={{
          padding: expanded ? '18px 16px' : '18px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', gap: 10, minHeight: 64
        }}>
          {empresa?.logo ? (
            <img src={empresa.logo} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'contain', background: '#fff' }} />
          ) : (
            <FaHeartbeat size={24} style={{ flexShrink: 0 }} />
          )}
          <span style={{
            fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap',
            opacity: expanded ? 1 : 0, transition: 'opacity 0.2s ease',
            overflow: 'hidden'
          }}>
            {empresa?.nombre || 'Centro Diagnóstico'}
          </span>
        </div>

        {/* Menu Items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <div
                key={item.path}
                onClick={() => handleNav(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 20px', cursor: 'pointer',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  borderLeft: active ? '3px solid #3498db' : '3px solid transparent',
                  transition: 'background 0.15s ease'
                }}
                onMouseOver={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={18} style={{ flexShrink: 0, opacity: 0.9 }} />
                <span style={{
                  fontSize: 13, whiteSpace: 'nowrap',
                  opacity: expanded ? 1 : 0, transition: 'opacity 0.2s ease',
                  overflow: 'hidden'
                }}>
                  {item.label}
                </span>
              </div>
            );
          })}

          {/* Admin sub-menu */}
          {role === 'admin' && (
            <>
              <div
                onClick={() => setAdminOpen(!adminOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 20px', cursor: 'pointer',
                  borderLeft: '3px solid transparent',
                  marginTop: 4
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <FaCogs size={18} style={{ flexShrink: 0, opacity: 0.9 }} />
                <span style={{
                  fontSize: 13, whiteSpace: 'nowrap', flex: 1,
                  opacity: expanded ? 1 : 0, transition: 'opacity 0.2s ease',
                  overflow: 'hidden'
                }}>
                  Administración
                </span>
                {expanded && (
                  adminOpen ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />
                )}
              </div>
              {adminOpen && expanded && ADMIN_SUBMENU.map(sub => {
                const SubIcon = sub.icon;
                const active = location.pathname === sub.path;
                return (
                  <div
                    key={sub.path}
                    onClick={() => handleNav(sub.path)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '8px 20px 8px 44px', cursor: 'pointer',
                      background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                      fontSize: 12, transition: 'background 0.15s ease'
                    }}
                    onMouseOver={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    onMouseOut={e => { if (!active) e.currentTarget.style.background = active ? 'rgba(255,255,255,0.12)' : 'transparent'; }}
                  >
                    <SubIcon size={14} style={{ flexShrink: 0, opacity: 0.8 }} />
                    <span style={{ whiteSpace: 'nowrap' }}>{sub.label}</span>
                  </div>
                );
              })}
            </>
          )}
        </nav>

        {/* User footer */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: expanded ? '12px 16px' : '12px',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: ROLE_COLORS[role] || '#555',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, flexShrink: 0
          }}>
            {(user?.nombre || user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          {expanded && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.nombre || user?.name || 'Usuario'}
              </div>
              <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'capitalize' }}>{role}</div>
            </div>
          )}
          {expanded && (
            <FaSignOutAlt
              size={16}
              style={{ cursor: 'pointer', opacity: 0.7, flexShrink: 0 }}
              onClick={onLogout}
              title="Cerrar sesión"
            />
          )}
        </div>
      </aside>

      {/* Main area */}
      <div style={{
        flex: 1,
        marginLeft: window.innerWidth > 768 ? (expanded ? 240 : 64) : 0,
        transition: 'margin-left 0.25s ease',
        display: 'flex', flexDirection: 'column', minHeight: '100vh'
      }}>
        {/* Header */}
        <header style={{
          height: 56, display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: 16,
          background: darkMode ? '#1a1a2e' : '#fff',
          color: darkMode ? '#e0e0e0' : '#333',
          borderBottom: darkMode ? '1px solid #333' : '1px solid #e0e0e0',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 20, color: darkMode ? '#e0e0e0' : '#333',
              display: 'flex', alignItems: 'center'
            }}
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>

          <h1 style={{ fontSize: 17, fontWeight: 600, flex: 1, margin: 0 }}>{pageTitle}</h1>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 18, color: darkMode ? '#f1c40f' : '#555',
              display: 'flex', alignItems: 'center', padding: 6
            }}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* User badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, opacity: 0.8 }}>
              Hola, {(user?.nombre || user?.name || 'Usuario').split(' ')[0]}
            </span>
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 10,
              background: ROLE_COLORS[role] || '#555', color: '#fff',
              textTransform: 'capitalize', fontWeight: 600
            }}>
              {role}
            </span>
          </div>
        </header>

        {/* Content */}
        <main style={{
          flex: 1, padding: 20,
          background: darkMode ? '#121212' : '#f5f6fa',
          color: darkMode ? '#e0e0e0' : '#333'
        }}>
          <Routes>
            <Route path="/" element={<Dashboard darkMode={darkMode} />} />
            <Route path="/registro" element={<RegistroInteligente />} />
            <Route path="/consulta" element={<ConsultaRapida />} />
            <Route path="/facturas" element={<Facturas />} />
            <Route path="/medico" element={<PortalMedico />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/admin/equipos" element={<AdminEquipos />} />
            <Route path="/admin/estudios" element={<GestionEstudios />} />
            <Route path="/contabilidad" element={<Contabilidad />} />
            <Route path="/resultados" element={<Resultados />} />
            <Route path="/imagenologia" element={<Imagenologia />} />
            <Route path="/descargar-app" element={<DescargarApp />} />
            <Route path="/campana-whatsapp" element={<CampanaWhatsApp />} />
          </Routes>
        </main>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .app-sidebar {
            transform: translateX(-100%);
          }
          .app-sidebar.mobile-open {
            transform: translateX(0) !important;
            width: 240px !important;
            min-width: 240px !important;
          }
          .sidebar-overlay {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [empresa, setEmpresa] = useState({});

  const loadEmpresa = useCallback(async () => {
    try {
      const data = await api.getEmpresaInfo();
      if (data && typeof data === 'object') {
        setEmpresa(data);
      }
    } catch {
      // empresa config not available
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Load empresa config when authenticated
  useEffect(() => {
    if (token) loadEmpresa();
  }, [token, loadEmpresa]);

  // Listen for empresa config updates
  useEffect(() => {
    const handler = () => loadEmpresa();
    window.addEventListener('empresa-config-updated', handler);
    return () => window.removeEventListener('empresa-config-updated', handler);
  }, [loadEmpresa]);

  // Dark mode class on body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogin = (data) => {
    const t = data.token || data.access_token;
    const u = data.usuario || data.user;
    if (t && u) {
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
      setToken(t);
      setUser(u);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Portal Paciente detection — public route, no auth needed
  const isPortalPaciente = window.location.pathname === '/portal-paciente' ||
    window.location.pathname === '/mis-resultados';

  if (isPortalPaciente) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/portal-paciente" element={<PortalPaciente />} />
          <Route path="/mis-resultados" element={<PortalPaciente />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (!token || !user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <AppContent
        user={user}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        empresa={empresa}
      />
    </BrowserRouter>
  );
}
