import React, { useState, useEffect, useCallback } from 'react';
import { FaUserPlus, FaSearch, FaPlus, FaTrash, FaSpinner, FaCheck, FaPrint } from 'react-icons/fa';
import api from '../services/api.js';
import FacturaTermica from './FacturaTermica';

const SEGUROS_OPTIONS = [
  'Sin seguro', 'SENASA', 'ARS Humano', 'ARS Palic', 'ARS Universal',
  'Mapfre Salud', 'ARS Meta Salud', 'ARS Monumental', 'ARS Futuro', 'Otro'
];

const SEGURO_TIPOS = ['privado', 'ARS', 'SENASA', 'ninguno'];
const METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia', 'mixto'];

const calcularEdad = (fechaNac) => {
  if (!fechaNac) return null;
  const hoy = new Date();
  const nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    maxWidth: 960,
    margin: '0 auto',
    padding: 24,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1a3a5c',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  stepper: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  stepBtn: (active, completed) => ({
    padding: '10px 28px',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    background: active ? '#2563eb' : completed ? '#dbeafe' : '#f1f5f9',
    color: active ? '#fff' : completed ? '#2563eb' : '#64748b',
    transition: 'all .2s',
  }),
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif",
  },
  inputDisabled: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    background: '#f1f5f9',
    color: '#94a3b8',
    fontFamily: "'Inter', sans-serif",
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
    fontFamily: "'Inter', sans-serif",
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 12,
  },
  row3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 16,
    marginBottom: 12,
  },
  field: { marginBottom: 12 },
  section: {
    fontSize: 15,
    fontWeight: 700,
    color: '#2563eb',
    marginTop: 18,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: '2px solid #dbeafe',
  },
  btnPrimary: {
    padding: '10px 24px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  btnSecondary: {
    padding: '10px 24px',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  btnDanger: {
    padding: '6px 12px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
  },
  btnSuccess: {
    padding: '12px 32px',
    background: '#16a34a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    background: '#fef3c7',
    color: '#92400e',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
  },
  searchResult: {
    padding: '10px 14px',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background .15s',
  },
  tableHeader: {
    background: '#1a3a5c',
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: 14,
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: '#1a3a5c',
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 16,
    marginTop: 8,
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 12,
  },
};

const initialPaciente = {
  nombre: '', apellido: '', cedula: '', esMenor: false,
  fechaNacimiento: '', sexo: '', nacionalidad: 'Dominicana',
  telefono: '', telefonoSecundario: '', email: '',
  direccion: { calle: '', sector: '', ciudad: '', provincia: '' },
  tipoSangre: '',
  alergias: '', condicionesPreexistentes: '',
  seguro: { nombre: 'Sin seguro', numeroAfiliado: '', tipo: 'ninguno' },
  contactoEmergencia: { nombre: '', telefono: '', relacion: '' },
  notas: '',
};

