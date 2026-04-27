import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { getTipServicios } from "../../api/tiposervicio";
import { getEstados } from "../../api/estado";
import { updateBuses } from "../../api/buses";
import "../../style/Buses/FormularioEditarBuses.css";

const CAPACIDADES_RAPIDAS = [80, 120, 160];

const getEstadoMeta = (nombreEstado = "") => {
  const n = nombreEstado.toLowerCase();
  if (n.includes("disponible"))
    return {
      cls: "estado-ruta",
      dotCls: "dot-ruta",
      icon: "pi pi-check-circle",
    };
  if (n.includes("casi"))
    return {
      cls: "estado-mant",
      dotCls: "dot-mant",
      icon: "pi pi-exclamation-circle",
    };
  if (n.includes("lleno"))
    return {
      cls: "estado-term",
      dotCls: "dot-terminal",
      icon: "pi pi-times-circle",
    };
  return { cls: "estado-ruta", dotCls: "dot-ruta", icon: "pi pi-circle" };
};

export default function FormularioEditarBuses({
  visible,
  onHide,
  onGuardar,
  bus,
}) {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [tiposServicio, setTiposServicio] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [guardando, setGuardando] = useState(false);

  /* Rellenar el form con los datos del bus al abrir */
  useEffect(() => {
    if (!visible || !bus) return;
    setErrors({});
    setForm({
      codigo_bus: bus.codigo_bus ?? "",
      capacidad: bus.capacidad ?? null,
      id_tipo_servicio: bus.id_tipo_servicio ?? null,
      id_estado: bus.id_estado ?? null,
    });

    const cargarCatalogos = async () => {
      setLoadingCatalogos(true);
      try {
        const [resTipos, resEstados] = await Promise.all([
          getTipServicios(),
          getEstados(),
        ]);
        setTiposServicio(resTipos ?? []);
        setEstados(resEstados ?? []);
      } catch (err) {
        console.error("Error al cargar catálogos:", err);
      } finally {
        setLoadingCatalogos(false);
      }
    };
    cargarCatalogos();
  }, [visible, bus]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, _global: undefined }));
  };

  const validar = () => {
    const e = {};
    if (!form.codigo_bus?.trim()) e.codigo_bus = "El código es obligatorio";
    if (!form.id_tipo_servicio)
      e.id_tipo_servicio = "Selecciona un tipo de servicio";
    if (!form.capacidad || form.capacidad < 1)
      e.capacidad = "Ingresa una capacidad válida";
    if (!form.id_estado) e.id_estado = "Selecciona un estado";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      const busActualizado = await updateBuses(bus.id, { ...form });
      onGuardar?.(busActualizado);
      onHide();
    } catch (err) {
      console.error("Error al actualizar bus:", err);
      setErrors((prev) => ({
        ...prev,
        _global: "Ocurrió un error al actualizar el bus. Intenta nuevamente.",
      }));
    } finally {
      setGuardando(false);
    }
  };

  const Header = () => (
    <div className="fb-header">
      <div className="fb-header__left">
        <div className="fb-header__icon feb-header__icon--edit">
          <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="#328CC1"
            strokeWidth="1.5"
          >
            <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" />
            <path d="M9.5 3.5l3 3" />
          </svg>
        </div>
        <div>
          <h3 className="fb-header__title">Editar bus</h3>
          <p className="fb-header__sub">
            Modificando <strong>{bus?.codigo_bus}</strong> · ID #{bus?.id_bus}
          </p>
        </div>
      </div>
      {/* Chip indicador de edición */}
      <span className="feb-badge-edit">
        <i className="pi pi-pencil" style={{ fontSize: 10 }} /> Editando
      </span>
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
          label={guardando ? "Guardando..." : "Guardar cambios"}
          icon={guardando ? "pi pi-spin pi-spinner" : "pi pi-check"}
          className="fb-btn-submit feb-btn-edit"
          onClick={handleGuardar}
          disabled={guardando || loadingCatalogos}
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
            <i className="pi pi-exclamation-triangle" />
            {errors._global}
          </div>
        )}

        {/* Identificación */}
        <p className="fb-section-label">Identificación</p>
        <div className="fb-grid">
          <div className="fb-field">
            <label className="fb-label">
              Código de bus <span className="fb-required">*</span>
            </label>
            <InputText
              value={form.codigo_bus ?? ""}
              onChange={(e) => set("codigo_bus", e.target.value.toUpperCase())}
              placeholder="Ej. MET-010"
              className={`fb-input ${errors.codigo_bus ? "p-invalid" : ""}`}
              maxLength={10}
            />
            {errors.codigo_bus && (
              <small className="fb-error">
                <i className="pi pi-exclamation-circle" /> {errors.codigo_bus}
              </small>
            )}
          </div>

          <div className="fb-field">
            <label className="fb-label">
              Tipo de servicio <span className="fb-required">*</span>
            </label>
            <Dropdown
              value={form.id_tipo_servicio}
              options={tiposServicio}
              optionLabel="tiposervicio"
              optionValue="id"
              onChange={(e) => set("id_tipo_servicio", e.value)}
              placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar..."}
              disabled={loadingCatalogos}
              appendTo="self"
              className={`fb-dropdown ${errors.id_tipo_servicio ? "p-invalid" : ""}`}
            />
            {errors.id_tipo_servicio && (
              <small className="fb-error">
                <i className="pi pi-exclamation-circle" />{" "}
                {errors.id_tipo_servicio}
              </small>
            )}
          </div>
        </div>

        {/* Capacidad */}
        <p className="fb-section-label">Capacidad</p>
        <div className="fb-grid">
          <div className="fb-field">
            <label className="fb-label">
              Pasajeros máximos <span className="fb-required">*</span>
            </label>
            <div className="fb-input-suffix-wrap">
              <InputNumber
                value={form.capacidad}
                onValueChange={(e) => set("capacidad", e.value)}
                placeholder="0"
                min={1}
                max={300}
                className={`fb-inputnumber ${errors.capacidad ? "p-invalid" : ""}`}
                inputClassName="fb-input"
              />
              <span className="fb-suffix">pasajeros</span>
            </div>
            {errors.capacidad && (
              <small className="fb-error">
                <i className="pi pi-exclamation-circle" /> {errors.capacidad}
              </small>
            )}
          </div>

          <div className="fb-field">
            <label className="fb-label">Valores frecuentes</label>
            <div className="fb-cap-chips">
              {CAPACIDADES_RAPIDAS.map((cap) => (
                <button
                  key={cap}
                  type="button"
                  className={`fb-cap-chip ${form.capacidad === cap ? "fb-cap-chip--active" : ""}`}
                  onClick={() => set("capacidad", cap)}
                >
                  {cap}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Estado */}
        <p className="fb-section-label">Estado</p>
        {errors.id_estado && (
          <small
            className="fb-error"
            style={{ marginBottom: 6, display: "block" }}
          >
            <i className="pi pi-exclamation-circle" /> {errors.id_estado}
          </small>
        )}
        <div className="fb-estados">
          {loadingCatalogos ? (
            <span className="fb-loading-text">
              <i className="pi pi-spin pi-spinner" style={{ fontSize: 12 }} />
              Cargando estados...
            </span>
          ) : (
            estados.map(({ id, estado }) => {
              const meta = getEstadoMeta(estado);
              const activo = form.id_estado === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`fb-estado-card ${meta.cls} ${activo ? "fb-estado-card--active" : ""}`}
                  onClick={() => set("id_estado", id)}
                >
                  <span className={`fb-estado-dot ${meta.dotCls}`} />
                  <i className={meta.icon} style={{ fontSize: 12 }} />
                  <span>{estado}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Dialog>
  );
}
