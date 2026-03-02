import React, { useState, useEffect, useCallback } from 'react';
import {
  FaUserMd, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaSyncAlt
} from 'react-icons/fa';
import api from '../services/api.js';

const s = {
  container: { padding: 24, fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: '#0f4c75', margin: 0 },
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
    background: '#3498db', color: '#fff', border: 'none', borderRadius: 10,
    cursor: 'pointer', fontWeight: 600, fontSize: 14
  },
  tableWrap: { background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #eee', color: '#0f4c75', fontWeight: 700 },
  td: { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', color: '#333' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  actBtn: {
    padding: '6px 14px', border: 'none', borderRadius: 8,
    cursor: 'pointer', fontSize: 13, background: '#27ae60', color: '#fff',
    display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600
  },
  center: { textAlign: 'center', padding: 60, color: '#888' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 },
  statCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)', textAlign: 'center'
  },
  statNum: { fontSize: 28, fontWeight: 800, color: '#0f4c75' },
  statLabel: { fontSize: 13, color: '#888', marginTop: 4 }
};

export default function PortalMedico() {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getResultados({ estado: 'pendiente' });
      setResultados(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleValidar = async (r) => {
    if (!window.confirm('¿Desea validar este resultado?')) return;
    try {
      await api.validarResultado(r._id || r.id, { validado: true });
      load();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const getPacienteNombre = (r) => {
    if (typeof r.paciente === 'object' && r.paciente) return r.paciente.nombre || r.paciente.nombres || '-';
    return r.paciente_nombre || '-';
  };

  const getEstudioNombre = (r) => {
    if (typeof r.estudio === 'object' && r.estudio) return r.estudio.nombre || '-';
    return r.estudio_nombre || r.estudio || '-';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-DO') : '-';

  if (loading) return <div style={s.center}><FaSpinner className="spin" size={28} /> Cargando...</div>;
  if (error) return <div style={s.center}><FaExclamationTriangle color="#e74c3c" size={28} /><br />{error}</div>;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}><FaUserMd style={{ marginRight: 10 }} />Portal Médico</h2>
        <button style={s.btn} onClick={load}><FaSyncAlt /> Actualizar</button>
      </div>

      <div style={s.stats}>
        <div style={s.statCard}>
          <div style={s.statNum}>{resultados.length}</div>
          <div style={s.statLabel}>Resultados Pendientes</div>
        </div>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Código Muestra</th><th style={s.th}>Paciente</th>
              <th style={s.th}>Estudio</th><th style={s.th}>Fecha</th>
              <th style={s.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map(r => (
              <tr key={r._id || r.id}>
                <td style={s.td}>{r.codigo_muestra || '-'}</td>
                <td style={s.td}>{getPacienteNombre(r)}</td>
                <td style={s.td}>{getEstudioNombre(r)}</td>
                <td style={s.td}>{formatDate(r.fecha || r.createdAt)}</td>
                <td style={s.td}>
                  <button style={s.actBtn} onClick={() => handleValidar(r)}>
                    <FaCheckCircle /> Validar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {resultados.length === 0 && (
          <div style={s.center}>
            <FaCheckCircle size={40} color="#27ae60" />
            <p>No hay resultados pendientes de validación</p>
          </div>
        )}
      </div>
    </div>
  );
}
