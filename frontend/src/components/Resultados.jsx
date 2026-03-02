import React, { useState, useEffect, useCallback } from 'react';
import {
  FaVials, FaSearch, FaSpinner, FaExclamationTriangle,
  FaCheckCircle, FaFilter
} from 'react-icons/fa';
import api from '../services/api.js';

const ESTADO_STYLE = {
  pendiente:   { bg: '#fff4e5', color: '#e67e22', label: 'Pendiente' },
  en_proceso:  { bg: '#f0e6ff', color: '#8e44ad', label: 'En Proceso' },
  completado:  { bg: '#e3f0ff', color: '#2980b9', label: 'Completado' },
  validado:    { bg: '#e6f9ed', color: '#27ae60', label: 'Validado' }
};

const s = {
  container: { padding: 24, fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 22, fontWeight: 700, color: '#0f4c75', margin: 0 },
  filters: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  searchBox: {
    display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 10,
    border: '1px solid #ddd', padding: '0 12px'
  },
  searchInput: { border: 'none', outline: 'none', padding: '10px 8px', fontSize: 14, width: 240 },
  select: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff' },
  tableWrap: { background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #eee', color: '#0f4c75', fontWeight: 700 },
  td: { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', color: '#333' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  actBtn: {
    padding: '6px 12px', border: 'none', borderRadius: 6,
    cursor: 'pointer', fontSize: 13, background: '#27ae60', color: '#fff',
    display: 'inline-flex', alignItems: 'center', gap: 4
  },
  center: { textAlign: 'center', padding: 60, color: '#888' }
};

export default function Resultados() {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getResultados();
      setResultados(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleValidar = async (r) => {
    if (!window.confirm('¿Validar este resultado?')) return;
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

  const filtered = resultados.filter(r => {
    if (estadoFilter && r.estado !== estadoFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.codigo_muestra || '').toLowerCase().includes(q) ||
           getPacienteNombre(r).toLowerCase().includes(q) ||
           getEstudioNombre(r).toLowerCase().includes(q);
  });

  if (loading) return <div style={s.center}><FaSpinner className="spin" size={28} /> Cargando resultados...</div>;
  if (error) return <div style={s.center}><FaExclamationTriangle color="#e74c3c" size={28} /><br />{error}</div>;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}><FaVials style={{ marginRight: 10 }} />Resultados</h2>
        <div style={s.filters}>
          <div style={s.searchBox}>
            <FaSearch color="#aaa" />
            <input style={s.searchInput} placeholder="Buscar por código, paciente o estudio..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={s.select} value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_STYLE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Código Muestra</th><th style={s.th}>Paciente</th>
              <th style={s.th}>Estudio</th><th style={s.th}>Estado</th>
              <th style={s.th}>Fecha</th><th style={s.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const est = ESTADO_STYLE[r.estado] || ESTADO_STYLE.pendiente;
              return (
                <tr key={r._id || r.id}>
                  <td style={s.td}>{r.codigo_muestra || '-'}</td>
                  <td style={s.td}>{getPacienteNombre(r)}</td>
                  <td style={s.td}>{getEstudioNombre(r)}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: est.bg, color: est.color }}>{est.label}</span>
                  </td>
                  <td style={s.td}>{formatDate(r.fecha || r.createdAt)}</td>
                  <td style={s.td}>
                    {r.estado !== 'validado' && (
                      <button style={s.actBtn} onClick={() => handleValidar(r)}>
                        <FaCheckCircle /> Validar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={s.center}>No se encontraron resultados</div>}
      </div>
    </div>
  );
}
