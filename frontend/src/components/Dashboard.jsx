import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaUserInjured, FaCalendarCheck, FaFlask, FaMoneyBillWave,
  FaCalendarAlt, FaChartLine, FaUserPlus, FaClock, FaSpinner,
  FaUserMd, FaSyncAlt, FaHeartbeat, FaExclamationTriangle
} from 'react-icons/fa';
import api from '../services/api.js';

const ESTADO_COLORS = {
  programada:  { bg: '#e3f0ff', text: '#2176ff', label: 'Programada' },
  confirmada:  { bg: '#e6f9ed', text: '#27ae60', label: 'Confirmada' },
  en_sala:     { bg: '#fff4e5', text: '#e67e22', label: 'En Sala' },
  en_proceso:  { bg: '#f0e6ff', text: '#8e44ad', label: 'En Proceso' },
  completada:  { bg: '#e6faf5', text: '#1abc9c', label: 'Completada' },
  cancelada:   { bg: '#f0f0f0', text: '#7f8c8d', label: 'Cancelada' },
  no_asistio:  { bg: '#fff9e6', text: '#f1c40f', label: 'No Asistió' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

// ── Animated number counter ──
function AnimatedNumber({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef();

  useEffect(() => {
    const target = Number(value) || 0;
    let start = 0;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };

    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return <span>{display.toLocaleString('es-DO')}</span>;
}

// ── Progress bar ──
function ProgressBar({ value, max, color, darkMode }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{
      height: 6, borderRadius: 3, width: '100%',
      background: darkMode ? '#2a3447' : '#e9ecef', overflow: 'hidden', marginTop: 8
    }}>
      <div style={{
        width: `${pct}%`, height: '100%', borderRadius: 3,
        background: color, transition: 'width .8s ease'
      }} />
    </div>
  );
}

// ── Main Dashboard ──
export default function Dashboard({ darkMode }) {
  const [stats, setStats] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const t = darkMode
    ? { bg: '#141b2a', card: '#1e2535', text: '#e0e6f0', muted: '#8899aa', border: '#2a3447', tableBg: '#1e2535', hoverRow: '#253045' }
    : { bg: '#f4f6fb', card: '#ffffff', text: '#1b262c', muted: '#6b7b8d', border: '#e9ecef', tableBg: '#ffffff', hoverRow: '#f8f9fa' };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, c] = await Promise.all([api.getDashboardStats(), api.getCitasHoy()]);
      setStats(s);
      setCitas(Array.isArray(c) ? c : []);
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Loading state ──
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', fontFamily: 'Inter, sans-serif', background: t.bg, color: t.text }}>
        <FaHeartbeat size={48} color="#e74c3c" style={{ animation: 'heartbeat 1.2s infinite' }} />
        <p style={{ marginTop: 16, fontSize: 16 }}>Cargando dashboard…</p>
        <style>{`@keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.2)}28%{transform:scale(1)}42%{transform:scale(1.15)}56%{transform:scale(1)}}`}</style>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', fontFamily: 'Inter, sans-serif', background: t.bg, color: t.text }}>
        <FaExclamationTriangle size={48} color="#e67e22" />
        <p style={{ marginTop: 16, fontSize: 16 }}>{error}</p>
        <button onClick={loadData} style={{ marginTop: 12, padding: '10px 28px', border: 'none', borderRadius: 8, background: '#2176ff', color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
          Reintentar
        </button>
      </div>
    );
  }

  const p = stats || {};
  const pac  = p.pacientes   || {};
  const ci   = p.citas       || {};
  const res  = p.resultados  || {};
  const fac  = p.facturacion || {};
  const per  = p.personal    || {};

  const mainCards = [
    { icon: <FaUserInjured size={26} />, label: 'Total Pacientes', value: pac.total || 0,              color: '#2176ff', progress: { v: pac.nuevosMes || 0, max: pac.total || 1 } },
    { icon: <FaCalendarCheck size={26} />, label: 'Citas Hoy',      value: ci.hoy || 0,                 color: '#27ae60', progress: { v: ci.completadasHoy || 0, max: ci.hoy || 1 } },
    { icon: <FaFlask size={26} />,         label: 'Resultados Pendientes', value: res.pendientes || 0,   color: '#e67e22', progress: { v: res.completadosMes || 0, max: (res.pendientes || 0) + (res.completadosMes || 0) || 1 } },
    { icon: <FaMoneyBillWave size={26} />, label: 'Facturación Hoy', value: fac.hoy?.total || 0,        color: '#8e44ad', progress: { v: fac.hoy?.cantidad || 0, max: (fac.hoy?.cantidad || 0) + 1 }, isMoney: true },
  ];

  const summaryItems = [
    { icon: <FaCalendarAlt />,  label: 'Citas del mes',      value: ci.mes || 0 },
    { icon: <FaChartLine />,    label: 'Facturación mes',     value: fac.mes?.total || 0, isMoney: true },
    { icon: <FaUserPlus />,     label: 'Pacientes nuevos',    value: pac.nuevosMes || 0 },
    { icon: <FaClock />,        label: 'Citas programadas',   value: ci.programadas || 0 },
    { icon: <FaSpinner />,      label: 'En proceso',          value: ci.enProceso || 0 },
    { icon: <FaUserMd />,       label: 'Médicos activos',     value: per.medicos || 0 },
  ];

  const formatMoney = (v) => `RD$ ${Number(v || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;

  const cardStyle = {
    background: t.card, borderRadius: 14, padding: 22, flex: '1 1 220px',
    minWidth: 200, boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,.3)' : '0 2px 8px rgba(0,0,0,.06)',
    border: `1px solid ${t.border}`, transition: 'transform .2s', cursor: 'default',
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: t.bg, minHeight: '100vh', padding: '28px 32px', color: t.text }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: t.text }}>{getGreeting()}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: t.muted }}>Resumen del centro diagnóstico</p>
        </div>
        <button
          onClick={loadData}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: 'none', borderRadius: 8, background: '#2176ff', color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600 }}
        >
          <FaSyncAlt size={14} /> Actualizar
        </button>
      </div>

      {/* Main stat cards */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
        {mainCards.map((c, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: c.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                {c.icon}
              </div>
              <span style={{ fontSize: 13, color: t.muted, fontWeight: 500 }}>{c.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: t.text }}>
              {c.isMoney ? formatMoney(c.value) : <AnimatedNumber value={c.value} />}
            </div>
            <ProgressBar value={c.progress.v} max={c.progress.max} color={c.color} darkMode={darkMode} />
          </div>
        ))}
      </div>

      {/* Quick summary */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        {summaryItems.map((s, i) => (
          <div key={i} style={{ ...cardStyle, padding: 16, display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 180px', minWidth: 170 }}>
            <span style={{ color: t.muted, fontSize: 18 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 12, color: t.muted }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>
                {s.isMoney ? formatMoney(s.value) : <AnimatedNumber value={s.value} duration={700} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's appointments table */}
      <div style={{ background: t.card, borderRadius: 14, padding: 22, boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,.3)' : '0 2px 8px rgba(0,0,0,.06)', border: `1px solid ${t.border}` }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: t.text }}>Citas de Hoy</h2>

        {citas.length === 0 ? (
          <p style={{ textAlign: 'center', color: t.muted, padding: 32 }}>No hay citas programadas para hoy</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${t.border}` }}>
                  {['Hora', 'Paciente', 'Estudios', 'Estado'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: t.muted, fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {citas.map((c, i) => {
                  const est = ESTADO_COLORS[c.estado] || ESTADO_COLORS.programada;
                  return (
                    <tr key={c.id || i} style={{ borderBottom: `1px solid ${t.border}` }}>
                      <td style={{ padding: '12px 14px', color: t.text, whiteSpace: 'nowrap' }}>{c.hora || '—'}</td>
                      <td style={{ padding: '12px 14px', color: t.text, fontWeight: 500 }}>{c.paciente_nombre || c.paciente || '—'}</td>
                      <td style={{ padding: '12px 14px', color: t.muted }}>{c.estudios || c.tipo_estudio || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                          fontSize: 12, fontWeight: 600,
                          background: darkMode ? est.text + '22' : est.bg,
                          color: darkMode ? est.text : est.text,
                        }}>
                          {est.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
