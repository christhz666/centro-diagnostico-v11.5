import React, { useState, useEffect, useCallback } from 'react';
import { FaUser, FaLock, FaHeartbeat, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import api from '../services/api.js';

const COLORS = {
  dark: '#0d2137',
  mid: '#1a3a5c',
  blue: '#2980b9',
  sky: '#87CEEB',
};

function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: Math.random() * 10 + 10,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: var(--p-opacity); }
          90% { opacity: var(--p-opacity); }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }
      `}</style>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: COLORS.sky,
            left: `${p.left}%`,
            bottom: 0,
            '--p-opacity': p.opacity,
            opacity: 0,
            animation: `floatUp ${p.duration}s ${p.delay}s infinite ease-in`,
          }}
        />
      ))}
    </div>
  );
}

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [empresaConfig, setEmpresaConfig] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Load saved credentials on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('savedUsername');
    const savedPass = localStorage.getItem('savedPassword');
    if (savedUser) {
      setUsername(savedUser);
      setPassword(savedPass || '');
      setRememberMe(true);
    }
  }, []);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load empresa config
  useEffect(() => {
    async function loadEmpresa() {
      try {
        const data = await fetch('/api/configuracion/empresa').then(r => r.json());
        const config = data.data || data.empresa || data;
        setEmpresaConfig(config);
      } catch {
        // empresa config is optional
      }
    }
    loadEmpresa();
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor ingrese usuario y contraseña');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.login({ username, password });

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('savedUsername', username);
        localStorage.setItem('savedPassword', password);
      } else {
        localStorage.removeItem('savedUsername');
        localStorage.removeItem('savedPassword');
      }

      // Open caja in background
      api.request('/caja/abrir', { method: 'POST' }).catch(err => console.error('Failed to open caja:', err));

      onLogin(data.usuario, data.access_token);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }, [username, password, rememberMe, onLogin]);

  const primaryColor = empresaConfig.color_primario || COLORS.blue;
  const secondaryColor = empresaConfig.color_secundario || COLORS.sky;
  const companyName = empresaConfig.nombre || 'Centro Diagnóstico';
  const logoUrl = empresaConfig.logo_login || null;

  const styles = {
    wrapper: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.mid} 50%, ${COLORS.dark} 100%)`,
      position: 'relative',
    },
    container: {
      flex: 1,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '20px' : '40px',
      position: 'relative',
      zIndex: 1,
    },
    leftPanel: {
      flex: isMobile ? 'none' : 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '20px 0' : '40px',
      textAlign: 'center',
      color: '#fff',
      maxWidth: isMobile ? '100%' : '500px',
    },
    logo: {
      width: isMobile ? 80 : 120,
      height: isMobile ? 80 : 120,
      objectFit: 'contain',
      marginBottom: 20,
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    },
    companyName: {
      fontSize: isMobile ? 22 : 32,
      fontWeight: 700,
      marginBottom: 10,
      background: `linear-gradient(90deg, #fff, ${secondaryColor})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    tagline: {
      fontSize: isMobile ? 14 : 16,
      opacity: 0.7,
      lineHeight: 1.6,
    },
    rightPanel: {
      flex: isMobile ? 'none' : 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: isMobile ? '100%' : 'auto',
      maxWidth: 440,
    },
    formCard: {
      width: '100%',
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.1)',
      padding: isMobile ? '30px 24px' : '40px 36px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    formTitle: {
      color: '#fff',
      fontSize: 22,
      fontWeight: 600,
      marginBottom: 8,
      textAlign: 'center',
    },
    formSubtitle: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 28,
    },
    inputGroup: {
      position: 'relative',
      marginBottom: 18,
    },
    inputIcon: {
      position: 'absolute',
      left: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'rgba(255,255,255,0.4)',
      fontSize: 16,
      pointerEvents: 'none',
    },
    input: {
      width: '100%',
      padding: '14px 44px',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 12,
      color: '#fff',
      fontSize: 15,
      outline: 'none',
      transition: 'border-color 0.2s, background 0.2s',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
    },
    eyeButton: {
      position: 'absolute',
      right: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: 'rgba(255,255,255,0.4)',
      cursor: 'pointer',
      padding: 4,
      fontSize: 16,
      display: 'flex',
      alignItems: 'center',
    },
    rememberRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 22,
      color: 'rgba(255,255,255,0.6)',
      fontSize: 14,
      cursor: 'pointer',
      userSelect: 'none',
    },
    checkbox: {
      width: 18,
      height: 18,
      accentColor: primaryColor,
      cursor: 'pointer',
    },
    submitButton: {
      width: '100%',
      padding: '14px',
      background: `linear-gradient(135deg, ${primaryColor}, ${COLORS.mid})`,
      color: '#fff',
      border: 'none',
      borderRadius: 12,
      fontSize: 16,
      fontWeight: 600,
      cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: `0 4px 20px ${primaryColor}44`,
      opacity: loading ? 0.7 : 1,
      fontFamily: 'inherit',
    },
    errorBox: {
      background: 'rgba(231,76,60,0.15)',
      border: '1px solid rgba(231,76,60,0.3)',
      color: '#e74c3c',
      padding: '10px 14px',
      borderRadius: 10,
      marginBottom: 18,
      fontSize: 14,
      textAlign: 'center',
    },
    footer: {
      textAlign: 'center',
      padding: '16px 20px',
      color: 'rgba(255,255,255,0.35)',
      fontSize: 13,
      position: 'relative',
      zIndex: 1,
      borderTop: '1px solid rgba(255,255,255,0.05)',
    },
  };

  return (
    <div style={styles.wrapper}>
      <Particles />

      <div style={styles.container}>
        {/* Left Panel - Company Info */}
        <div style={styles.leftPanel}>
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} style={styles.logo} />
          ) : (
            <div
              style={{
                ...styles.logo,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                fontSize: isMobile ? 36 : 48,
                color: '#fff',
              }}
            >
              <FaHeartbeat />
            </div>
          )}
          <h1 style={styles.companyName}>{companyName}</h1>
          {!isMobile && (
            <p style={styles.tagline}>
              Sistema integral de gestión para centros de diagnóstico médico
            </p>
          )}
        </div>

        {/* Right Panel - Login Form */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Iniciar Sesión</h2>
            <p style={styles.formSubtitle}>Ingrese sus credenciales para acceder</p>

            <form onSubmit={handleSubmit}>
              {error && <div style={styles.errorBox}>{error}</div>}

              <div style={styles.inputGroup}>
                <span style={styles.inputIcon}><FaUser /></span>
                <input
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={styles.input}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              <div style={styles.inputGroup}>
                <span style={styles.inputIcon}><FaLock /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={styles.input}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={styles.eyeButton}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <label style={styles.rememberRow}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => {
                    const checked = e.target.checked;
                    setRememberMe(checked);
                    if (!checked) {
                      localStorage.removeItem('savedUsername');
                      localStorage.removeItem('savedPassword');
                    }
                  }}
                  style={styles.checkbox}
                />
                Recordar mis datos
              </label>

              <button type="submit" style={styles.submitButton} disabled={loading}>
                {loading ? (
                  <>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    Ingresando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </button>
            </form>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        {empresaConfig.direccion && <span>{empresaConfig.direccion}</span>}
        {empresaConfig.direccion && empresaConfig.telefono && <span> · </span>}
        {empresaConfig.telefono && <span>Tel: {empresaConfig.telefono}</span>}
      </div>
    </div>
  );
}
