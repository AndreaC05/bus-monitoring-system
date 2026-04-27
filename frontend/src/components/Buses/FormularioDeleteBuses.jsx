import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { deleteBuses } from "../../api/buses";
import "../../style/Buses/FormularioDeleteBuses.css";

export default function FormularioDeleteBuses({
  visible,
  onHide,
  onEliminar,
  bus,
}) {
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState(null);

  const handleEliminar = async () => {
    setEliminando(true);
    setError(null);
    try {
      await deleteBuses(bus.id);
      onEliminar?.(bus);
      onHide();
    } catch (err) {
      console.error("Error al eliminar bus:", err);
      setError("No se pudo eliminar el bus. Intenta nuevamente.");
    } finally {
      setEliminando(false);
    }
  };

  const Header = () => (
    <div className="fb-header">
      <div className="fb-header__left">
        <div className="fdb-header__icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="#EB5757"
            strokeWidth="1.5"
          >
            <polyline points="2 4 14 4" strokeLinecap="round" />
            <path d="M5 4V2h6v2" />
            <path d="M3 4l1 10h8l1-10" />
            <line x1="6.5" y1="7" x2="6.5" y2="11" strokeLinecap="round" />
            <line x1="9.5" y1="7" x2="9.5" y2="11" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h3 className="fb-header__title fdb-title">Eliminar bus</h3>
          <p className="fb-header__sub">Esta acción no se puede deshacer</p>
        </div>
      </div>
    </div>
  );

  const Footer = () => (
    <div className="fb-footer">
      <span className="fb-footer__note">
        <i
          className="pi pi-exclamation-triangle"
          style={{ fontSize: 11, color: "var(--color-lleno)" }}
        />
        Se eliminará permanentemente de la flota
      </span>
      <div className="fb-footer__actions">
        <Button
          label="Cancelar"
          className="fb-btn-cancel"
          onClick={onHide}
          disabled={eliminando}
        />
        <Button
          label={eliminando ? "Eliminando..." : "Sí, eliminar"}
          icon={eliminando ? "pi pi-spin pi-spinner" : "pi pi-trash"}
          className="fdb-btn-delete"
          onClick={handleEliminar}
          disabled={eliminando}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={<Header />}
      footer={<Footer />}
      className="fb-dialog fdb-dialog"
      draggable={false}
      resizable={false}
      closable={!eliminando}
      maskClassName="fb-mask"
    >
      <div className="fb-body fdb-body">
        {error && (
          <div className="fb-alert-error">
            <i className="pi pi-exclamation-triangle" />
            {error}
          </div>
        )}

        {/* Tarjeta resumen del bus a eliminar */}
        <div className="fdb-bus-card">
          <div className="fdb-bus-card__icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="1" y="4" width="14" height="8" rx="2" />
              <path d="M4 4V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" />
              <circle
                cx="4.5"
                cy="12"
                r="1"
                fill="currentColor"
                stroke="none"
              />
              <circle
                cx="11.5"
                cy="12"
                r="1"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </div>
          <div className="fdb-bus-card__info">
            <strong>{bus?.codigo_bus ?? "—"}</strong>
            <span>
              {bus?.tipoServicio?.tiposervicio ?? "—"} · {bus?.capacidad ?? "—"}{" "}
              pax
            </span>
          </div>
          <span
            className={`badge badge--${
              bus?.estado?.toLowerCase() === "disponible"
                ? "disponible"
                : bus?.estado?.toLowerCase() === "casi lleno"
                  ? "casi-lleno"
                  : bus?.estado?.toLowerCase() === "lleno"
                    ? "lleno"
                    : "sin-datos"
            }`}
          >
            <span className="badge__dot" />
            {bus?.estado ?? "—"}
          </span>
        </div>

        {/* Advertencia */}
        <div className="fdb-warning">
          <i className="pi pi-info-circle" />
          <p>
            Al eliminar <strong>{bus?.codigo_bus}</strong> se perderán todos sus
            reportes y datos históricos asociados.
          </p>
        </div>
      </div>
    </Dialog>
  );
}