const RegistroInteligente = () => {
  const [paso, setPaso] = useState(1);
  const [paciente, setPaciente] = useState({ ...initialPaciente, direccion: { ...initialPaciente.direccion }, seguro: { ...initialPaciente.seguro }, contactoEmergencia: { ...initialPaciente.contactoEmergencia } });
  const [pacienteId, setPacienteId] = useState(null);
  const [esMenor, setEsMenor] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [modoNuevo, setModoNuevo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Step 2
  const [estudiosDisponibles, setEstudiosDisponibles] = useState([]);
  const [filtroEstudio, setFiltroEstudio] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [estudiosSeleccionados, setEstudiosSeleccionados] = useState([]);
  const [cargandoEstudios, setCargandoEstudios] = useState(false);

  // Step 3
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [descuentoAdicional, setDescuentoAdicional] = useState(0);
  const [montoPagado, setMontoPagado] = useState(0);
  const [autorizacion, setAutorizacion] = useState('');
  const [finalizando, setFinalizando] = useState(false);
  const [facturaCreada, setFacturaCreada] = useState(null);
  const [mostrarFactura, setMostrarFactura] = useState(false);

  // Load estudios on step 2
  useEffect(() => {
    if (paso === 2 && estudiosDisponibles.length === 0) {
      setCargandoEstudios(true);
      Promise.all([
        api.getEstudios().catch(() => []),
        api.getCategorias().catch(() => []),
      ]).then(([est, cats]) => {
        setEstudiosDisponibles(Array.isArray(est) ? est : []);
        setCategorias(Array.isArray(cats) ? cats : []);
      }).finally(() => setCargandoEstudios(false));
    }
  }, [paso]);

  // Auto minor detection
  useEffect(() => {
    if (!paciente.fechaNacimiento) return;
    const edad = calcularEdad(paciente.fechaNacimiento);
    if (edad !== null && edad < 18) {
      setEsMenor(true);
      setPaciente(prev => ({ ...prev, esMenor: true, cedula: 'MENOR DE EDAD' }));
    } else {
      setEsMenor(false);
      setPaciente(prev => ({
        ...prev,
        esMenor: false,
        cedula: prev.cedula === 'MENOR DE EDAD' ? '' : prev.cedula,
      }));
    }
  }, [paciente.fechaNacimiento]);

  const buscarPaciente = useCallback(async () => {
    if (!busqueda.trim()) return;
    setBuscando(true);
    setError('');
    try {
      const res = await api.getPacientes({ search: busqueda.trim() });
      setResultadosBusqueda(Array.isArray(res) ? res : []);
    } catch {
      setResultadosBusqueda([]);
    } finally {
      setBuscando(false);
    }
  }, [busqueda]);

  const seleccionarPaciente = (p) => {
    const seguro = p.seguro && typeof p.seguro === 'object'
      ? { nombre: p.seguro.nombre || 'Sin seguro', numeroAfiliado: p.seguro.numeroAfiliado || p.seguro.numeroPoliza || '', tipo: p.seguro.tipo || 'ninguno' }
      : { ...initialPaciente.seguro };
    const direccion = p.direccion && typeof p.direccion === 'object'
      ? { calle: p.direccion.calle || '', sector: p.direccion.sector || '', ciudad: p.direccion.ciudad || '', provincia: p.direccion.provincia || '' }
      : { ...initialPaciente.direccion };
    const contactoEmergencia = p.contactoEmergencia && typeof p.contactoEmergencia === 'object'
      ? { nombre: p.contactoEmergencia.nombre || '', telefono: p.contactoEmergencia.telefono || '', relacion: p.contactoEmergencia.relacion || '' }
      : { ...initialPaciente.contactoEmergencia };

    setPaciente({
      nombre: p.nombre || '',
      apellido: p.apellido || '',
      cedula: p.cedula || '',
      esMenor: p.esMenor || false,
      fechaNacimiento: p.fechaNacimiento ? p.fechaNacimiento.substring(0, 10) : '',
      sexo: p.sexo || '',
      nacionalidad: p.nacionalidad || 'Dominicana',
      telefono: p.telefono || '',
      telefonoSecundario: p.telefonoSecundario || '',
      email: p.email || '',
      direccion,
      tipoSangre: p.tipoSangre || '',
      alergias: Array.isArray(p.alergias) ? p.alergias.join(', ') : (p.alergias || ''),
      condicionesPreexistentes: Array.isArray(p.condicionesPreexistentes) ? p.condicionesPreexistentes.join(', ') : (p.condicionesPreexistentes || ''),
      seguro,
      contactoEmergencia,
      notas: p.notas || '',
    });
    setPacienteId(p._id || p.id);
    setModoNuevo(false);
    setResultadosBusqueda([]);
    setBusqueda('');
    if (p.esMenor) setEsMenor(true);
  };

  const crearPaciente = async () => {
    setError('');
    if (!paciente.nombre.trim() || !paciente.apellido.trim()) {
      setError('Nombre y apellido son obligatorios.');
      return;
    }
    if (!paciente.fechaNacimiento) {
      setError('Fecha de nacimiento es obligatoria.');
      return;
    }
    if (!paciente.sexo) {
      setError('Sexo es obligatorio.');
      return;
    }
    if (!paciente.telefono.trim()) {
      setError('Teléfono es obligatorio.');
      return;
    }

    setGuardando(true);
    try {
      const alergiasArr = paciente.alergias
        ? paciente.alergias.split(',').map(a => a.trim()).filter(Boolean)
        : [];
      const condicionesArr = paciente.condicionesPreexistentes
        ? paciente.condicionesPreexistentes.split(',').map(c => c.trim()).filter(Boolean)
        : [];

      const pacienteData = {
        nombre: paciente.nombre.trim(),
        apellido: paciente.apellido.trim(),
        cedula: paciente.cedula.trim() || undefined,
        esMenor: paciente.esMenor,
        fechaNacimiento: paciente.fechaNacimiento,
        sexo: paciente.sexo,
        nacionalidad: paciente.nacionalidad || 'Dominicana',
        telefono: paciente.telefono.trim(),
        telefonoSecundario: paciente.telefonoSecundario.trim() || undefined,
        email: paciente.email.trim() || undefined,
        direccion: {
          calle: paciente.direccion.calle.trim() || undefined,
          sector: paciente.direccion.sector.trim() || undefined,
          ciudad: paciente.direccion.ciudad.trim() || undefined,
          provincia: paciente.direccion.provincia.trim() || undefined,
        },
        tipoSangre: paciente.tipoSangre || undefined,
        alergias: alergiasArr.length > 0 ? alergiasArr : undefined,
        condicionesPreexistentes: condicionesArr.length > 0 ? condicionesArr : undefined,
        seguro: paciente.seguro.nombre && paciente.seguro.nombre !== 'Sin seguro'
          ? {
              nombre: paciente.seguro.nombre,
              numeroAfiliado: paciente.seguro.numeroAfiliado || undefined,
              tipo: paciente.seguro.tipo || 'ninguno',
            }
          : undefined,
        contactoEmergencia: paciente.contactoEmergencia.nombre
          ? {
              nombre: paciente.contactoEmergencia.nombre,
              telefono: paciente.contactoEmergencia.telefono || undefined,
              relacion: paciente.contactoEmergencia.relacion || undefined,
            }
          : undefined,
        notas: paciente.notas.trim() || undefined,
      };

      const res = await api.createPaciente(pacienteData);
      setPacienteId(res._id || res.id);
      setModoNuevo(false);
    } catch (err) {
      setError(err.message || 'Error al crear paciente.');
    } finally {
      setGuardando(false);
    }
  };

  const updateField = (field, value) => {
    setPaciente(prev => ({ ...prev, [field]: value }));
  };

  const updateNested = (parent, field, value) => {
    setPaciente(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));
  };

  // Step 2 helpers
  const estudiosFiltrados = estudiosDisponibles.filter(e => {
    const texto = filtroEstudio.toLowerCase();
    const matchTexto = !texto ||
      (e.nombre || '').toLowerCase().includes(texto) ||
      (e.codigo || '').toLowerCase().includes(texto) ||
      (e.categoria || '').toLowerCase().includes(texto);
    const matchCat = !categoriaFiltro || e.categoria === categoriaFiltro;
    return matchTexto && matchCat;
  });

  const agregarEstudio = (estudio) => {
    if (estudiosSeleccionados.find(e => (e._id || e.id) === (estudio._id || estudio.id))) return;
    setEstudiosSeleccionados(prev => [
      ...prev,
      {
        ...estudio,
        cobertura: 0,
      },
    ]);
  };

  const quitarEstudio = (idx) => {
    setEstudiosSeleccionados(prev => prev.filter((_, i) => i !== idx));
  };

  const setCoberturaEstudio = (idx, value) => {
    setEstudiosSeleccionados(prev => prev.map((e, i) => i === idx ? { ...e, cobertura: parseFloat(value) || 0 } : e));
  };

  const subtotal = estudiosSeleccionados.reduce((s, e) => s + (e.precio || 0), 0);
  const totalCobertura = estudiosSeleccionados.reduce((s, e) => s + (e.cobertura || 0), 0);
  const totalFinal = Math.max(0, subtotal - totalCobertura - (parseFloat(descuentoAdicional) || 0));
  const cambio = montoPagado > totalFinal ? montoPagado - totalFinal : 0;

  const puedeAvanzar = (step) => {
    if (step === 1) return !!pacienteId;
    if (step === 2) return estudiosSeleccionados.length > 0;
    return true;
  };

  const finalizar = async () => {
    setError('');
    setFinalizando(true);
    try {
      const citaData = {
        paciente: pacienteId,
        estudios: estudiosSeleccionados.map(e => ({
          estudio: e._id || e.id,
          precio: e.precio || 0,
          descuento: e.cobertura || 0,
        })),
        subtotal,
        descuentoTotal: totalCobertura + (parseFloat(descuentoAdicional) || 0),
        total: totalFinal,
        metodoPago,
        pagado: montoPagado >= totalFinal,
        seguroAplicado: paciente.seguro.nombre && paciente.seguro.nombre !== 'Sin seguro'
          ? { nombre: paciente.seguro.nombre, cobertura: totalCobertura, autorizacion }
          : undefined,
      };

      const cita = await api.createCita(citaData);
      const citaId = cita._id || cita.id;

      const factura = await api.createFactura({
        cita: citaId,
        orden_id: citaId,
        metodoPago,
        montoPagado: parseFloat(montoPagado) || 0,
        descuento: parseFloat(descuentoAdicional) || 0,
      });

      setFacturaCreada(factura);
      setMostrarFactura(true);
    } catch (err) {
      setError(err.message || 'Error al finalizar registro.');
    } finally {
      setFinalizando(false);
    }
  };

  const resetTodo = () => {
    setPaso(1);
    setPaciente({ ...initialPaciente, direccion: { ...initialPaciente.direccion }, seguro: { ...initialPaciente.seguro }, contactoEmergencia: { ...initialPaciente.contactoEmergencia } });
    setPacienteId(null);
    setEsMenor(false);
    setBusqueda('');
    setResultadosBusqueda([]);
    setModoNuevo(false);
    setEstudiosSeleccionados([]);
    setMetodoPago('efectivo');
    setDescuentoAdicional(0);
    setMontoPagado(0);
    setAutorizacion('');
    setFacturaCreada(null);
    setMostrarFactura(false);
    setError('');
  };

  if (mostrarFactura && facturaCreada) {
    return (
      <div style={styles.container}>
        <FacturaTermica
          factura={facturaCreada}
          paciente={paciente}
          estudios={estudiosSeleccionados.map(e => ({
            nombre: e.nombre,
            precio: e.precio || 0,
            cobertura: e.cobertura || 0,
          }))}
          onClose={resetTodo}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <h1 style={styles.title}><FaUserPlus /> Registro Inteligente</h1>

      {/* Stepper */}
      <div style={styles.stepper}>
        {['Paciente', 'Estudios', 'Pago'].map((label, i) => (
          <button
            key={label}
            style={styles.stepBtn(paso === i + 1, paso > i + 1)}
            onClick={() => { if (i + 1 < paso || puedeAvanzar(i)) setPaso(i + 1); }}
          >
            {paso > i + 1 && <FaCheck style={{ marginRight: 4 }} />}
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* STEP 1: Paciente */}
      {paso === 1 && (
        <div style={styles.card}>
          {!modoNuevo && !pacienteId && (
            <>
              <p style={styles.section}>Buscar paciente existente</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="Nombre, apellido o cédula..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && buscarPaciente()}
                />
                <button style={styles.btnPrimary} onClick={buscarPaciente} disabled={buscando}>
                  {buscando ? <FaSpinner className="spin" /> : <FaSearch />} Buscar
                </button>
              </div>

              {resultadosBusqueda.length > 0 && (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, maxHeight: 220, overflowY: 'auto', marginBottom: 16 }}>
                  {resultadosBusqueda.map(p => (
                    <div
                      key={p._id || p.id}
                      style={styles.searchResult}
                      onClick={() => seleccionarPaciente(p)}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontWeight: 600 }}>{p.nombre} {p.apellido}</span>
                      <span style={{ color: '#64748b', fontSize: 13 }}>{p.cedula || 'Sin cédula'} &middot; {p.telefono || ''}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button style={styles.btnPrimary} onClick={() => setModoNuevo(true)}>
                  <FaPlus /> Crear paciente nuevo
                </button>
              </div>
            </>
          )}

          {(modoNuevo || pacienteId) && (
            <>
              {pacienteId && (
                <div style={{ ...styles.badge, marginBottom: 14, background: '#dcfce7', color: '#166534' }}>
                  <FaCheck style={{ marginRight: 4 }} /> Paciente seleccionado: {paciente.nombre} {paciente.apellido}
                </div>
              )}

              {esMenor && (
                <div style={{ ...styles.badge, marginBottom: 14 }}>
                  👶 Menor de Edad detectado — Cédula asignada automáticamente
                </div>
              )}

              <p style={styles.section}>Datos personales</p>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Nombre *</label>
                  <input style={styles.input} value={paciente.nombre} onChange={e => updateField('nombre', e.target.value)} disabled={!!pacienteId} />
                </div>
                <div>
                  <label style={styles.label}>Apellido *</label>
                  <input style={styles.input} value={paciente.apellido} onChange={e => updateField('apellido', e.target.value)} disabled={!!pacienteId} />
                </div>
              </div>

              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Fecha de Nacimiento *</label>
                  <input type="date" style={styles.input} value={paciente.fechaNacimiento} onChange={e => updateField('fechaNacimiento', e.target.value)} disabled={!!pacienteId} />
                </div>
                <div>
                  <label style={styles.label}>Cédula {esMenor ? '' : '(opcional)'}</label>
                  <input
                    style={esMenor ? styles.inputDisabled : styles.input}
                    value={paciente.cedula}
                    onChange={e => updateField('cedula', e.target.value)}
                    disabled={esMenor || !!pacienteId}
                    placeholder={esMenor ? '' : 'Ej: 001-1234567-8'}
                  />
                </div>
              </div>

              <div style={styles.row3}>
                <div>
                  <label style={styles.label}>Sexo *</label>
                  <select style={styles.select} value={paciente.sexo} onChange={e => updateField('sexo', e.target.value)} disabled={!!pacienteId}>
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Nacionalidad *</label>
                  <input style={styles.input} value={paciente.nacionalidad} onChange={e => updateField('nacionalidad', e.target.value)} disabled={!!pacienteId} />
                </div>
                <div>
                  <label style={styles.label}>Tipo de Sangre</label>
                  <select style={styles.select} value={paciente.tipoSangre} onChange={e => updateField('tipoSangre', e.target.value)} disabled={!!pacienteId}>
                    <option value="">Seleccionar</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <p style={styles.section}>Contacto</p>
              <div style={styles.row3}>
                <div>
                  <label style={styles.label}>Teléfono *</label>
                  <input style={styles.input} value={paciente.telefono} onChange={e => updateField('telefono', e.target.value)} disabled={!!pacienteId} />
                </div>
                <div>
                  <label style={styles.label}>Teléfono Secundario</label>
                  <input style={styles.input} value={paciente.telefonoSecundario} onChange={e => updateField('telefonoSecundario', e.target.value)} disabled={!!pacienteId} />
                </div>
                <div>
                  <label style={styles.label}>Email</label>
                  <input type="email" style={styles.input} value={paciente.email} onChange={e => updateField('email', e.target.value)} disabled={!!pacienteId} />
                </div>
              </div>

              <p style={styles.section}>Dirección</p>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Calle</label>
                  <input style={styles.input} value={paciente.direccion.calle} onChange={e => updateNested('direccion', 'calle', e.target.value)} disabled={!!pacienteId} />
                </div>
                <div>
                  <label style={styles.label}>Sector</label>
                  <input style={styles.input} value={paciente.direccion.sector} onChange={e => updateNested('direccion', 'sector', e.target.value)} disabled={!!pacienteId} />
                </div>
              </div>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Ciudad</label>
                  <input style={styles.input} value={paciente.direccion.ciudad} onChange={e => updateNested('direccion', 'ciudad', e.target.value)} disabled={!!pacienteId} />
                </div>
                <div>
                  <label style={styles.label}>Provincia</label>
                  <input style={styles.input} value={paciente.direccion.provincia} onChange={e => updateNested('direccion', 'provincia', e.target.value)} disabled={!!pacienteId} />
                </div>
              </div>

              <p style={styles.section}>Seguro Médico</p>
              <div style={styles.row3}>
                <div>
                  <label style={styles.label}>Seguro</label>
                  <select style={styles.select} value={paciente.seguro.nombre} onChange={e => updateNested('seguro', 'nombre', e.target.value)} disabled={!!pacienteId}>
                    {SEGUROS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>No. Afiliado</label>
                  <input style={styles.input} value={paciente.seguro.numeroAfiliado} onChange={e => updateNested('seguro', 'numeroAfiliado', e.target.value)} disabled={!!pacienteId} />
                </div>
                <div>
                  <label style={styles.label}>Tipo</label>
                  <select style={styles.select} value={paciente.seguro.tipo} onChange={e => updateNested('seguro', 'tipo', e.target.value)} disabled={!!pacienteId}>
                    {SEGURO_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <p style={styles.section}>Información Médica</p>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Alergias (separadas por coma)</label>
                  <input style={styles.input} value={paciente.alergias} onChange={e => updateField('alergias', e.target.value)} placeholder="Penicilina, Yodo..." disabled={!!pacienteId} />
                </div>
                <div>
                  <label style={styles.label}>Condiciones Preexistentes (separadas por coma)</label>
                  <input style={styles.input} value={paciente.condicionesPreexistentes} onChange={e => updateField('condicionesPreexistentes', e.target.value)} placeholder="Diabetes, Hipertensión..." disabled={!!pacienteId} />
                </div>
              </div>

              <p style={styles.section}>Contacto de Emergencia</p>
              <div style={styles.row3}>
                <div>
                  <label style={styles.label}>Nombre</label>
                  <input style={styles.input} value={paciente.contactoEmergencia.nombre} onChange={e => updateNested('contactoEmergencia', 'nombre', e.target.value)} disabled={!!pacienteId} />
                </div>
                <div>
                  <label style={styles.label}>Teléfono</label>
                  <input style={styles.input} value={paciente.contactoEmergencia.telefono} onChange={e => updateNested('contactoEmergencia', 'telefono', e.target.value)} disabled={!!pacienteId} />
                </div>
                <div>
                  <label style={styles.label}>Relación</label>
                  <input style={styles.input} value={paciente.contactoEmergencia.relacion} onChange={e => updateNested('contactoEmergencia', 'relacion', e.target.value)} placeholder="Madre, Padre, Esposo/a..." disabled={!!pacienteId} />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Notas</label>
                <textarea
                  style={{ ...styles.input, minHeight: 60, resize: 'vertical' }}
                  value={paciente.notas}
                  onChange={e => updateField('notas', e.target.value)}
                  disabled={!!pacienteId}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
                {!pacienteId && (
                  <button style={styles.btnSecondary} onClick={() => { setModoNuevo(false); setPaciente({ ...initialPaciente, direccion: { ...initialPaciente.direccion }, seguro: { ...initialPaciente.seguro }, contactoEmergencia: { ...initialPaciente.contactoEmergencia } }); setEsMenor(false); }}>
                    Cancelar
                  </button>
                )}
                {pacienteId && (
                  <button style={styles.btnSecondary} onClick={() => { setPacienteId(null); setModoNuevo(false); setPaciente({ ...initialPaciente, direccion: { ...initialPaciente.direccion }, seguro: { ...initialPaciente.seguro }, contactoEmergencia: { ...initialPaciente.contactoEmergencia } }); setEsMenor(false); }}>
                    Cambiar paciente
                  </button>
                )}
                {!pacienteId && (
                  <button style={styles.btnPrimary} onClick={crearPaciente} disabled={guardando}>
                    {guardando ? <FaSpinner /> : <FaUserPlus />} Guardar Paciente
                  </button>
                )}
                {pacienteId && (
                  <button style={styles.btnPrimary} onClick={() => setPaso(2)}>
                    Continuar a Estudios →
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 2: Estudios */}
      {paso === 2 && (
        <div style={styles.card}>
          <p style={styles.section}>Buscar y agregar estudios</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              style={{ ...styles.input, flex: 1 }}
              placeholder="Buscar por nombre, código o categoría..."
              value={filtroEstudio}
              onChange={e => setFiltroEstudio(e.target.value)}
            />
            <select style={{ ...styles.select, width: 180 }} value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categorias.map(c => {
                const cat = typeof c === 'string' ? c : c.nombre || c.categoria || '';
                return <option key={cat} value={cat}>{cat}</option>;
              })}
            </select>
          </div>

          {cargandoEstudios ? (
            <div style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
              <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Cargando estudios...
            </div>
          ) : (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, maxHeight: 250, overflowY: 'auto', marginBottom: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Código</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Nombre</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Categoría</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Precio</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {estudiosFiltrados.map(e => {
                    const yaAgregado = estudiosSeleccionados.some(s => (s._id || s.id) === (e._id || e.id));
                    return (
                      <tr key={e._id || e.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: yaAgregado ? 0.5 : 1 }}>
                        <td style={{ padding: '8px 12px', fontSize: 13, color: '#64748b' }}>{e.codigo || '-'}</td>
                        <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 500 }}>{e.nombre}</td>
                        <td style={{ padding: '8px 12px', fontSize: 13, color: '#64748b' }}>{e.categoria || '-'}</td>
                        <td style={{ padding: '8px 12px', fontSize: 13, textAlign: 'right', fontWeight: 600 }}>${(e.precio || 0).toFixed(2)}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <button
                            style={{ ...styles.btnPrimary, padding: '4px 10px', fontSize: 12 }}
                            onClick={() => agregarEstudio(e)}
                            disabled={yaAgregado}
                          >
                            <FaPlus />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {estudiosFiltrados.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>No se encontraron estudios</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {estudiosSeleccionados.length > 0 && (
            <>
              <p style={styles.section}>Estudios seleccionados ({estudiosSeleccionados.length})</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Estudio</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Precio</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', width: 130 }}>Cobertura</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {estudiosSeleccionados.map((e, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 500 }}>{e.nombre}</td>
                      <td style={{ padding: '8px 12px', fontSize: 13, textAlign: 'right' }}>${(e.precio || 0).toFixed(2)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          style={{ ...styles.input, width: 100, textAlign: 'right' }}
                          value={e.cobertura}
                          onChange={ev => setCoberturaEstudio(i, ev.target.value)}
                        />
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <button style={styles.btnDanger} onClick={() => quitarEstudio(i)}><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ maxWidth: 320, marginLeft: 'auto' }}>
                <div style={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ ...styles.summaryRow, color: totalCobertura > 0 ? '#16a34a' : '#94a3b8' }}>
                  <span>Cobertura:</span>
                  <span>-${totalCobertura.toFixed(2)}</span>
                </div>
                <div style={styles.totalRow}>
                  <span>Total:</span>
                  <span>${totalFinal.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <button style={styles.btnSecondary} onClick={() => setPaso(1)}>← Paciente</button>
            <button
              style={styles.btnPrimary}
              onClick={() => setPaso(3)}
              disabled={estudiosSeleccionados.length === 0}
            >
              Continuar a Pago →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Pago */}
      {paso === 3 && (
        <div style={styles.card}>
          <p style={styles.section}>Resumen del paciente</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16, fontSize: 14 }}>
            <div><strong>Paciente:</strong> {paciente.nombre} {paciente.apellido}</div>
            <div><strong>Cédula:</strong> {paciente.cedula || 'N/A'}</div>
            <div><strong>Teléfono:</strong> {paciente.telefono}</div>
            <div><strong>Seguro:</strong> {paciente.seguro.nombre}</div>
            {paciente.seguro.numeroAfiliado && (
              <div><strong>No. Afiliado:</strong> {paciente.seguro.numeroAfiliado}</div>
            )}
          </div>

          <p style={styles.section}>Estudios ({estudiosSeleccionados.length})</p>
          <div style={{ marginBottom: 16 }}>
            {estudiosSeleccionados.map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                <span>{e.nombre}</span>
                <span style={{ fontWeight: 600 }}>${(e.precio || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <p style={styles.section}>Método de Pago</p>
          <div style={styles.row}>
            <div>
              <label style={styles.label}>Forma de pago</label>
              <select style={styles.select} value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
                {METODOS_PAGO.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Autorización (seguro)</label>
              <input style={styles.input} value={autorizacion} onChange={e => setAutorizacion(e.target.value)} placeholder="Número de autorización" />
            </div>
          </div>

          <div style={styles.row}>
            <div>
              <label style={styles.label}>Descuento adicional ($)</label>
              <input type="number" min="0" step="0.01" style={styles.input} value={descuentoAdicional} onChange={e => setDescuentoAdicional(e.target.value)} />
            </div>
            <div>
              <label style={styles.label}>Monto pagado ($)</label>
              <input type="number" min="0" step="0.01" style={styles.input} value={montoPagado} onChange={e => setMontoPagado(parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          <div style={{ maxWidth: 360, marginLeft: 'auto', marginTop: 12 }}>
            <div style={styles.summaryRow}>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ ...styles.summaryRow, color: totalCobertura > 0 ? '#16a34a' : '#94a3b8' }}>
              <span>Cobertura seguro:</span>
              <span>-${totalCobertura.toFixed(2)}</span>
            </div>
            {parseFloat(descuentoAdicional) > 0 && (
              <div style={{ ...styles.summaryRow, color: '#f59e0b' }}>
                <span>Descuento adicional:</span>
                <span>-${parseFloat(descuentoAdicional).toFixed(2)}</span>
              </div>
            )}
            <div style={styles.totalRow}>
              <span>TOTAL A PAGAR:</span>
              <span>${totalFinal.toFixed(2)}</span>
            </div>
            <div style={{ ...styles.summaryRow, marginTop: 6 }}>
              <span>Monto pagado:</span>
              <span style={{ fontWeight: 600 }}>${(montoPagado || 0).toFixed(2)}</span>
            </div>
            {cambio > 0 && (
              <div style={{ ...styles.summaryRow, color: '#16a34a', fontWeight: 600 }}>
                <span>Cambio:</span>
                <span>${cambio.toFixed(2)}</span>
              </div>
            )}
            {montoPagado < totalFinal && montoPagado > 0 && (
              <div style={{ ...styles.summaryRow, color: '#dc2626', fontWeight: 600 }}>
                <span>Pendiente:</span>
                <span>${(totalFinal - montoPagado).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button style={styles.btnSecondary} onClick={() => setPaso(2)}>← Estudios</button>
            <button style={styles.btnSuccess} onClick={finalizar} disabled={finalizando}>
              {finalizando ? <FaSpinner /> : <><FaPrint /> Finalizar y Facturar</>}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default RegistroInteligente;
