import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { updateTipoServicioEstaciones } from "../../api/tiposervicioestaciones";
import { getTipServicios } from "../../api/tiposervicio";

export default function FormularioEditarTipoServicioEstacion({
  visible,
  onHide,
  onGuardar,
  tipoServicioEstacion,
}) {
  const [orden, setOrden] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tipoServicioEstacion) {
      setOrden(tipoServicioEstacion.orden ?? "");
      setError("");
    }
  }, [tipoServicioEstacion]);

  const handleGuardar = async () => {
    if (!orden || isNaN(orden) || Number(orden) < 1) {
      setError("El orden debe ser un número mayor a 0.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await updateTipoServicioEstaciones(tipoServicioEstacion.id, {
        orden: Number(orden),
        id_tipo_servicio: tipoServicioEstacion.id_tipo_servicio,
        id_estacion: tipoServicioEstacion.id_estacion,
      });
      onGuardar({ ...tipoServicioEstacion, orden: Number(orden) });
    } catch {
      setError("No se pudo actualizar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <button className="btn-modal-cancel" onClick={onHide} disabled={loading}>
        Cancelar
      </button>
      <button className="btn-modal-confirm" onClick={handleGuardar} disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );

  return (
    <Dialog
      header="Editar tipo de servicio"
      visible={visible}
      onHide={onHide}
      footer={footer}
      style={{ width: 420 }}
      modal
      draggable={false}
    >
      <div className="modal-form">
        <div className="form-group">
          <label className="form-label">Tipo de servicio</label>
          <input
            className="form-input form-input--readonly"
            type="text"
            value={tipoServicioEstacion?.tiposervicios?.tiposervicio ?? ""}
            readOnly
          />
          <span className="form-hint">El tipo de servicio no puede cambiarse aquí.</span>
        </div>

        <div className="form-group">
          <label className="form-label">Orden en la ruta</label>
          <input
            className="form-input"
            type="number"
            min={1}
            value={orden}
            onChange={(e) => {
              setOrden(e.target.value);
              setError("");
            }}
            placeholder="Ej: 1"
          />
          {error && <span className="form-error">{error}</span>}
        </div>
      </div>
    </Dialog>
  );
}