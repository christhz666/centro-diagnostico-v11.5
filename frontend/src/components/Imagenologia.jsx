import React, { useState, useEffect, useCallback } from 'react';
import {
  FaXRay, FaSearch, FaSpinner, FaExclamationTriangle,
  FaEye, FaSyncAlt
} from 'react-icons/fa';
import api from '../services/api.js';

const ESTADO_STYLE = {
  pendiente:   { bg: '#fff4e5', color: '#e67e22', label: 'Pendiente' },
  en_proceso:  { bg: '#f0e6ff', color: '#8e44ad', label: 'En Proceso' },
  completado:  { bg: '#e6f9ed', color: '#27ae60', label: 'Completado' },
  informado:   { bg: '#e3f0ff', color: '#2980b9', label: 'Informado' }
};

const s = {
  container: { padding: 24, fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 22, fontWeight: 700, color: '#0f4c75', margin: 0 },
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
    background: '#3498db', color: '#fff', border: 'none', borderRadius: 10,
    cursor: 'pointer', fontWeight: 600, fontSize: 14
  },
  searchBox: {
    display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 10,
    border: '1px solid #ddd', padding: '0 12px', marginBottom: 20, maxWidth: 400
  },
  searchInput: { border: 'none', outline: 'none', padding: '10px 8px', fontSize: 14, flex: 1 },
  tableWrap: { background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #eee', color: '#0f4c75', fontWeight: 700 },
  td: { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', color: '#333' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  actBtn: {
    padding: '6px 12px', border: 'none', borderRadius: 6,
    cursor: 'pointer', fontSize: 13, background: '#3498db', color: '#fff',
    display: 'inline-flex', alignItems: 'center', gap: 4
  },
  center: { textAlign: 'center', padding: 60, color: '#888' },
  workspace: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000
  },
  wsCard: { background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto' }
};

export default function Imagenologia() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [wsData, setWsData] = useState(null);
  const [wsLoading, setWsLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getImagenologiaLista();
      setLista(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openWorkspace = async (item) => {
    try {
      setWsLoading(true);
      const data = await api.getImagenologiaWorkspace(item._id || item.id);
      setWsData({ ...data, _item: item });
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setWsLoading(false);
    }
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

  const filtered = lista.filter(item => {
    if (!search) return true;
    const q = search.toLowerCase();
    return getPacienteNombre(item).toLowerCase().includes(q) ||
           getEstudioNombre(item).toLowerCase().includes(q);
  });

  if (loading) return <div style={s.center}><FaSpinner className="spin" size={28} /> Cargando imagenología...</div>;
  if (error) return <div style={s.center}><FaExclamationTriangle color="#e74c3c" size={28} /><br />{error}</div>;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}><FaXRay style={{ marginRight: 10 }} />Imagenología</h2>
        <button style={s.btn} onClick={load}><FaSyncAlt /> Actualizar</button>
      </div>

      <div style={s.searchBox}>
        <FaSearch color="#aaa" />
        <input style={s.searchInput} placeholder="Buscar por paciente o estudio..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Paciente</th><th style={s.th}>Estudio</th>
              <th style={s.th}>Fecha</th><th style={s.th}>Estado</th>
              <th style={s.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const est = ESTADO_STYLE[item.estado] || ESTADO_STYLE.pendiente;
              return (
                <tr key={item._id || item.id}>
                  <td style={s.td}>{getPacienteNombre(item)}</td>
                  <td style={s.td}>{getEstudioNombre(item)}</td>
                  <td style={s.td}>{formatDate(item.fecha || item.createdAt)}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: est.bg, color: est.color }}>{est.label}</span>
                  </td>
                  <td style={s.td}>
                    <button style={s.actBtn} onClick={() => openWorkspace(item)} disabled={wsLoading}>
                      <FaEye /> Workspace
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={s.center}>No se encontraron estudios de imagenología</div>}
      </div>

      {wsData && (
        <div style={s.workspace} onClick={() => setWsData(null)}>
          <div style={s.wsCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#0f4c75', margin: 0 }}>Workspace - {getPacienteNombre(wsData._item)}</h3>
              <button style={{ ...s.actBtn, background: '#95a5a6' }} onClick={() => setWsData(null)}>Cerrar</button>
            </div>
            <p><strong>Estudio:</strong> {getEstudioNombre(wsData._item)}</p>
            <p><strong>Estado:</strong> {wsData.estado || wsData._item.estado || '-'}</p>
            {wsData.reporte && <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 16, marginTop: 12 }}><strong>Reporte:</strong><br />{wsData.reporte}</div>}
            {wsData.observaciones && <p><strong>Observaciones:</strong> {wsData.observaciones}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
