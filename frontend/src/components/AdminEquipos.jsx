import React, { useState, useEffect, useCallback } from 'react';
import {
  FaCogs, FaPlus, FaEdit, FaTrash, FaSpinner, FaExclamationTriangle,
  FaTimes, FaPlay, FaStop, FaFlask, FaXRay, FaSave, FaNetworkWired
} from 'react-icons/fa';
import api from '../services/api.js';

const s = {
  container: { padding: 24, fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: '#0f4c75', margin: 0 },
  tabs: { display: 'flex', gap: 0, marginBottom: 24, background: '#f0f0f0', borderRadius: 10, overflow: 'hidden' },
  tab: {
    padding: '12px 24px', border: 'none', cursor: 'pointer', fontSize: 14,
    fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
    background: 'transparent', color: '#666', transition: 'all 0.2s'
  },
  tabActive: { background: '#3498db', color: '#fff' },
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
    background: '#3498db', color: '#fff', border: 'none', borderRadius: 10,
    cursor: 'pointer', fontWeight: 600, fontSize: 14
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 16 },
  card: {
    background: '#fff', borderRadius: 14, padding: 20,
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)', position: 'relative'
  },
  cardName: { fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: '0 0 8px' },
  cardInfo: { fontSize: 13, color: '#666', margin: '3px 0' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  actions: { display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' },
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
  modal: { background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#0f4c75', margin: '0 0 20px' },
  field: { marginBottom: 14 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  select: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fff' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  center: { textAlign: 'center', padding: 60, color: '#888' },
  formCard: { background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  summaryCard: {
    background: '#f8f9fa', borderRadius: 10, padding: 16, marginTop: 20
  },
  summaryTitle: { fontSize: 14, fontWeight: 700, color: '#0f4c75', margin: '0 0 10px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }
};

const emptyEquipo = { nombre: '', marca: '', modelo: '', tipo: '', protocolo: '', ip: '', puerto: '', estado: 'activo' };

export default function AdminEquipos() {
  const [activeTab, setActiveTab] = useState('lis');
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyEquipo });
  const [saving, setSaving] = useState(false);

  // RIS-PACS config
  const [risConfig, setRisConfig] = useState({
    ris_in_ip: '', ris_in_port: '', ris_ae_title: '',
    pacs_ip: '', pacs_port: '', pacs_ae_title: '', ae_title_propio: ''
  });
  const [risLoading, setRisLoading] = useState(false);
  const [risSaving, setRisSaving] = useState(false);

  const loadEquipos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getEquipos();
      setEquipos(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRisConfig = useCallback(async () => {
    try {
      setRisLoading(true);
      const data = await api.getConfiguracion();
      const cfg = data?.data || data || {};
      setRisConfig({
        ris_in_ip: cfg.ris_in_ip || '', ris_in_port: cfg.ris_in_port || '',
        ris_ae_title: cfg.ris_ae_title || '', pacs_ip: cfg.pacs_ip || '',
        pacs_port: cfg.pacs_port || '', pacs_ae_title: cfg.pacs_ae_title || '',
        ae_title_propio: cfg.ae_title_propio || ''
      });
    } catch {
      // config may not exist yet
    } finally {
      setRisLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEquipos();
    loadRisConfig();
  }, [loadEquipos, loadRisConfig]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyEquipo }); setModal(true); };
  const openEdit = (eq) => {
    setEditing(eq);
    setForm({
      nombre: eq.nombre || '', marca: eq.marca || '', modelo: eq.modelo || '',
      tipo: eq.tipo || '', protocolo: eq.protocolo || '', ip: eq.ip || '',
      puerto: eq.puerto || '', estado: eq.estado || 'activo'
    });
    setModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editing) {
        await api.updateEquipo(editing._id || editing.id, form);
      } else {
        await api.createEquipo(form);
      }
      setModal(false);
      loadEquipos();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eq) => {
    if (!window.confirm(`¿Eliminar equipo "${eq.nombre}"?`)) return;
    try {
      await api.deleteEquipo(eq._id || eq.id);
      loadEquipos();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleToggleStatus = async (eq) => {
    const newEstado = eq.estado === 'activo' ? 'inactivo' : 'activo';
    try {
      await api.updateEquipo(eq._id || eq.id, { ...eq, estado: newEstado });
      loadEquipos();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleSaveRis = async () => {
    try {
      setRisSaving(true);
      await api.updateConfiguracion(risConfig);
      alert('Configuración RIS/PACS guardada');
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setRisSaving(false);
    }
  };

  if (loading) return <div style={s.center}><FaSpinner className="spin" size={28} /> Cargando equipos...</div>;
  if (error) return <div style={s.center}><FaExclamationTriangle color="#e74c3c" size={28} /><br />{error}</div>;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}><FaCogs style={{ marginRight: 10 }} />Gestión de Equipos</h2>
      </div>

      <div style={s.tabs}>
        <button style={{ ...s.tab, ...(activeTab === 'lis' ? s.tabActive : {}) }} onClick={() => setActiveTab('lis')}>
          <FaFlask /> Laboratorio (LIS)
        </button>
        <button style={{ ...s.tab, ...(activeTab === 'ris' ? s.tabActive : {}) }} onClick={() => setActiveTab('ris')}>
          <FaXRay /> Rayos X / RIS-PACS
        </button>
      </div>

      {activeTab === 'lis' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button style={s.btn} onClick={openCreate}><FaPlus /> Nuevo Equipo</button>
          </div>

          <div style={s.grid}>
            {equipos.map(eq => (
              <div key={eq._id || eq.id} style={s.card}>
                <p style={s.cardName}>{eq.nombre}</p>
                <p style={s.cardInfo}><strong>Marca:</strong> {eq.marca || '-'}</p>
                <p style={s.cardInfo}><strong>Modelo:</strong> {eq.modelo || '-'}</p>
                <p style={s.cardInfo}><strong>Tipo:</strong> {eq.tipo || '-'}</p>
                <p style={s.cardInfo}><strong>Protocolo:</strong> {eq.protocolo || '-'}</p>
                <p style={s.cardInfo}><FaNetworkWired style={{ marginRight: 4 }} />{eq.ip || '-'}:{eq.puerto || '-'}</p>
                <span style={{
                  ...s.badge,
                  background: eq.estado === 'activo' ? '#e6f9ed' : '#fde8e8',
                  color: eq.estado === 'activo' ? '#27ae60' : '#e74c3c'
                }}>
                  {eq.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
                <div style={s.actions}>
                  <button style={s.actBtn} onClick={() => openEdit(eq)}><FaEdit /> Editar</button>
                  <button style={s.actBtn} onClick={() => handleToggleStatus(eq)}>
                    {eq.estado === 'activo' ? <><FaStop color="#e74c3c" /> Detener</> : <><FaPlay color="#27ae60" /> Iniciar</>}
                  </button>
                  <button style={{ ...s.actBtn, color: '#e74c3c' }} onClick={() => handleDelete(eq)}><FaTrash /> Eliminar</button>
                </div>
              </div>
            ))}
          </div>
          {equipos.length === 0 && <div style={s.center}>No hay equipos registrados</div>}
        </>
      )}

      {activeTab === 'ris' && (
        <div style={s.formCard}>
          {risLoading ? (
            <div style={s.center}><FaSpinner className="spin" size={28} /></div>
          ) : (
            <>
              <h3 style={{ color: '#0f4c75', margin: '0 0 20px' }}><FaXRay style={{ marginRight: 8 }} />Configuración RIS / PACS</h3>

              <h4 style={{ color: '#555', margin: '16px 0 10px', fontSize: 14 }}>RIS-IN (Entrada)</h4>
              <div style={s.fieldGrid}>
                <div style={s.field}>
                  <label style={s.label}>RIS-IN IP</label>
                  <input style={s.input} value={risConfig.ris_in_ip} onChange={e => setRisConfig({ ...risConfig, ris_in_ip: e.target.value })} placeholder="0.0.0.0" />
                </div>
                <div style={s.field}>
                  <label style={s.label}>RIS-IN Puerto</label>
                  <input style={s.input} value={risConfig.ris_in_port} onChange={e => setRisConfig({ ...risConfig, ris_in_port: e.target.value })} placeholder="2575" />
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>RIS AE Title</label>
                <input style={s.input} value={risConfig.ris_ae_title} onChange={e => setRisConfig({ ...risConfig, ris_ae_title: e.target.value })} placeholder="RIS_AE" />
              </div>

              <h4 style={{ color: '#555', margin: '20px 0 10px', fontSize: 14 }}>PACS</h4>
              <div style={s.fieldGrid}>
                <div style={s.field}>
                  <label style={s.label}>PACS IP</label>
                  <input style={s.input} value={risConfig.pacs_ip} onChange={e => setRisConfig({ ...risConfig, pacs_ip: e.target.value })} placeholder="192.168.1.100" />
                </div>
                <div style={s.field}>
                  <label style={s.label}>PACS Puerto</label>
                  <input style={s.input} value={risConfig.pacs_port} onChange={e => setRisConfig({ ...risConfig, pacs_port: e.target.value })} placeholder="4242" />
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>PACS AE Title</label>
                <input style={s.input} value={risConfig.pacs_ae_title} onChange={e => setRisConfig({ ...risConfig, pacs_ae_title: e.target.value })} placeholder="PACS_AE" />
              </div>

              <h4 style={{ color: '#555', margin: '20px 0 10px', fontSize: 14 }}>AE Title Propio</h4>
              <div style={s.field}>
                <label style={s.label}>AE Title del sistema</label>
                <input style={s.input} value={risConfig.ae_title_propio} onChange={e => setRisConfig({ ...risConfig, ae_title_propio: e.target.value })} placeholder="CENTRO_DIAG" />
              </div>

              <button style={s.btn} onClick={handleSaveRis} disabled={risSaving}>
                {risSaving ? <FaSpinner className="spin" /> : <FaSave />} Guardar Configuración
              </button>

              <div style={s.summaryCard}>
                <h4 style={s.summaryTitle}>Resumen de Configuración</h4>
                <div style={s.summaryRow}><span>RIS-IN:</span><span>{risConfig.ris_in_ip || '-'}:{risConfig.ris_in_port || '-'}</span></div>
                <div style={s.summaryRow}><span>RIS AE Title:</span><span>{risConfig.ris_ae_title || '-'}</span></div>
                <div style={s.summaryRow}><span>PACS:</span><span>{risConfig.pacs_ip || '-'}:{risConfig.pacs_port || '-'}</span></div>
                <div style={s.summaryRow}><span>PACS AE Title:</span><span>{risConfig.pacs_ae_title || '-'}</span></div>
                <div style={s.summaryRow}><span>AE Title Propio:</span><span>{risConfig.ae_title_propio || '-'}</span></div>
              </div>
            </>
          )}
        </div>
      )}

      {modal && (
        <div style={s.overlay} onClick={() => setModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={s.modalTitle}>{editing ? 'Editar Equipo' : 'Nuevo Equipo'}</h3>
              <FaTimes style={{ cursor: 'pointer', color: '#999' }} onClick={() => setModal(false)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Nombre</label>
              <input style={s.input} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Marca</label>
              <input style={s.input} value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Modelo</label>
              <input style={s.input} value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Tipo</label>
              <select style={s.select} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                <option value="">Seleccionar...</option>
                <option value="analizador">Analizador</option>
                <option value="centrifuga">Centrífuga</option>
                <option value="microscopio">Microscopio</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Protocolo</label>
              <select style={s.select} value={form.protocolo} onChange={e => setForm({ ...form, protocolo: e.target.value })}>
                <option value="">Seleccionar...</option>
                <option value="HL7">HL7</option>
                <option value="ASTM">ASTM</option>
                <option value="serial">Serial</option>
                <option value="tcp">TCP/IP</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>IP</label>
              <input style={s.input} value={form.ip} onChange={e => setForm({ ...form, ip: e.target.value })} placeholder="192.168.1.x" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Puerto</label>
              <input style={s.input} value={form.puerto} onChange={e => setForm({ ...form, puerto: e.target.value })} placeholder="9100" />
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
