import React, { useState, useEffect, useCallback } from 'react';
import {
  FaFlask, FaPlus, FaEdit, FaTrash, FaSpinner,
  FaExclamationTriangle, FaTimes, FaSearch
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
    padding: '5px 10px', border: 'none', borderRadius: 6,
    cursor: 'pointer', fontSize: 13, marginRight: 6, background: '#f0f0f0', color: '#333'
  },
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000
  },
  modal: { background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#0f4c75', margin: '0 0 20px' },
  field: { marginBottom: 14 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  select: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fff' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  center: { textAlign: 'center', padding: 60, color: '#888' }
};

const emptyForm = { nombre: '', codigo: '', categoria: '', precio: '', descripcion: '', activo: true };

export default function GestionEstudios() {
  const [estudios, setEstudios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [est, cats] = await Promise.all([api.getEstudios(), api.getCategorias()]);
      setEstudios(Array.isArray(est) ? est : []);
      setCategorias(Array.isArray(cats) ? cats : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setModal(true); };
  const openEdit = (e) => {
    setEditing(e);
    setForm({
      nombre: e.nombre || '', codigo: e.codigo || '', categoria: e.categoria || '',
      precio: e.precio || '', descripcion: e.descripcion || '', activo: e.activo !== false
    });
    setModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { ...form, precio: Number(form.precio) || 0 };
      if (editing) {
        await api.updateEstudio(editing._id || editing.id, payload);
      } else {
        await api.createEstudio(payload);
      }
      setModal(false);
      load();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (est) => {
    if (!window.confirm(`¿Eliminar estudio "${est.nombre}"?`)) return;
    try {
      await api.deleteEstudio(est._id || est.id);
      load();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const filtered = estudios.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (e.nombre || '').toLowerCase().includes(q) ||
           (e.codigo || '').toLowerCase().includes(q) ||
           (e.categoria || '').toLowerCase().includes(q);
  });

  if (loading) return <div style={s.center}><FaSpinner className="spin" size={28} /> Cargando estudios...</div>;
  if (error) return <div style={s.center}><FaExclamationTriangle color="#e74c3c" size={28} /><br />{error}</div>;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}><FaFlask style={{ marginRight: 10 }} />Catálogo de Estudios</h2>
        <button style={s.btn} onClick={openCreate}><FaPlus /> Nuevo Estudio</button>
      </div>

      <div style={s.searchBox}>
        <FaSearch color="#aaa" />
        <input style={s.searchInput} placeholder="Buscar por nombre, código o categoría..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Código</th><th style={s.th}>Nombre</th>
              <th style={s.th}>Categoría</th><th style={s.th}>Precio</th>
              <th style={s.th}>Estado</th><th style={s.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e._id || e.id}>
                <td style={s.td}>{e.codigo}</td>
                <td style={s.td}>{e.nombre}</td>
                <td style={s.td}>{e.categoria}</td>
                <td style={s.td}>${(Number(e.precio) || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                <td style={s.td}>
                  <span style={{ ...s.badge, background: e.activo !== false ? '#e6f9ed' : '#fde8e8', color: e.activo !== false ? '#27ae60' : '#e74c3c' }}>
                    {e.activo !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={s.td}>
                  <button style={s.actBtn} onClick={() => openEdit(e)}><FaEdit /></button>
                  <button style={{ ...s.actBtn, color: '#e74c3c' }} onClick={() => handleDelete(e)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={s.center}>No se encontraron estudios</div>}
      </div>

      {modal && (
        <div style={s.overlay} onClick={() => setModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={s.modalTitle}>{editing ? 'Editar Estudio' : 'Nuevo Estudio'}</h3>
              <FaTimes style={{ cursor: 'pointer', color: '#999' }} onClick={() => setModal(false)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Nombre</label>
              <input style={s.input} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Código</label>
              <input style={s.input} value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Categoría</label>
              <select style={s.select} value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                <option value="">Seleccionar...</option>
                {categorias.map(c => <option key={typeof c === 'string' ? c : c._id || c.id} value={typeof c === 'string' ? c : c.nombre}>{typeof c === 'string' ? c : c.nombre}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Precio</label>
              <input style={s.input} type="number" step="0.01" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Descripción</label>
              <textarea style={{ ...s.input, minHeight: 60, resize: 'vertical' }} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
            </div>
            <div style={s.field}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} />
                <label style={{ fontSize: 14, color: '#444' }}>Activo</label>
              </div>
            </div>
            <div style={s.modalActions}>
              <button style={{ ...s.btn, background: '#95a5a6' }} onClick={() => setModal(false)}>Cancelar</button>
              <button style={s.btn} onClick={handleSave} disabled={saving}>
                {saving ? <FaSpinner className="spin" /> : null} {editing ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
