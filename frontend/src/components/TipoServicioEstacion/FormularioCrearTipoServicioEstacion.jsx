import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { storeTipoServicioEstaciones } from "../../api/tiposervicioestaciones"; 
import { getTipServicios } from "../../api/tiposervicio";

export default function FormularioCrearTipoServicioEstacion({
  visible,
  onHide,
  onGuardar,
  estacion,
}) {
  const [tipoServicios, setTipoServicios] = useState([]);
  const [idTipoServicio, setIdTipoServicio] = useState("");
  const [orden, setOrden] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTs, setLoadingTs] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) return;
    setIdTipoServicio("");
    setOrden("");
    setError("");

    setLoadingTs(true);
    getTipServicios()
      .then((data) => setTipoServicios(data ?? []))
      .catch(() => setError("No se pudo cargar la lista de tipos de servicio."))
      .finally(() => setLoadingTs(false));
  }, [visible]);

 const handleGuardar = async () => {
  // ...validaciones...
  setLoading(true);
  setError("");
  try {
    const body = {
      id_estacion: estacion.id,
      id_tipo_servicio: Number(idTipoServicio),
      orden: Number(orden),
    };
    console.log("Body enviado:", body); // 👈 agrega esto temporalmente
    const creado = await storeTipoServicioEstaciones(body);
    onGuardar(creado);
  } catch {
    setError("No se pudo guardar. Intenta de nuevo.");
  } finally {
    setLoading(false);
  }
};

  const footer = (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <button className="btn-modal-cancel" onClick={onHide} disabled={loading}>
        Cancelar
      </button>
      <button
        className="btn-modal-confirm"
        onClick={handleGuardar}
        disabled={loading || loadingTs}
      >
        {loading ? "Guardando..." : "Agregar servicio"}
      </button>
    </div>
  );

  return (
    <Dialog
      header={`Agregar servicio — ${estacion?.estaciones ?? ""}`}
      visible={visible}
      onHide={onHide}
      footer={footer}
      style={{ width: 440 }}
      modal
      draggable={false}
    >
      <div className="modal-form">
        <div className="form-group">
          <label className="form-label">Tipo de servicio</label>
          {loadingTs ? (
            <div className="form-loading">
              <i className="pi pi-spin pi-spinner" style={{ fontSize: 14 }} />
              <span>Cargando...</span>
            </div>
          ) : (
            <select
              className="form-input form-select"
              value={idTipoServicio}
              onChange={(e) => {
                setIdTipoServicio(e.target.value);
                setError("");
              }}
            >
              <option value="">— Selecciona un tipo —</option>
              {tipoServicios.map((ts) => (
                <option key={ts.id} value={ts.id}>
                  {ts.tiposervicio}
                </option>
              ))}
            </select>
          )}
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
          <span className="form-hint">
            Posición de este servicio dentro de la estación.
          </span>
        </div>

        {error && <span className="form-error">{error}</span>}
      </div>
    </Dialog>
  );
}