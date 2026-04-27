import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { deleteTipoServicioEstaciones } from "../../api/tiposervicioestaciones";

export default function FormularioDeleteTipoServicioEstacion({
  visible,
  onHide,
  onEliminado,
  tipoServicioEstacion,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nombre = tipoServicioEstacion?.tiposervicios?.tiposervicio ?? "este servicio";

  const handleEliminar = async () => {
    setLoading(true);
    setError("");
    try {
      await deleteTipoServicioEstaciones(tipoServicioEstacion.id);
      onEliminado(tipoServicioEstacion);
    } catch {
      setError("No se pudo eliminar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <button className="btn-modal-cancel" onClick={onHide} disabled={loading}>
        Cancelar
      </button>
      <button className="btn-modal-danger" onClick={handleEliminar} disabled={loading}>
        {loading ? "Eliminando..." : "Sí, eliminar"}
      </button>
    </div>
  );

  return (
    <Dialog
      header="Eliminar tipo de servicio"
      visible={visible}
      onHide={onHide}
      footer={footer}
      style={{ width: 400 }}
      modal
      draggable={false}
    >
      <div className="modal-confirm">
        <div className="modal-confirm__icon modal-confirm__icon--danger">
          <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <polyline points="2,4 14,4" />
            <path d="M6 4V2h4v2" />
            <path d="M5 4l1 9h4l1-9" />
          </svg>
        </div>

        <div>
          <p className="modal-confirm__title">
            ¿Eliminar <strong>{nombre}</strong> de esta estación?
          </p>
          <p className="modal-confirm__subtitle">
            Se eliminará el tipo de servicio con orden{" "}
            <strong>#{tipoServicioEstacion?.orden}</strong>. Esta acción no se puede deshacer.
          </p>
        </div>

        {error && <span className="form-error">{error}</span>}
      </div>
    </Dialog>
  );
}