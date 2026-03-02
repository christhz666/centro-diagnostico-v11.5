import React, { useState, useEffect, useCallback } from 'react';
import {
  FaFileInvoiceDollar, FaSearch, FaSpinner, FaExclamationTriangle,
  FaMoneyBillWave, FaBan, FaEye
} from 'react-icons/fa';
import api from '../services/api.js';

const ESTADO_STYLE = {
  emitida:  { bg: '#e3f0ff', color: '#2980b9', label: 'Emitida' },
  pagada:   { bg: '#e6f9ed', color: '#27ae60', label: 'Pagada' },
  anulada:  { bg: '#fde8e8', color: '#e74c3c', label: 'Anulada' },
  borrador: { bg: '#f0f0f0', color: '#7f8c8d', label: 'Borrador' }
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
  searchInput: { border: 'none', outline: 'none', padding: '10px 8px', fontSize: 14, width: 220 },
  select: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff' },
  tableWrap: { background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #eee', color: '#0f4c75', fontWeight: 700 },
  td: { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', color: '#333' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  actBtn: {
    padding: '5px 10px', border: 'none', borderRadius: 6,
    cursor: 'pointer', fontSize: 13, marginRight: 6, background: '#f0f0f0', color: '#333',
    display: 'inline-flex', alignItems: 'center', gap: 4
  },
  center: { textAlign: 'center', padding: 60, color: '#888' },
  detail: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000
  },
  detailCard: { background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }
};

export default function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getFacturas();
      setFacturas(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePagar = async (f) => {
    const monto = prompt('Monto a pagar:', f.total || f.monto_total || 0);
    if (!monto) return;
    try {
      await api.pagarFactura(f._id || f.id, Number(monto), 'efectivo');
      load();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleAnular = async (f) => {
    const motivo = prompt('Motivo de anulación:');
    if (!motivo) return;
    try {
      await api.anularFactura(f._id || f.id, motivo);
      load();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const filtered = facturas.filter(f => {
    if (estadoFilter && f.estado !== estadoFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const pacNombre = typeof f.paciente === 'object' ? (f.paciente?.nombre || '') : (f.paciente_nombre || '');
    return (f.numero || '').toString().toLowerCase().includes(q) ||
           pacNombre.toLowerCase().includes(q);
  });

  const getPacienteNombre = (f) => {
    if (typeof f.paciente === 'object' && f.paciente) return f.paciente.nombre || f.paciente.nombres || '-';
    return f.paciente_nombre || '-';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-DO') : '-';
  const formatMoney = (v) => '$' + (Number(v) || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 });

  if (loading) return <div style={s.center}><FaSpinner className="spin" size={28} /> Cargando facturas...</div>;
  if (error) return <div style={s.center}><FaExclamationTriangle color="#e74c3c" size={28} /><br />{error}</div>;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}><FaFileInvoiceDollar style={{ marginRight: 10 }} />Facturas</h2>
        <div style={s.filters}>
          <div style={s.searchBox}>
            <FaSearch color="#aaa" />
            <input style={s.searchInput} placeholder="Buscar por número o paciente..." value={search} onChange={e => setSearch(e.target.value)} />
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
              <th style={s.th}>Número</th><th style={s.th}>Paciente</th>
              <th style={s.th}>Fecha</th><th style={s.th}>Total</th>
              <th style={s.th}>Estado</th><th style={s.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => {
              const est = ESTADO_STYLE[f.estado] || ESTADO_STYLE.borrador;
              return (
                <tr key={f._id || f.id}>
                  <td style={s.td}>{f.numero || f.numero_factura || '-'}</td>
                  <td style={s.td}>{getPacienteNombre(f)}</td>
                  <td style={s.td}>{formatDate(f.fecha || f.createdAt)}</td>
                  <td style={s.td}>{formatMoney(f.total || f.monto_total)}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: est.bg, color: est.color }}>{est.label}</span>
                  </td>
                  <td style={s.td}>
                    <button style={s.actBtn} onClick={() => setSelected(f)}><FaEye /> Ver</button>
                    {f.estado !== 'pagada' && f.estado !== 'anulada' && (
                      <button style={{ ...s.actBtn, color: '#27ae60' }} onClick={() => handlePagar(f)}><FaMoneyBillWave /> Pagar</button>
                    )}
                    {f.estado !== 'anulada' && (
                      <button style={{ ...s.actBtn, color: '#e74c3c' }} onClick={() => handleAnular(f)}><FaBan /> Anular</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={s.center}>No se encontraron facturas</div>}
      </div>

      {selected && (
        <div style={s.detail} onClick={() => setSelected(null)}>
          <div style={s.detailCard} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#0f4c75', marginTop: 0 }}>Factura #{selected.numero || selected.numero_factura}</h3>
            <p><strong>Paciente:</strong> {getPacienteNombre(selected)}</p>
            <p><strong>Fecha:</strong> {formatDate(selected.fecha || selected.createdAt)}</p>
            <p><strong>Total:</strong> {formatMoney(selected.total || selected.monto_total)}</p>
            <p><strong>Estado:</strong> {(ESTADO_STYLE[selected.estado] || {}).label || selected.estado}</p>
            {selected.items && (
              <>
                <h4 style={{ color: '#0f4c75' }}>Detalle</h4>
                <table style={{ ...s.table, fontSize: 13 }}>
                  <thead>
                    <tr><th style={s.th}>Concepto</th><th style={s.th}>Precio</th></tr>
                  </thead>
                  <tbody>
                    {selected.items.map((item, i) => (
                      <tr key={i}>
                        <td style={s.td}>{item.descripcion || item.nombre || item.concepto || '-'}</td>
                        <td style={s.td}>{formatMoney(item.precio || item.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            <div style={{ textAlign: 'right', marginTop: 20 }}>
              <button style={{ ...s.actBtn, padding: '8px 20px' }} onClick={() => setSelected(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
