import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { storeEstaciones } from "../../api/estaciones";
import { storeTipoServicioEstaciones } from "../../api/tiposervicioestaciones";
import { getTipServicios } from "../../api/tiposervicio";
import "../../style/Estaciones/FormularioEstaciones.css";

const FORM_INICIAL = {
  estaciones: "",
  latitud_estacion: null,
  longitud_estacion: null,
};

const COORDS_REFERENCIA = [
  { label: "Norte", lat: -11.9289, lng: -77.0634 },
  { label: "Centro", lat: -12.0564, lng: -77.0855 },
  { label: "Sur", lat: -12.1822, lng: -77.0042 },
];

export default function FormularioEstaciones({ visible, onHide, onGuardar }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [tiposServicio, setTiposServicio] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [asignaciones, setAsignaciones] = useState([]);
  const [asigForm, setAsigForm] = useState({
    id_tipo_servicio: null,
    orden: null,
  });
  const [asigError, setAsigError] = useState("");

  useEffect(() => {
    if (!visible) return;
    setForm(FORM_INICIAL);
    setErrors({});
    setAsignaciones([]);
    setAsigForm({ id_tipo_servicio: null, orden: null });
    setAsigError("");

    const cargar = async () => {
      setLoadingTipos(true);
      try {
        const data = await getTipServicios();
        setTiposServicio(data ?? []);
      } catch (err) {
        console.error("Error al cargar tipos de servicio:", err);
      } finally {
        setLoadingTipos(false);
      }
    };
    cargar();
  }, [visible]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, _global: undefined }));
  };

  const agregarAsignacion = () => {
    if (!asigForm.id_tipo_servicio) {
      setAsigError("Selecciona un tipo de servicio");
      return;
    }
    if (!asigForm.orden || asigForm.orden < 1) {
      setAsigError("Ingresa un orden válido");
      return;
    }
    const yaExiste = asignaciones.some(
      (a) =>
        a.id_tipo_servicio === asigForm.id_tipo_servicio &&
        a.orden === asigForm.orden,
    );
    if (yaExiste) {
      setAsigError("Ya agregaste esa combinación");
      return;
    }
    const tipoLabel =
      tiposServicio.find((t) => t.id === asigForm.id_tipo_servicio)
        ?.tiposervicio ?? "—";
    setAsignaciones((prev) => [...prev, { ...asigForm, tipoLabel }]);
    setAsigForm({ id_tipo_servicio: null, orden: null });
    setAsigError("");
  };

  const quitarAsignacion = (i) =>
    setAsignaciones((prev) => prev.filter((_, idx) => idx !== i));

  const validar = () => {
    const e = {};
    if (!form.estaciones.trim()) e.estaciones = "El nombre es obligatorio";
    if (form.latitud_estacion === null)
      e.latitud_estacion = "Ingresa la latitud";
    if (form.longitud_estacion === null)
      e.longitud_estacion = "Ingresa la longitud";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      /* 1. Crear estación */
      const res = await storeEstaciones({ ...form });
      const idEstacion = res?.data?.id ?? res?.id;

      /* 2. Crear asignaciones tipo-servicio */
      if (idEstacion && asignaciones.length > 0) {
        await Promise.all(
          asignaciones.map((a) =>
            storeTipoServicioEstaciones({
              id_estacion: idEstacion,
              id_tipo_servicio: a.id_tipo_servicio,
              orden: a.orden,
            }),
          ),
        );
      }

      onGuardar?.(res?.data ?? res);
      onHide();
    } catch (err) {
      console.error("Error al guardar estación:", err);
      setErrors((prev) => ({
        ...prev,
        _global:
          "Ocurrió un error al registrar la estación. Intenta nuevamente.",
      }));
    } finally {
      setGuardando(false);
    }
  };

  const Header = () => (
    <div className="fb-header">
      <div className="fb-header__left">
        <div className="fb-header__icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="#328CC1"
            strokeWidth="1.5"
          >
            <path d="M8 1C5.8 1 4 2.8 4 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" />
            <circle cx="8" cy="5" r="1.5" />
          </svg>
        </div>
        <div>
          <h3 className="fb-header__title">Registrar nueva estación</h3>
          <p className="fb-header__sub">
            Complete los campos para agregar a la ruta
          </p>
        </div>
      </div>
    </div>
  );

  const Footer = () => (
    <div className="fb-footer">
      <span className="fb-footer__note">
        <i className="pi pi-info-circle" style={{ fontSize: 11 }} />
        Los campos <strong>*</strong> son obligatorios
      </span>
      <div className="fb-footer__actions">
        <Button
          label="Cancelar"
          className="fb-btn-cancel"
          onClick={onHide}
          disabled={guardando}
        />
        <Button
          label={guardando ? "Guardando..." : "Registrar estación"}
          icon={guardando ? "pi pi-spin pi-spinner" : "pi pi-plus"}
          className="fb-btn-submit"
          onClick={handleGuardar}
          disabled={guardando}
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
      className="fb-dialog"
      draggable={false}
      resizable={false}
      closable={!guardando}
      maskClassName="fb-mask"
    >
      <div className="fb-body">
        {errors._global && (
          <div className="fb-alert-error">
            <i className="pi pi-exclamation-triangle" /> {errors._global}
          </div>
        )}

        {/* ── Identificación ── */}
        <p className="fb-section-label">Identificación</p>
        <div className="fb-field" style={{ marginBottom: 14 }}>
          <label className="fb-label">
            Nombre de estación <span className="fb-required">*</span>
          </label>
          <InputText
            value={form.estaciones}
            onChange={(e) => set("estaciones", e.target.value)}
            placeholder="Ej. Terminal Naranjal"
            className={`fb-input ${errors.estaciones ? "p-invalid" : ""}`}
            maxLength={60}
          />
          {errors.estaciones && (
            <small className="fb-error">
              <i className="pi pi-exclamation-circle" /> {errors.estaciones}
            </small>
          )}
        </div>

        {/* ── Coordenadas ── */}
        <p className="fb-section-label">Coordenadas</p>
        <div className="fe-coords-ref">
          <span className="fe-coords-ref__label">Referencia rápida:</span>
          {COORDS_REFERENCIA.map((c) => (
            <button
              key={c.label}
              type="button"
              className="fe-coord-chip"
              onClick={() => {
                set("latitud_estacion", c.lat);
                set("longitud_estacion", c.lng);
              }}
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 1C5.8 1 4 2.8 4 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" />
              </svg>
              {c.label}
            </button>
          ))}
        </div>

        <div className="fb-grid" style={{ marginBottom: 4 }}>
          <div className="fb-field">
            <label className="fb-label">
              Latitud <span className="fb-required">*</span>
            </label>
            <InputNumber
              value={form.latitud_estacion}
              onValueChange={(e) => set("latitud_estacion", e.value)}
              placeholder="-12.0000"
              minFractionDigits={4}
              maxFractionDigits={6}
              min={-90}
              max={90}
              className={`fb-inputnumber ${errors.latitud_estacion ? "p-invalid" : ""}`}
              inputClassName="fb-input"
            />
            {errors.latitud_estacion && (
              <small className="fb-error">
                <i className="pi pi-exclamation-circle" />{" "}
                {errors.latitud_estacion}
              </small>
            )}
          </div>
          <div className="fb-field">
            <label className="fb-label">
              Longitud <span className="fb-required">*</span>
            </label>
            <InputNumber
              value={form.longitud_estacion}
              onValueChange={(e) => set("longitud_estacion", e.value)}
              placeholder="-77.0000"
              minFractionDigits={4}
              maxFractionDigits={6}
              min={-180}
              max={180}
              className={`fb-inputnumber ${errors.longitud_estacion ? "p-invalid" : ""}`}
              inputClassName="fb-input"
            />
            {errors.longitud_estacion && (
              <small className="fb-error">
                <i className="pi pi-exclamation-circle" />{" "}
                {errors.longitud_estacion}
              </small>
            )}
          </div>
        </div>

        {(form.latitud_estacion !== null ||
          form.longitud_estacion !== null) && (
          <div className="fe-coords-preview">
            <i
              className="pi pi-map-marker"
              style={{ fontSize: 12, color: "var(--color-blue)" }}
            />
            <span>
              {form.latitud_estacion?.toFixed(5) ?? "—"},{" "}
              {form.longitud_estacion?.toFixed(5) ?? "—"}
            </span>
          </div>
        )}

        {/* ── Tipos de servicio ── */}
        <p className="fb-section-label" style={{ marginTop: 18 }}>
          Tipos de servicio
          <span className="fe-optional-badge">Opcional</span>
        </p>
        <p className="fe-section-hint">
          Define qué servicios paran en esta estación y en qué orden de parada.
        </p>

        {/* Fila para agregar */}
        <div className="fe-asig-row">
          <Dropdown
            value={asigForm.id_tipo_servicio}
            options={tiposServicio}
            optionLabel="tiposervicio"
            optionValue="id"
            onChange={(e) => {
              setAsigForm((p) => ({ ...p, id_tipo_servicio: e.value }));
              setAsigError("");
            }}
            placeholder={loadingTipos ? "Cargando..." : "Tipo de servicio..."}
            disabled={loadingTipos}
            appendTo="self"
            className="fe-asig-dropdown"
          />
          <div className="fb-input-suffix-wrap fe-asig-orden-wrap">
            <InputNumber
              value={asigForm.orden}
              onValueChange={(e) => {
                setAsigForm((p) => ({ ...p, orden: e.value }));
                setAsigError("");
              }}
              placeholder="Orden"
              min={1}
              max={999}
              className="fb-inputnumber"
              inputClassName="fb-input"
            />
            <span className="fb-suffix">parada</span>
          </div>
          <button
            type="button"
            className="fe-asig-add-btn"
            onClick={agregarAsignacion}
            title="Agregar"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="7" y1="1" x2="7" y2="13" />
              <line x1="1" y1="7" x2="13" y2="7" />
            </svg>
          </button>
        </div>

        {asigError && (
          <small
            className="fb-error"
            style={{ marginBottom: 8, display: "block" }}
          >
            <i className="pi pi-exclamation-circle" /> {asigError}
          </small>
        )}

        {/* Lista de asignaciones */}
        {asignaciones.length > 0 && (
          <div className="fe-asig-list">
            {asignaciones
              .slice()
              .sort((a, b) => a.orden - b.orden)
              .map((a, i) => (
                <div className="fe-asig-item" key={i}>
                  <span className="fe-asig-item__orden">Parada {a.orden}</span>
                  <span className="fe-asig-item__tipo">{a.tipoLabel}</span>
                  <button
                    type="button"
                    className="fe-asig-item__remove"
                    onClick={() => quitarAsignacion(asignaciones.indexOf(a))}
                    title="Quitar"
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line
                        x1="2"
                        y1="2"
                        x2="12"
                        y2="12"
                        strokeLinecap="round"
                      />
                      <line
                        x1="12"
                        y1="2"
                        x2="2"
                        y2="12"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
