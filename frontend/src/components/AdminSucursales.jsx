import React from 'react';
import { FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';

const styles = {
  container: { padding: 32, maxWidth: 800, margin: '0 auto' },
  card: {
    background: '#fff', borderRadius: 16, padding: 40,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center'
  },
  iconWrap: {
    width: 80, height: 80, borderRadius: '50%', background: '#eaf4fe',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 24px'
  },
  title: { fontSize: 24, fontWeight: 700, color: '#0f4c75', margin: '0 0 12px', fontFamily: 'Inter, sans-serif' },
  msg: { fontSize: 15, color: '#666', lineHeight: 1.6, margin: 0 }
};

export default function AdminSucursales() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <FaBuilding size={36} color="#3498db" />
        </div>
        <h2 style={styles.title}>Gestión de Sucursales</h2>
        <p style={styles.msg}>
          <FaMapMarkerAlt style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Configure las sucursales del centro diagnóstico desde aquí.
        </p>
      </div>
    </div>
  );
}
