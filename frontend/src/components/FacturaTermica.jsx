import React, { useState, useEffect, useRef } from 'react';
import { FaPrint, FaTimes, FaHospital } from 'react-icons/fa';

const s = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 2000, fontFamily: 'Inter, sans-serif'
  },
  outer: { background: '#fff', borderRadius: 16, padding: 20, maxWidth: 420, width: '100%', maxHeight: '95vh', overflow: 'auto' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 },
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600
  },
  receipt: {
    width: '100%', maxWidth: 380, margin: '0 auto', padding: '12px 8px',
    fontFamily: "'Courier New', Courier, monospace", fontSize: 12, lineHeight: 1.5
  },
  center: { textAlign: 'center' },
  divider: { borderTop: '1px dashed #333', margin: '8px 0' },
  row: { display: 'flex', justifyContent: 'space-between' },
  bold: { fontWeight: 700 },
  small: { fontSize: 10 },
  barcodeWrap: { textAlign: 'center', margin: '8px 0' },
  qrWrap: { textAlign: 'center', margin: '10px 0' },
  credBox: {
    border: '1px dashed #333', borderRadius: 4, padding: 6,
    margin: '8px 0', fontSize: 11, textAlign: 'center'
  }
};

export default function FacturaTermica({ factura, paciente, estudios, onClose }) {
  const [config, setConfig] = useState({});
  const printRef = useRef(null);

  useEffect(() => {
    fetch('/api/configuracion/', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
      }
    })
      .then(r => r.json())
      .then(data => {
        const cfg = data?.data || data?.configuracion || data || {};
        setConfig(cfg);
      })
      .catch(() => {});
  }, []);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank', 'width=400,height=700');
    win.document.write(`<html><head><title>Factura</title><style>body{margin:0;padding:8px;font-family:'Courier New',monospace;font-size:12px;line-height:1.5}@media print{@page{margin:0;size:80mm auto}}</style></head><body>`);
    win.document.write(content.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  if (!factura) return null;

  const empresaNombre = config.nombre_empresa || config.empresa || 'Centro Diagnóstico';
  const empresaRNC = config.rnc || '';
  const empresaTel = config.telefono || '';
  const empresaDir = config.direccion || '';

  const pacNombre = typeof paciente === 'object' ? (paciente?.nombre || paciente?.nombres || '-') : (factura.paciente_nombre || '-');
  const pacCedula = typeof paciente === 'object' ? (paciente?.cedula || '') : '';

  const items = estudios || factura.items || [];
  const total = factura.total || factura.monto_total || 0;
  const subtotal = factura.subtotal || total;
  const descuento = factura.descuento || factura.descuentoTotal || 0;
  const numero = factura.numero || factura.numero_factura || '';

  const portalUrl = window.location.origin + '/portal';

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.outer} onClick={e => e.stopPropagation()}>
        <div style={s.actions}>
          <button style={{ ...s.btn, background: '#3498db', color: '#fff' }} onClick={handlePrint}>
            <FaPrint /> Imprimir
          </button>
          <button style={{ ...s.btn, background: '#e0e0e0', color: '#333' }} onClick={onClose}>
            <FaTimes /> Cerrar
          </button>
        </div>

        <div ref={printRef} style={s.receipt}>
          <div style={s.center}>
            <strong style={{ fontSize: 14 }}>{empresaNombre}</strong><br />
            {empresaRNC && <span>RNC: {empresaRNC}<br /></span>}
            {empresaDir && <span>{empresaDir}<br /></span>}
            {empresaTel && <span>Tel: {empresaTel}<br /></span>}
          </div>

          <div style={s.divider} />

          <div style={s.center}>
            <strong>FACTURA #{numero}</strong><br />
            <span style={s.small}>Fecha: {new Date(factura.fecha || factura.createdAt || Date.now()).toLocaleString('es-DO')}</span>
          </div>

          <div style={s.divider} />

          <div style={s.barcodeWrap}>
            <svg id="factura-barcode" />
            <div style={{ fontSize: 10, letterSpacing: 2 }}>{numero}</div>
          </div>

          <div style={s.divider} />

          <div>
            <strong>Paciente:</strong> {pacNombre}<br />
            {pacCedula && <span><strong>Cédula:</strong> {pacCedula}<br /></span>}
          </div>

          <div style={s.divider} />

          <div style={s.bold}>DETALLE DE ESTUDIOS</div>
          {items.map((item, i) => {
            const nombre = item.nombre || item.descripcion || (typeof item.estudio === 'object' ? item.estudio.nombre : item.estudio) || '-';
            const precio = item.precio || item.monto || 0;
            return (
              <div key={i} style={s.row}>
                <span>{nombre}</span>
                <span>${Number(precio).toFixed(2)}</span>
              </div>
            );
          })}

          <div style={s.divider} />

          <div style={s.row}><span>Subtotal:</span><span>${Number(subtotal).toFixed(2)}</span></div>
          {descuento > 0 && <div style={s.row}><span>Descuento:</span><span>-${Number(descuento).toFixed(2)}</span></div>}
          <div style={{ ...s.row, ...s.bold, fontSize: 14 }}><span>TOTAL:</span><span>${Number(total).toFixed(2)}</span></div>

          {factura.metodo_pago && (
            <>
              <div style={s.divider} />
              <div style={s.row}><span>Forma de pago:</span><span>{factura.metodo_pago || factura.metodoPago || '-'}</span></div>
            </>
          )}

          <div style={s.divider} />

          <div style={s.qrWrap}>
            <div style={{ fontSize: 10, marginBottom: 4 }}>Consulte sus resultados en:</div>
            <div style={{ fontSize: 10, wordBreak: 'break-all' }}>{portalUrl}</div>
          </div>

          {(factura.pacienteUsername || factura.pacientePasswordPlano) && (
            <div style={s.credBox}>
              <strong>Credenciales del Portal</strong><br />
              {factura.pacienteUsername && <span>Usuario: {factura.pacienteUsername}<br /></span>}
              {factura.pacientePasswordPlano && <span>Clave: {factura.pacientePasswordPlano}</span>}
            </div>
          )}

          <div style={s.divider} />
          <div style={{ ...s.center, ...s.small }}>
            ¡Gracias por su preferencia!<br />
            {empresaNombre}
          </div>
        </div>
      </div>
    </div>
  );
}
