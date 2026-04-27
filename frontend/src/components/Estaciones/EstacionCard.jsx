import { useState } from "react";
import FormularioEditarTipoServicioEstacion from "../TipoServicioEstacion/FormularioEditarTipoServicioEstacion";
import FormularioDeleteTipoServicioEstacion from "../TipoServicioEstacion/FormularioDeleteTipoServicioEstacion";
import FormularioCrearTipoServicioEstacion from "../TipoServicioEstacion/FormularioCrearTipoServicioEstacion";

const fmtCoord = (v) => parseFloat(v).toFixed(5);

export default function EstacionCard({ est, index, onRefresh, toast }) {
  const [expanded, setExpanded] = useState(false);
  const [tsSeleccionado, setTsSeleccionado] = useState(null);
  const [modalEditarTs, setModalEditarTs] = useState(false);
  const [modalDeleteTs, setModalDeleteTs] = useState(false);
  const [modalCrearTs, setModalCrearTs] = useState(false);

  const tipoServicios = est.tiposerviciosestaciones ?? [];

  const handleEditarTs = (ts) => {
    setTsSeleccionado(ts);
    setModalEditarTs(true);
  };

  const handleEliminarTs = (ts) => {
    setTsSeleccionado(ts);
    setModalDeleteTs(true);
  };

  const handleGuardadoTs = (ts) => {
    toast?.current?.show({
      severity: "success",
      summary: "Servicio actualizado",
      detail: `${ts.tiposervicios?.tiposervicio ?? "Servicio"} fue modificado correctamente.`,
      life: 3500,
    });
    setModalEditarTs(false);
    onRefresh();
  };

  const handleEliminadoTs = (ts) => {
    toast?.current?.show({
      severity: "success",
      summary: "Servicio eliminado",
      detail: `${ts.tiposervicios?.tiposervicio ?? "Servicio"} fue eliminado de la estación.`,
      life: 3500,
    });
    setModalDeleteTs(false);
    onRefresh();
  };

  const handleCreadoTs = () => {
    toast?.current?.show({
      severity: "success",
      summary: "Servicio agregado",
      detail: `El servicio fue agregado a ${est.estaciones}.`,
      life: 3500,
    });
    setModalCrearTs(false);
    onRefresh();
  };

  return (
    <>
      <div className={`estacion-card ${expanded ? "estacion-card--expanded" : ""}`}>
        {/* Franja superior */}
        <div className="estacion-card__stripe">
          <div className="estacion-card__orden">
            <div className="orden-badge">{index + 1}</div>
            <span className="estacion-card__nombre">{est.estaciones}</span>
          </div>
          <span className="estacion-card__servicio">ID #{est.id}</span>
        </div>

        {/* Cuerpo */}
        <div className="estacion-card__body">
          <div className="estacion-card__coord-row">
            <div className="coord-item">
              <div className="coord-item__label">Latitud</div>
              <div className="coord-item__val">{fmtCoord(est.latitud_estacion)}</div>
            </div>
            <div className="coord-item">
              <div className="coord-item__label">Longitud</div>
              <div className="coord-item__val">{fmtCoord(est.longitud_estacion)}</div>
            </div>
          </div>

          {/* Botón expandir servicios */}
          <button
            className="btn-toggle-servicios"
            onClick={() => setExpanded((p) => !p)}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <polyline points="3,6 8,11 13,6" />
            </svg>
            {tipoServicios.length === 0
              ? "Sin servicios asignados"
              : `${tipoServicios.length} tipo${tipoServicios.length !== 1 ? "s" : ""} de servicio`}
          </button>

          {/* Panel expandido */}
          {expanded && (
            <div className="servicios-panel">
              {tipoServicios.length === 0 ? (
                /* Estado vacío con botón agregar */
                <div className="servicios-empty-full">
                  <div className="servicios-empty-full__icon">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    >
                      <rect x="2" y="6" width="12" height="8" rx="1" />
                      <path d="M5 6V4a3 3 0 0 1 6 0v2" />
                    </svg>
                  </div>
                  <p className="servicios-empty-full__text">
                    No hay tipos de servicio asignados a esta estación.
                  </p>
                  <button
                    className="btn-agregar-servicio"
                    onClick={() => setModalCrearTs(true)}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    >
                      <line x1="7" y1="1" x2="7" y2="13" />
                      <line x1="1" y1="7" x2="13" y2="7" />
                    </svg>
                    Agregar tipo de servicio
                  </button>
                </div>
              ) : (
                <>
                  <div className="servicios-list">
                    {tipoServicios.map((ts) => (
                      <div className="servicio-row" key={ts.id}>
                        <div className="servicio-row__info">
                          <div className="servicio-badge">
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 16 16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect x="2" y="6" width="12" height="8" rx="1" />
                              <path d="M5 6V4a3 3 0 0 1 6 0v2" />
                            </svg>
                            Orden {ts.orden}
                          </div>
                          <span className="servicio-nombre">
                            {ts.tiposervicios?.tiposervicio ?? "Sin nombre"}
                          </span>
                        </div>
                        <div className="servicio-row__actions">
                          <button
                            className="btn-ts btn-ts--edit"
                            onClick={() => handleEditarTs(ts)}
                            title="Editar servicio"
                          >
                            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
                            </svg>
                          </button>
                          <button
                            className="btn-ts btn-ts--delete"
                            onClick={() => handleEliminarTs(ts)}
                            title="Eliminar servicio"
                          >
                            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="2,4 14,4" />
                              <path d="M6 4V2h4v2" />
                              <path d="M5 4l1 9h4l1-9" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botón agregar cuando ya hay servicios */}
                  <button
                    className="btn-agregar-servicio btn-agregar-servicio--inline"
                    onClick={() => setModalCrearTs(true)}
                  >
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="7" y1="1" x2="7" y2="13" />
                      <line x1="1" y1="7" x2="13" y2="7" />
                    </svg>
                    Agregar otro servicio
                  </button>
                </>
              )}
            </div>
          )}

          {/* Acciones de la estación */}
          <div className="estacion-card__actions" style={{ marginTop: 10 }}>
            <button
              className="btn-estacion btn-estacion--edit"
              onClick={() => {
                const event = new CustomEvent("editar-estacion", { detail: est });
                window.dispatchEvent(event);
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
              </svg>
            </button>
            <button
              className="btn-estacion btn-estacion--delete"
              onClick={() => {
                const event = new CustomEvent("eliminar-estacion", { detail: est });
                window.dispatchEvent(event);
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <polyline points="2,4 14,4" />
                <path d="M6 4V2h4v2" />
                <path d="M5 4l1 9h4l1-9" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modales */}
      <FormularioCrearTipoServicioEstacion
        visible={modalCrearTs}
        onHide={() => setModalCrearTs(false)}
        onGuardar={handleCreadoTs}
        estacion={est}
      />

      <FormularioEditarTipoServicioEstacion
        visible={modalEditarTs}
        onHide={() => setModalEditarTs(false)}
        onGuardar={handleGuardadoTs}
        tipoServicioEstacion={tsSeleccionado}
      />

      <FormularioDeleteTipoServicioEstacion
        visible={modalDeleteTs}
        onHide={() => setModalDeleteTs(false)}
        onEliminado={handleEliminadoTs}
        tipoServicioEstacion={tsSeleccionado}
      />
    </>
  );
}