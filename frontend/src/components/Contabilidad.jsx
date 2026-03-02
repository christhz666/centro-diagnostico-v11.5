import React, { useState, useEffect, useCallback } from 'react';
import {
  FaChartPie, FaPlus, FaTrash, FaSpinner, FaExclamationTriangle,
  FaTimes, FaArrowUp, FaArrowDown, FaBalanceScale
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
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 24 },
  summaryCard: {
    background: '#fff', borderRadius: 14, padding: 24,
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 16
  },
  iconCircle: {
    width: 50, height: 50, borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  summaryVal: { fontSize: 22, fontWeight: 800 },
  summaryLabel: { fontSize: 13, color: '#888' },
  tableWrap: { background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #eee', color: '#0f4c75', fontWeight: 700 },
  td: { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', color: '#333' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  actBtn: {
    padding: '5px 10px', border: 'none', borderRadius: 6,
    cursor: 'pointer', fontSize: 13, background: '#f0f0f0', color: '#e74c3c'
  },
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000
  },
  modal: { background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto' },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#0f4c75', margin: '0 0 20px' },
  field: { marginBottom: 14 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  select: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fff' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  center: { textAlign: 'center', padding: 60, color: '#888' }
};

const emptyForm = { tipo: 'ingreso', descripcion: '', monto: '', categoria: '', referencia: '' };

export default function Contabilidad() {
  const [movimientos, setMovimientos] = useState([]);
  const [resumen, setResumen] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [mov, res] = await Promise.all([api.getMovimientosContables(), api.getResumenContable()]);
      setMovimientos(Array.isArray(mov) ? mov : []);
      setResumen(res || {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.createMovimientoContable({ ...form, monto: Number(form.monto) || 0 });
      setModal(false);
      setForm({ ...emptyForm });
      load();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m) => {
    if (!window.confirm('¿Eliminar este movimiento?')) return;
    try {
      await api.deleteMovimientoContable(m._id || m.id);
      load();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-DO') : '-';
  const formatMoney = (v) => '$' + (Number(v) || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 });

  if (loading) return <div style={s.center}><FaSpinner className="spin" size={28} /> Cargando contabilidad...</div>;
  if (error) return <div style={s.center}><FaExclamationTriangle color="#e74c3c" size={28} /><br />{error}</div>;

  const ingresos = resumen.ingresos || resumen.totalIngresos || 0;
  const egresos = resumen.egresos || resumen.totalEgresos || 0;
  const balance = resumen.balance || (ingresos - egresos);

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}><FaChartPie style={{ marginRight: 10 }} />Contabilidad</h2>
        <button style={s.btn} onClick={() => setModal(true)}><FaPlus /> Nuevo Movimiento</button>
      </div>

      <div style={s.summaryGrid}>
        <div style={s.summaryCard}>
          <div style={{ ...s.iconCircle, background: '#e6f9ed' }}><FaArrowUp size={22} color="#27ae60" /></div>
          <div>
            <div style={{ ...s.summaryVal, color: '#27ae60' }}>{formatMoney(ingresos)}</div>
            <div style={s.summaryLabel}>Ingresos</div>
          </div>
        </div>
        <div style={s.summaryCard}>
          <div style={{ ...s.iconCircle, background: '#fde8e8' }}><FaArrowDown size={22} color="#e74c3c" /></div>
          <div>
            <div style={{ ...s.summaryVal, color: '#e74c3c' }}>{formatMoney(egresos)}</div>
            <div style={s.summaryLabel}>Egresos</div>
          </div>
        </div>
        <div style={s.summaryCard}>
          <div style={{ ...s.iconCircle, background: '#e3f0ff' }}><FaBalanceScale size={22} color="#2980b9" /></div>
          <div>
            <div style={{ ...s.summaryVal, color: balance >= 0 ? '#27ae60' : '#e74c3c' }}>{formatMoney(balance)}</div>
            <div style={s.summaryLabel}>Balance</div>
          </div>
        </div>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Fecha</th><th style={s.th}>Tipo</th>
              <th style={s.th}>Descripción</th><th style={s.th}>Categoría</th>
              <th style={s.th}>Monto</th><th style={s.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map(m => (
              <tr key={m._id || m.id}>
                <td style={s.td}>{formatDate(m.fecha || m.createdAt)}</td>
                <td style={s.td}>
                  <span style={{
                    ...s.badge,
                    background: m.tipo === 'ingreso' ? '#e6f9ed' : '#fde8e8',
                    color: m.tipo === 'ingreso' ? '#27ae60' : '#e74c3c'
                  }}>
                    {m.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                  </span>
                </td>
                <td style={s.td}>{m.descripcion || '-'}</td>
                <td style={s.td}>{m.categoria || '-'}</td>
                <td style={{ ...s.td, fontWeight: 700, color: m.tipo === 'ingreso' ? '#27ae60' : '#e74c3c' }}>
                  {formatMoney(m.monto)}
                </td>
                <td style={s.td}>
                  <button style={s.actBtn} onClick={() => handleDelete(m)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {movimientos.length === 0 && <div style={s.center}>No hay movimientos registrados</div>}
      </div>

      {modal && (
        <div style={s.overlay} onClick={() => setModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={s.modalTitle}>Nuevo Movimiento</h3>
              <FaTimes style={{ cursor: 'pointer', color: '#999' }} onClick={() => setModal(false)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Tipo</label>
              <select style={s.select} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Descripción</label>
              <input style={s.input} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Monto</label>
              <input style={s.input} type="number" step="0.01" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Categoría</label>
              <input style={s.input} value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Referencia</label>
              <input style={s.input} value={form.referencia} onChange={e => setForm({ ...form, referencia: e.target.value })} />
            </div>
            <div style={s.modalActions}>
              <button style={{ ...s.btn, background: '#95a5a6' }} onClick={() => setModal(false)}>Cancelar</button>
              <button style={s.btn} onClick={handleSave} disabled={saving}>
                {saving ? <FaSpinner className="spin" /> : null} Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
