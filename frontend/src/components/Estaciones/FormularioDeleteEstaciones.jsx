import { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { deleteEstaciones } from "../../api/estaciones";
import "../../style/Estaciones/FormularioDeleteEstaciones.css";

export default function FormularioDeleteEstaciones({
  visible,
  onHide,
  onEliminado,
  estacion,
}) {
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const handleEliminar = async () => {
    setLoading(true);
    try {
      await deleteEstaciones(estacion.id);
      onEliminado?.(estacion);
      onHide();
    } catch (err) {
      console.log("Status:", err.response?.status);
      console.log("Detalle del error:", err.response?.data); // <- esto nos dice qué falló en el backend
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo eliminar la estación.",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const header = (
    <div className="fb-header">
      <div className="fb-header__left">
        <div className="fb-header__icon fb-header__icon--red">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <polyline points="2,4 14,4" />
            <path d="M6 4V2h4v2" />
            <path d="M5 4l1 9h4l1-9" />
          </svg>
        </div>
        <div>
          <p className="fb-header__title">Eliminar estación</p>
          <p className="fb-header__sub">Esta acción no se puede deshacer</p>
        </div>
      </div>
    </div>
  );

  const footer = (
    <div className="fb-footer">
      <div className="fb-footer__note">
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="8" cy="8" r="6" />
          <line x1="8" y1="7" x2="8" y2="11" />
          <circle cx="8" cy="5" r=".5" fill="currentColor" />
        </svg>
        Acción irreversible
      </div>
      <div className="fb-footer__actions">
        <Button
          label="Cancelar"
          className="fb-btn-cancel"
          onClick={onHide}
          disabled={loading}
        />
        <Button
          className="fb-btn-submit fb-btn-submit--red"
          onClick={handleEliminar}
          loading={loading}
          disabled={loading}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="2,4 14,4" />
            <path d="M6 4V2h4v2" />
            <path d="M5 4l1 9h4l1-9" />
          </svg>
          Sí, eliminar
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <Dialog
        visible={visible}
        onHide={onHide}
        header={header}
        footer={footer}
        className="fb-dialog"
        maskClassName="fb-mask"
        closable
        draggable={false}
        resizable={false}
      >
        <div className="fd-body">
          <div className="fd-preview">
            <div className="fd-preview__name">
              <div className="fd-preview__dot" />
              <span className="fd-preview__label">{estacion?.estaciones}</span>
              <span className="fd-preview__id">ID #{estacion?.id}</span>
            </div>
            <div className="fd-preview__coords">
              <div className="coord-item">
                <div className="coord-item__label">Latitud</div>
                <div className="coord-item__val">
                  {parseFloat(estacion?.latitud_estacion).toFixed(5)}
                </div>
              </div>
              <div className="coord-item">
                <div className="coord-item__label">Longitud</div>
                <div className="coord-item__val">
                  {parseFloat(estacion?.longitud_estacion).toFixed(5)}
                </div>
              </div>
            </div>
          </div>

          <div className="fd-warning">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              style={{ flexShrink: 0, marginTop: 1 }}
            >
              <path d="M8 2L14 13H2L8 2z" />
              <line x1="8" y1="7" x2="8" y2="10" />
              <circle cx="8" cy="12" r=".5" fill="currentColor" />
            </svg>
            <p className="fd-warning__text">
              ¿Estás seguro? Se eliminará permanentemente{" "}
              <strong>{estacion?.estaciones}</strong> y todos sus datos
              asociados.
            </p>
          </div>
        </div>
      </Dialog>
    </>
  );
}
