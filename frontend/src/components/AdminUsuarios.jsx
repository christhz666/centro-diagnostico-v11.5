import React, { useState, useEffect, useCallback } from 'react';
import {
  FaUsers, FaPlus, FaEdit, FaToggleOn, FaToggleOff, FaKey,
  FaSpinner, FaExclamationTriangle, FaTimes, FaSearch
} from 'react-icons/fa';
import api from '../services/api.js';

const ROLE_COLORS = {
  admin: '#8e44ad', medico: '#16a085', laboratorio: '#e67e22', recepcion: '#2980b9'
};
const ROLES = ['admin', 'medico', 'laboratorio', 'recepcion'];

const s = {
  container: { padding: 24, fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: '#0f4c75', margin: 0 },
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
    background: '#3498db', color: '#fff', border: 'none', borderRadius: 10,
    cursor: 'pointer', fontWeight: 600, fontSize: 14
  },
  btnDanger: { background: '#e74c3c' },
  btnSuccess: { background: '#27ae60' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 },
  card: {
    background: '#fff', borderRadius: 14, padding: 20,
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)', position: 'relative'
  },
  cardInactive: { opacity: 0.6 },
  name: { fontSize: 17, fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px' },
  info: { fontSize: 13, color: '#666', margin: '2px 0' },
  badge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
    color: '#fff', fontSize: 12, fontWeight: 600, textTransform: 'capitalize'
  },
  actions: { display: 'flex', gap: 8, marginTop: 14 },
  actBtn: {
    padding: '6px 12px', border: 'none', borderRadius: 8,
    cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4,
    background: '#f0f0f0', color: '#333'
  },
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000
  },
  modal: {
    background: '#fff', borderRadius: 16, padding: 28, width: '100%',
    maxWidth: 480, maxHeight: '90vh', overflow: 'auto'
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#0f4c75', margin: '0 0 20px' },
  field: { marginBottom: 14 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 4 },
  input: {
    width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8,
    fontSize: 14, boxSizing: 'border-box', outline: 'none'
  },
  select: {
    width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8,
    fontSize: 14, boxSizing: 'border-box', background: '#fff'
  },
  checkRow: { display: 'flex', alignItems: 'center', gap: 8 },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  center: { textAlign: 'center', padding: 60, color: '#888' },
  searchBox: {
    display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 10,
    border: '1px solid #ddd', padding: '0 12px', marginBottom: 20
  },
  searchInput: { border: 'none', outline: 'none', padding: '10px 8px', fontSize: 14, flex: 1 },
  status: {
    position: 'absolute', top: 14, right: 14, width: 10, height: 10,
    borderRadius: '50%'
  }
};

const emptyForm = { nombre: '', email: '', username: '', password: '', role: 'recepcion', activo: true };

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
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
      const data = await api.getUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setModal(true); };
  const openEdit = (u) => {
    setEditing(u);
    setForm({ nombre: u.nombre || '', email: u.email || '', username: u.username || '', password: '', role: u.role || u.rol || 'recepcion', activo: u.activo !== false });
    setModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.updateUsuario(editing._id || editing.id, payload);
      } else {
        await api.createUsuario(form);
      }
      setModal(false);
      load();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (u) => {
    try {
      await api.toggleUsuario(u._id || u.id);
      load();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleResetPwd = async (u) => {
    const pwd = prompt('Nueva contraseña:');
    if (!pwd) return;
    try {
      await api.resetPasswordUsuario(u._id || u.id, pwd);
      alert('Contraseña actualizada');
    } catch (e) { alert('Error: ' + e.message); }
  };

  const filtered = usuarios.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.nombre || '').toLowerCase().includes(q) ||
           (u.email || '').toLowerCase().includes(q) ||
           (u.role || u.rol || '').toLowerCase().includes(q);
  });

  if (loading) return <div style={s.center}><FaSpinner className="spin" size={28} /> Cargando usuarios...</div>;
  if (error) return <div style={s.center}><FaExclamationTriangle color="#e74c3c" size={28} /><br />{error}</div>;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}><FaUsers style={{ marginRight: 10 }} />Gestión de Usuarios</h2>
        <button style={s.btn} onClick={openCreate}><FaPlus /> Nuevo Usuario</button>
      </div>

      <div style={s.searchBox}>
        <FaSearch color="#aaa" />
        <input style={s.searchInput} placeholder="Buscar por nombre, email o rol..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={s.grid}>
        {filtered.map(u => {
          const role = u.role || u.rol || 'recepcion';
          return (
            <div key={u._id || u.id} style={{ ...s.card, ...(u.activo === false ? s.cardInactive : {}) }}>
              <div style={{ ...s.status, background: u.activo !== false ? '#27ae60' : '#e74c3c' }} />
              <p style={s.name}>{u.nombre || u.username}</p>
              <p style={s.info}>{u.email}</p>
              <p style={s.info}>@{u.username}</p>
              <span style={{ ...s.badge, background: ROLE_COLORS[role] || '#888' }}>{role}</span>
              <div style={s.actions}>
                <button style={s.actBtn} onClick={() => openEdit(u)}><FaEdit /> Editar</button>
                <button style={s.actBtn} onClick={() => handleToggle(u)}>
                  {u.activo !== false ? <FaToggleOn color="#27ae60" /> : <FaToggleOff color="#e74c3c" />}
                  {u.activo !== false ? 'Desactivar' : 'Activar'}
                </button>
                <button style={s.actBtn} onClick={() => handleResetPwd(u)}><FaKey /> Clave</button>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <div style={s.center}>No se encontraron usuarios</div>}

      {modal && (
        <div style={s.overlay} onClick={() => setModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={s.modalTitle}>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <FaTimes style={{ cursor: 'pointer', color: '#999' }} onClick={() => setModal(false)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Nombre</label>
              <input style={s.input} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Username</label>
              <input style={s.input} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Contraseña{editing ? ' (dejar vacío para no cambiar)' : ''}</label>
              <input style={s.input} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Rol</label>
              <select style={s.select} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <div style={s.checkRow}>
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
