import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const FORMATOS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.QR_CODE,
];

/**
 * Modal con la cámara del celular/PC para leer códigos de barras.
 * Llama a onScan(codigo) una sola vez y se cierra.
 * Requiere HTTPS (o localhost) para que el navegador permita la cámara.
 */
export default function BarcodeScanner({ onScan, onClose }) {
  const regionId = "barcode-scanner-region";
  const scannerRef = useRef(null);
  const doneRef = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const scanner = new Html5Qrcode(regionId, { formatsToSupport: FORMATOS, verbose: false });
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 280, height: 140 } },
        (texto) => {
          if (doneRef.current) return;
          doneRef.current = true;
          scanner
            .stop()
            .catch(() => {})
            .finally(() => onScan(texto.trim()));
        },
        () => {} // errores de frame sin código: se ignoran
      )
      .catch((e) => {
        setError(
          String(e).includes("NotAllowed")
            ? "Permiso de cámara denegado. Habilítalo en el navegador."
            : "No se pudo abrir la cámara. Usa HTTPS o localhost y verifica que otra app no la esté usando."
        );
      });

    return () => {
      if (scanner.isScanning) scanner.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{ background: "var(--card-bg, #fff)", color: "inherit", borderRadius: "12px", padding: "16px", width: "100%", maxWidth: "420px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h4 style={{ marginTop: 0 }}>Escanear código de barras</h4>
        <div id={regionId} style={{ width: "100%", minHeight: "240px" }} />
        {error && <p style={{ color: "#ef4444", fontSize: "0.9rem" }}>{error}</p>}
        <button type="button" className="btn btn-secondary" style={{ width: "100%", marginTop: "12px" }} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
