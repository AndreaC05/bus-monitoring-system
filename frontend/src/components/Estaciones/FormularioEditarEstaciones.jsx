import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { updateEstaciones } from "../../api/estaciones";
import "../../style/Estaciones/FormularioEditarEstaciones.css";

export default function FormularioEditarEstaciones({
  visible,
  onHide,
  onGuardar,
  estacion,
}) {
  const [nombre, setNombre] = useState("");
  const [latitud, setLatitud] = useState(null);
  const [longitud, setLongitud] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useRef(null);

  useEffect(() => {
    if (estacion) {
      setNombre(estacion.estaciones ?? "");
      setLatitud(parseFloat(estacion.latitud_estacion) ?? null);
      setLongitud(parseFloat(estacion.longitud_estacion) ?? null);
      setErrors({});
    }
  }, [estacion, visible]);

  const validar = () => {
    const e = {};
    if (!nombre.trim()) e.nombre = "El nombre es requerido.";
    if (latitud === null || latitud === undefined)
      e.latitud = "La latitud es requerida.";
    if (longitud === null || longitud === undefined)
      e.longitud = "La longitud es requerida.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      const payload = {
        estaciones: nombre.trim(),
        latitud_estacion: latitud,
        longitud_estacion: longitud,
      };
      await updateEstaciones(estacion.id, payload);
      onGuardar?.({ ...estacion, ...payload });
      onHide();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar la estación.",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const header = (
    <div className="fb-header">
      <div className="fb-header__left">
        <div className="fb-header__icon fb-header__icon--amber">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
          </svg>
        </div>
        <div>
          <p className="fb-header__title">Editar estación</p>
          <p className="fb-header__sub">
            Modifica los datos de la estación seleccionada
          </p>
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
        Los cambios se guardan inmediatamente
      </div>
      <div className="fb-footer__actions">
        <Button
          label="Cancelar"
          className="fb-btn-cancel"
          onClick={onHide}
          disabled={loading}
        />
        <Button
          className="fb-btn-submit fb-btn-submit--amber"
          onClick={handleGuardar}
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
            <path d="M2 8l4 4 8-8" />
          </svg>
          Guardar cambios
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
        <div className="fb-body">
          <span className="fb-section-label">
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M8 1C5.8 1 4 2.8 4 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" />
              <circle cx="8" cy="5" r="1.5" />
            </svg>
            Información general
          </span>

          <div className="fb-field">
            <label className="fb-label">
              Nombre de la estación <span className="fb-required">*</span>
            </label>
            <input
              className={`fb-input ${errors.nombre ? "p-invalid" : ""}`}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Estación Central"
            />
            {errors.nombre && <span className="fb-error">{errors.nombre}</span>}
          </div>

          <span className="fb-section-label" style={{ marginTop: 4 }}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <circle cx="8" cy="8" r="6" />
              <line x1="8" y1="4" x2="8" y2="8" />
              <line x1="8" y1="8" x2="11" y2="10" />
            </svg>
            Coordenadas
          </span>

          <div className="fb-grid">
            <div className="fb-field">
              <label className="fb-label">
                Latitud <span className="fb-required">*</span>
              </label>
              <InputNumber
                className={`fb-inputnumber ${errors.latitud ? "p-invalid" : ""}`}
                value={latitud}
                onValueChange={(e) => setLatitud(e.value)}
                mode="decimal"
                minFractionDigits={5}
                maxFractionDigits={8}
                placeholder="-12.04318"
              />
              {errors.latitud && (
                <span className="fb-error">{errors.latitud}</span>
              )}
            </div>
            <div className="fb-field">
              <label className="fb-label">
                Longitud <span className="fb-required">*</span>
              </label>
              <InputNumber
                className={`fb-inputnumber ${errors.longitud ? "p-invalid" : ""}`}
                value={longitud}
                onValueChange={(e) => setLongitud(e.value)}
                mode="decimal"
                minFractionDigits={5}
                maxFractionDigits={8}
                placeholder="-77.02824"
              />
              {errors.longitud && (
                <span className="fb-error">{errors.longitud}</span>
              )}
            </div>
          </div>

          {latitud !== null && longitud !== null && (
            <div className="fe-coords-preview">
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M8 1C5.8 1 4 2.8 4 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" />
                <circle cx="8" cy="5" r="1.5" />
              </svg>
              {latitud?.toFixed(5)}, {longitud?.toFixed(5)}
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
