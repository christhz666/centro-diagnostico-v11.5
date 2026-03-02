import React, { useState } from 'react';
import {
  FaUser, FaLock, FaSpinner, FaExclamationTriangle,
  FaFlask, FaFileInvoiceDollar, FaSignOutAlt, FaEye, FaEyeSlash
} from 'react-icons/fa';
import api from '../services/api.js';

const s = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: 'Inter, sans-serif' },
  loginCard: { background: '#fff', borderRadius: 16, padding: 36, width: '100%', maxWidth: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  portalWrap: { padding: 24, maxWidth: 900, margin: '0 auto' },
  logo: { textAlign: 'center', marginBottom: 28 },
  logoIcon: { width: 60, height: 60, borderRadius: '50%', background: '#eaf4fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' },
  title: { fontSize: 22, fontWeight: 700, color: '#0f4c75', margin: '0 0 4px' },
  subtitle: { fontSize: 14, color: '#888', margin: 0 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 4 },
  inputWrap: { position: 'relative' },
  input: { width: '100%', padding: '12px 14px', border: '1px solid #ddd', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  btn: { width: '100%', padding: '12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  error: { background: '#fef3f3', border: '1px solid #f5c6cb', borderRadius: 8, padding: '10px 14px', color: '#e74c3c', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  card: { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#0f4c75', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #eee', color: '#0f4c75', fontWeight: 700 },
  td: { padding: '8px 12px', borderBottom: '1px solid #f0f0f0', color: '#333' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  logoutBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  center: { textAlign: 'center', padding: 40, color: '#888' },
  pwdToggle: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#999', background: 'none', border: 'none', padding: 0 }
};

export default function PortalPaciente() {
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState(null);
  const [paciente, setPaciente] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dataLoading, setDataLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) { setError('Complete todos los campos'); return; }
    try {
      setLoading(true);
      setError('');
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginForm.username, password: loginForm.password })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || err.error || 'Credenciales inválidas');
      }
      const data = await resp.json();
      const tk = data.token || data.access_token;
      const user = data.usuario || data.user;
      setToken(tk);
      setPaciente(user);
      setAuthed(true);
      loadPatientData(tk, user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientData = async (tk, user) => {
    try {
      setDataLoading(true);
      const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tk };
      const uid = user._id || user.id;
      const [resResp, facResp] = await Promise.all([
        fetch('/api/resultados/paciente/' + uid, { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/facturas?paciente=' + uid, { headers }).then(r => r.json()).catch(() => [])
      ]);
      const res = Array.isArray(resResp) ? resResp : (resResp.resultados || resResp.data || []);
      const fac = Array.isArray(facResp) ? facResp : (facResp.facturas || facResp.data || []);
      setResultados(res);
      setFacturas(fac);
    } catch {
      // silently handle
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    setToken(null);
    setPaciente(null);
    setResultados([]);
    setFacturas([]);
    setLoginForm({ username: '', password: '' });
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-DO') : '-';
  const formatMoney = (v) => '$' + (Number(v) || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 });

  if (!authed) {
    return (
      <div style={s.container}>
        <div style={s.loginCard}>
          <div style={s.logo}>
            <div style={s.logoIcon}><FaUser size={28} color="#3498db" /></div>
            <h2 style={s.title}>Portal del Paciente</h2>
            <p style={s.subtitle}>Acceda a sus resultados y facturas</p>
          </div>
          {error && <div style={s.error}><FaExclamationTriangle /> {error}</div>}
          <form onSubmit={handleLogin}>
            <div style={s.field}>
              <label style={s.label}>Usuario</label>
              <input style={s.input} value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} placeholder="Ingrese su usuario" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Contraseña</label>
              <div style={s.inputWrap}>
                <input style={s.input} type={showPwd ? 'text' : 'password'} value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Ingrese su contraseña" />
                <button type="button" style={s.pwdToggle} onClick={() => setShowPwd(!showPwd)}>{showPwd ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
            </div>
            <button type="submit" style={s.btn} disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : <FaLock />} Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={s.portalWrap}>
      <div style={s.header}>
        <h2 style={{ ...s.title, margin: 0 }}>
          <FaUser style={{ marginRight: 8 }} />
          Bienvenido, {paciente?.nombre || paciente?.username || 'Paciente'}
        </h2>
        <button style={s.logoutBtn} onClick={handleLogout}><FaSignOutAlt /> Cerrar Sesión</button>
      </div>

      {dataLoading ? (
        <div style={s.center}><FaSpinner className="spin" size={28} /> Cargando datos...</div>
      ) : (
        <>
          <div style={s.card}>
            <h4 style={s.cardTitle}><FaFlask color="#8e44ad" /> Mis Resultados</h4>
            {resultados.length === 0 ? (
              <p style={{ color: '#888', fontSize: 14 }}>No tiene resultados disponibles</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Estudio</th><th style={s.th}>Estado</th><th style={s.th}>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((r, i) => (
                    <tr key={r._id || r.id || i}>
                      <td style={s.td}>{typeof r.estudio === 'object' ? r.estudio.nombre : (r.estudio_nombre || '-')}</td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, background: r.estado === 'validado' ? '#e6f9ed' : '#fff4e5', color: r.estado === 'validado' ? '#27ae60' : '#e67e22' }}>
                          {r.estado || '-'}
                        </span>
                      </td>
                      <td style={s.td}>{formatDate(r.fecha || r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={s.card}>
            <h4 style={s.cardTitle}><FaFileInvoiceDollar color="#e67e22" /> Mis Facturas</h4>
            {facturas.length === 0 ? (
              <p style={{ color: '#888', fontSize: 14 }}>No tiene facturas disponibles</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Número</th><th style={s.th}>Total</th>
                    <th style={s.th}>Estado</th><th style={s.th}>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.map((f, i) => (
                    <tr key={f._id || f.id || i}>
                      <td style={s.td}>{f.numero || f.numero_factura || '-'}</td>
                      <td style={s.td}>{formatMoney(f.total || f.monto_total)}</td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, background: f.estado === 'pagada' ? '#e6f9ed' : '#e3f0ff', color: f.estado === 'pagada' ? '#27ae60' : '#2980b9' }}>
                          {f.estado || '-'}
                        </span>
                      </td>
                      <td style={s.td}>{formatDate(f.fecha || f.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
