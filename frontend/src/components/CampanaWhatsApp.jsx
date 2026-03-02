import React, { useState, useEffect, useCallback } from 'react';
import {
  FaWhatsapp, FaPaperPlane, FaSpinner, FaExclamationTriangle,
  FaChartBar, FaUsers, FaCheckDouble, FaTimes, FaHistory
} from 'react-icons/fa';
import api from '../services/api.js';

const s = {
  container: { padding: 24, fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: '#0f4c75', margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 },
  statCard: {
    background: '#fff', borderRadius: 14, padding: 20,
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 14
  },
  iconCircle: {
    width: 46, height: 46, borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  statVal: { fontSize: 22, fontWeight: 800, color: '#0f4c75' },
  statLabel: { fontSize: 13, color: '#888' },
  card: { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#0f4c75', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 },
  field: { marginBottom: 14 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', minHeight: 100, resize: 'vertical' },
  select: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fff' },
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px',
    background: '#25D366', color: '#fff', border: 'none', borderRadius: 10,
    cursor: 'pointer', fontWeight: 600, fontSize: 14
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid #eee', color: '#0f4c75', fontWeight: 700 },
  td: { padding: '10px 14px', borderBottom: '1px solid #f0f0f0', color: '#333' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  center: { textAlign: 'center', padding: 60, color: '#888' }
};

export default function CampanaWhatsApp() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ mensaje: '', filtro: 'todos', asunto: '' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getWhatsappEstadisticas();
      setStats(data || {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSend = async () => {
    if (!form.mensaje.trim()) { alert('Ingrese un mensaje'); return; }
    if (!window.confirm('¿Enviar esta campaña de WhatsApp?')) return;
    try {
      setSending(true);
      await api.enviarCampanaWhatsApp({ mensaje: form.mensaje, filtro: form.filtro, asunto: form.asunto });
      alert('Campaña enviada exitosamente');
      setForm({ mensaje: '', filtro: 'todos', asunto: '' });
      load();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-DO') : '-';

  if (loading) return <div style={s.center}><FaSpinner className="spin" size={28} /> Cargando...</div>;
  if (error) return <div style={s.center}><FaExclamationTriangle color="#e74c3c" size={28} /><br />{error}</div>;

  const campanas = stats.campanas || stats.historial || [];

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}><FaWhatsapp style={{ marginRight: 10, color: '#25D366' }} />Campañas WhatsApp</h2>
      </div>

      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={{ ...s.iconCircle, background: '#e6f9ed' }}><FaPaperPlane size={20} color="#25D366" /></div>
          <div>
            <div style={s.statVal}>{stats.enviados || stats.totalEnviados || 0}</div>
            <div style={s.statLabel}>Enviados</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.iconCircle, background: '#e3f0ff' }}><FaCheckDouble size={20} color="#2980b9" /></div>
          <div>
            <div style={s.statVal}>{stats.entregados || stats.totalEntregados || 0}</div>
            <div style={s.statLabel}>Entregados</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.iconCircle, background: '#f0e6ff' }}><FaUsers size={20} color="#8e44ad" /></div>
          <div>
            <div style={s.statVal}>{stats.destinatarios || stats.totalDestinatarios || 0}</div>
            <div style={s.statLabel}>Destinatarios</div>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <h4 style={s.cardTitle}><FaPaperPlane color="#25D366" /> Nueva Campaña</h4>
        <div style={s.field}>
          <label style={s.label}>Asunto / Título</label>
          <input style={s.input} value={form.asunto} onChange={e => setForm({ ...form, asunto: e.target.value })} placeholder="Ej: Recordatorio de citas" />
        </div>
        <div style={s.field}>
          <label style={s.label}>Mensaje</label>
          <textarea style={s.textarea} value={form.mensaje} onChange={e => setForm({ ...form, mensaje: e.target.value })} placeholder="Escriba el mensaje de la campaña..." />
        </div>
        <div style={s.field}>
          <label style={s.label}>Destinatarios</label>
          <select style={s.select} value={form.filtro} onChange={e => setForm({ ...form, filtro: e.target.value })}>
            <option value="todos">Todos los pacientes</option>
            <option value="con_citas">Pacientes con citas pendientes</option>
            <option value="con_resultados">Pacientes con resultados listos</option>
            <option value="recientes">Pacientes recientes (último mes)</option>
          </select>
        </div>
        <button style={s.btn} onClick={handleSend} disabled={sending}>
          {sending ? <FaSpinner className="spin" /> : <FaPaperPlane />} Enviar Campaña
        </button>
      </div>

      {campanas.length > 0 && (
        <div style={s.card}>
          <h4 style={s.cardTitle}><FaHistory color="#2980b9" /> Historial de Campañas</h4>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Fecha</th><th style={s.th}>Asunto</th>
                <th style={s.th}>Destinatarios</th><th style={s.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {campanas.map((c, i) => (
                <tr key={c._id || c.id || i}>
                  <td style={s.td}>{formatDate(c.fecha || c.createdAt)}</td>
                  <td style={s.td}>{c.asunto || c.titulo || '-'}</td>
                  <td style={s.td}>{c.destinatarios || c.total || '-'}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: c.estado === 'enviado' ? '#e6f9ed' : '#fff4e5', color: c.estado === 'enviado' ? '#27ae60' : '#e67e22' }}>
                      {c.estado || 'enviado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
