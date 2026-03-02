import React, { useState } from 'react';
import {
  FaSearch, FaSpinner, FaExclamationTriangle, FaBarcode,
  FaUser, FaFlask, FaFileInvoiceDollar, FaVials, FaHistory
} from 'react-icons/fa';
import api from '../services/api.js';

const s = {
  container: { padding: 24, fontFamily: 'Inter, sans-serif', maxWidth: 900, margin: '0 auto' },
  title: { fontSize: 22, fontWeight: 700, color: '#0f4c75', margin: '0 0 24px' },
  searchArea: {
    background: '#fff', borderRadius: 14, padding: 24,
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 24
  },
  searchRow: { display: 'flex', gap: 10 },
  input: {
    flex: 1, padding: '12px 16px', border: '1px solid #ddd', borderRadius: 10,
    fontSize: 15, outline: 'none'
  },
  btn: {
    padding: '12px 24px', background: '#3498db', color: '#fff', border: 'none',
    borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14,
    display: 'flex', alignItems: 'center', gap: 8
  },
  card: {
    background: '#fff', borderRadius: 14, padding: 20,
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 16
  },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#0f4c75', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 },
  row: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' },
  label: { fontWeight: 600, color: '#555', fontSize: 13 },
  value: { color: '#333', fontSize: 13 },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 10 },
  th: { padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #eee', color: '#0f4c75', fontWeight: 700 },
  td: { padding: '8px 12px', borderBottom: '1px solid #f0f0f0', color: '#333' },
  center: { textAlign: 'center', padding: 40, color: '#888' },
  hint: { fontSize: 13, color: '#999', marginTop: 10 }
};

export default function ConsultaRapida() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registro, setRegistro] = useState(null);
  const [historial, setHistorial] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setRegistro(null);
    setHistorial(null);
    try {
      const data = await api.buscarRegistroPorIdOCodigo(query.trim());
      if (data) {
        setRegistro(data);
      }
    } catch {
      try {
        const hist = await api.buscarHistorialPaciente(query.trim());
        if (hist) setHistorial(hist);
        else setError('No se encontraron resultados');
      } catch (e2) {
        setError('No se encontraron resultados para: ' + query);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-DO') : '-';
  const formatMoney = (v) => '$' + (Number(v) || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 });

  const renderRegistro = () => {
    if (!registro) return null;
    const pac = registro.paciente || {};
    const pacNombre = typeof pac === 'object' ? (pac.nombre || pac.nombres || '-') : (registro.paciente_nombre || '-');

    return (
      <>
        <div style={s.card}>
          <h4 style={s.cardTitle}><FaUser color="#3498db" /> Paciente</h4>
          <div style={s.row}><span style={s.label}>Nombre</span><span style={s.value}>{pacNombre}</span></div>
          {pac.cedula && <div style={s.row}><span style={s.label}>Cédula</span><span style={s.value}>{pac.cedula}</span></div>}
          {pac.telefono && <div style={s.row}><span style={s.label}>Teléfono</span><span style={s.value}>{pac.telefono}</span></div>}
          {pac.email && <div style={s.row}><span style={s.label}>Email</span><span style={s.value}>{pac.email}</span></div>}
        </div>

        {registro.estudios && registro.estudios.length > 0 && (
          <div style={s.card}>
            <h4 style={s.cardTitle}><FaFlask color="#8e44ad" /> Estudios</h4>
            <table style={s.table}>
              <thead><tr><th style={s.th}>Estudio</th><th style={s.th}>Precio</th></tr></thead>
              <tbody>
                {registro.estudios.map((e, i) => (
                  <tr key={i}>
                    <td style={s.td}>{e.nombre || (typeof e.estudio === 'object' ? e.estudio.nombre : e.estudio) || '-'}</td>
                    <td style={s.td}>{formatMoney(e.precio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {registro.factura && (
          <div style={s.card}>
            <h4 style={s.cardTitle}><FaFileInvoiceDollar color="#e67e22" /> Factura</h4>
            <div style={s.row}><span style={s.label}>Número</span><span style={s.value}>{registro.factura.numero || '-'}</span></div>
            <div style={s.row}><span style={s.label}>Total</span><span style={s.value}>{formatMoney(registro.factura.total)}</span></div>
            <div style={s.row}><span style={s.label}>Estado</span><span style={s.value}>{registro.factura.estado || '-'}</span></div>
          </div>
        )}

        {registro.resultados && registro.resultados.length > 0 && (
          <div style={s.card}>
            <h4 style={s.cardTitle}><FaVials color="#16a085" /> Resultados</h4>
            <table style={s.table}>
              <thead><tr><th style={s.th}>Estudio</th><th style={s.th}>Estado</th><th style={s.th}>Fecha</th></tr></thead>
              <tbody>
                {registro.resultados.map((r, i) => (
                  <tr key={i}>
                    <td style={s.td}>{typeof r.estudio === 'object' ? r.estudio.nombre : (r.estudio_nombre || '-')}</td>
                    <td style={s.td}>{r.estado || '-'}</td>
                    <td style={s.td}>{formatDate(r.fecha || r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  };

  const renderHistorial = () => {
    if (!historial) return null;
    const items = Array.isArray(historial) ? historial : (historial.ordenes || historial.citas || []);
    return (
      <div style={s.card}>
        <h4 style={s.cardTitle}><FaHistory color="#2980b9" /> Historial</h4>
        {items.length === 0 ? (
          <p style={{ color: '#888', fontSize: 14 }}>No se encontraron registros</p>
        ) : (
          <table style={s.table}>
            <thead><tr><th style={s.th}>Fecha</th><th style={s.th}>Estado</th><th style={s.th}>Total</th></tr></thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td style={s.td}>{formatDate(item.fecha || item.createdAt)}</td>
                  <td style={s.td}>{item.estado || '-'}</td>
                  <td style={s.td}>{formatMoney(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <div style={s.container}>
      <h2 style={s.title}><FaBarcode style={{ marginRight: 10 }} />Consulta Rápida</h2>

      <div style={s.searchArea}>
        <div style={s.searchRow}>
          <input
            style={s.input}
            placeholder="Ingrese código de barras, ID de orden o nombre del paciente..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button style={s.btn} onClick={handleSearch} disabled={loading}>
            {loading ? <FaSpinner className="spin" /> : <FaSearch />} Buscar
          </button>
        </div>
        <p style={s.hint}>Puede buscar por código de barras, número de orden, cédula o nombre del paciente.</p>
      </div>

      {error && (
        <div style={{ ...s.card, background: '#fef3f3', borderLeft: '4px solid #e74c3c' }}>
          <FaExclamationTriangle color="#e74c3c" /> {error}
        </div>
      )}

      {renderRegistro()}
      {renderHistorial()}

      {!loading && !error && !registro && !historial && (
        <div style={s.center}>
          <FaSearch size={40} color="#ddd" />
          <p>Ingrese un término de búsqueda para comenzar</p>
        </div>
      )}
    </div>
  );
}
