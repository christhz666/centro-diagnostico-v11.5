import React from 'react';
import {
  FaDownload, FaDesktop, FaWindows, FaApple, FaLinux, FaInfoCircle
} from 'react-icons/fa';

const s = {
  container: { padding: 32, maxWidth: 700, margin: '0 auto', fontFamily: 'Inter, sans-serif' },
  card: {
    background: '#fff', borderRadius: 16, padding: 36,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center'
  },
  iconWrap: {
    width: 90, height: 90, borderRadius: '50%', background: '#eaf4fe',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 24px'
  },
  title: { fontSize: 24, fontWeight: 700, color: '#0f4c75', margin: '0 0 8px' },
  subtitle: { fontSize: 15, color: '#666', margin: '0 0 28px', lineHeight: 1.6 },
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px',
    background: '#3498db', color: '#fff', border: 'none', borderRadius: 12,
    cursor: 'pointer', fontWeight: 700, fontSize: 16, textDecoration: 'none',
    margin: '0 auto 24px', transition: 'background 0.2s'
  },
  reqs: {
    background: '#f8f9fa', borderRadius: 12, padding: 20,
    textAlign: 'left', marginTop: 24
  },
  reqTitle: { fontSize: 14, fontWeight: 700, color: '#0f4c75', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 },
  reqList: { listStyle: 'none', padding: 0, margin: 0 },
  reqItem: { padding: '6px 0', fontSize: 13, color: '#555', display: 'flex', alignItems: 'center', gap: 8 },
  platforms: { display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20 },
  platform: { textAlign: 'center', color: '#888', fontSize: 12 }
};

export default function DescargarApp() {
  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.iconWrap}>
          <FaDesktop size={42} color="#3498db" />
        </div>
        <h2 style={s.title}>Aplicación de Escritorio</h2>
        <p style={s.subtitle}>
          Descargue la aplicación de escritorio del Centro Diagnóstico para acceder a todas las funcionalidades desde su computadora.
        </p>

        <a href="/api/downloads/app" style={s.btn} download>
          <FaDownload size={18} /> Descargar Aplicación
        </a>

        <div style={s.platforms}>
          <div style={s.platform}><FaWindows size={28} color="#0078D4" /><div>Windows</div></div>
          <div style={s.platform}><FaApple size={28} color="#333" /><div>macOS</div></div>
          <div style={s.platform}><FaLinux size={28} color="#FCC624" /><div>Linux</div></div>
        </div>

        <div style={s.reqs}>
          <h4 style={s.reqTitle}><FaInfoCircle color="#3498db" /> Requisitos del Sistema</h4>
          <ul style={s.reqList}>
            <li style={s.reqItem}><span style={{ color: '#3498db' }}>•</span> Windows 10/11, macOS 10.15+, o Ubuntu 20.04+</li>
            <li style={s.reqItem}><span style={{ color: '#3498db' }}>•</span> 4 GB de RAM mínimo</li>
            <li style={s.reqItem}><span style={{ color: '#3498db' }}>•</span> 200 MB de espacio en disco</li>
            <li style={s.reqItem}><span style={{ color: '#3498db' }}>•</span> Conexión a internet para sincronización</li>
            <li style={s.reqItem}><span style={{ color: '#3498db' }}>•</span> Resolución mínima de 1280x720</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
