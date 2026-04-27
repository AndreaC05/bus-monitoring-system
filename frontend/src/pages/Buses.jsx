import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import "../style/Buses/Buses.css";
import Sidebar from "../components/Sidebar";
import FormularioBuses from "../components/Buses/FormularioBuses";
import FormularioEditarBuses from "../components/Buses/FormularioEditarBuses";
import FormularioDeleteBuses from "../components/Buses/FormularioDeleteBuses";
import { getBuses } from "../api/buses";

const getNivel = (pct) => {
  if (pct === null || pct === undefined) return "sin-datos";
  if (pct >= 100) return "lleno";
  if (pct >= 80) return "casi-lleno";
  return "disponible";
};

const getLabelNivel = (nivel) => {
  if (nivel === "lleno") return "Lleno";
  if (nivel === "casi-lleno") return "Casi lleno";
  if (nivel === "disponible") return "Disponible";
  return "Sin datos";
};

const fmtHora = (ts) => {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const FILTROS = [
  { key: "todos", label: "Todos" },
  { key: "Disponible", label: "Disponibles", cls: "chip--disponible" },
  { key: "Casi Lleno", label: "Casi llenos", cls: "chip--casi" },
  { key: "Lleno", label: "Llenos", cls: "chip--lleno" },
];

export default function Buses() {
  const [buses, setBuses] = useState([]);
  const [loadingTabla, setLoadingTabla] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [busSeleccionado, setBusSeleccionado] = useState(null);
  const toast = useRef(null);

  /* ── Cargar tabla ── */
  const cargarBuses = useCallback(async () => {
    setLoadingTabla(true);
    try {
      const data = await getBuses();

      const mapped = (data ?? []).map((bus) => {
        const ultimoReporte =
          bus.reportes?.length > 0
            ? bus.reportes.reduce((a, b) =>
                new Date(a.timestamp) > new Date(b.timestamp) ? a : b,
              )
            : null;

        return {
          ...bus,
          tipoServicio: bus.tiposervicios, // "Expreso 1"
          estado: bus.estados?.estado, // "Disponible"
          ultimoReporte, // null si no hay reportes
        };
      });

      setBuses(mapped);
    } catch (err) {
      console.error("Error al cargar buses:", err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar la lista de buses.",
        life: 4000,
      });
    } finally {
      setLoadingTabla(false);
    }
  }, []);

  useEffect(() => {
    cargarBuses();
  }, [cargarBuses]);

  /* ── Callback cuando el formulario guarda con éxito ── */
  const handleGuardar = (busCreado) => {
    toast.current?.show({
      severity: "success",
      summary: "Bus registrado",
      detail: `${busCreado?.codigo_bus ?? "Nuevo bus"} agregado a la flota.`,
      life: 3500,
    });
    cargarBuses(); /* recarga la tabla */
  };

  const handleEditar = (busActualizado) => {
    toast.current?.show({
      severity: "success",
      summary: "Bus actualizado",
      detail: `${busActualizado?.codigo_bus ?? "Bus"} modificado correctamente.`,
      life: 3500,
    });
    cargarBuses();
  };

  const handleEliminar = (busEliminado) => {
    toast.current?.show({
      severity: "warn",
      summary: "Bus eliminado",
      detail: `${busEliminado?.codigo_bus ?? "Bus"} eliminado de la flota.`,
      life: 3500,
    });
    cargarBuses();
  };

  /* ── Filtrado local ── */
  const busesFiltrados = useMemo(() => {
    return buses.filter((bus) => {
      const q = busqueda.toLowerCase();

      const matchQ =
        !q ||
        bus.codigo_bus.toLowerCase().includes(q) ||
        bus.tipoServicio?.tiposervicio.toLowerCase().includes(q);

      const matchF =
        filtro === "todos" ||
        bus.estado?.toLowerCase() === filtro.toLowerCase();

      return matchQ && matchF;
    });
  }, [buses, busqueda, filtro]);

  return (
    <div className="layout-shell">
      <Sidebar />

      <Toast ref={toast} position="top-right" />

      <div className="main-area">
        <header className="topbar">
          <span className="topbar-title">Buses</span>
          <div className="topbar-right">
            <span className="live-dot" />
            <span className="live-label">
              {loadingTabla ? "Actualizando..." : "En vivo"}
            </span>
          </div>
        </header>

        <main className="main-content">
          <div className="buses-page">
            {/* Header */}
            <div className="buses-header">
              <div className="buses-header__titles">
                <h2>Gestión de flota</h2>
                <p>{buses.length} buses registrados en el sistema</p>
              </div>
              <button
                className="btn-primary"
                onClick={() => setModalVisible(true)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="7" y1="1" x2="7" y2="13" />
                  <line x1="1" y1="7" x2="13" y2="7" />
                </svg>
                Nuevo bus
              </button>
            </div>

            {/* Filtros */}
            <div className="buses-filters">
              <div className="search-wrap">
                <span className="search-wrap__icon">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <circle cx="6.5" cy="6.5" r="5" />
                    <line
                      x1="10.5"
                      y1="10.5"
                      x2="14"
                      y2="14"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Buscar por código o servicio..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="filter-chips">
                {FILTROS.map((f) => (
                  <Button
                    key={f.key}
                    className={`chip ${f.cls ?? ""} ${filtro === f.key ? "chip--active" : ""}`}
                    onClick={() => setFiltro(f.key)}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Contador */}
            <div className="buses-count">
              Mostrando <span>{busesFiltrados.length}</span> de {buses.length}{" "}
              buses
            </div>

            {/* Tabla */}
            <div className="buses-table-wrap">
              <table className="buses-table">
                <thead>
                  <tr>
                    <th>Bus</th>
                    <th>Servicio</th>
                    <th>Capacidad</th>
                    <th>Ocupación</th>
                    <th>Estado</th>
                    <th>Último reporte</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingTabla ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="buses-empty">
                          <i
                            className="pi pi-spin pi-spinner"
                            style={{ fontSize: 24, color: "var(--color-blue)" }}
                          />
                          <p style={{ marginTop: 10 }}>Cargando flota...</p>
                        </div>
                      </td>
                    </tr>
                  ) : busesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="buses-empty">
                          <div className="buses-empty__icon">
                            <svg
                              width="40"
                              height="40"
                              viewBox="0 0 40 40"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <rect
                                x="3"
                                y="10"
                                width="34"
                                height="22"
                                rx="5"
                              />
                              <path d="M10 10V8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v2" />
                              <circle cx="11" cy="32" r="3" />
                              <circle cx="29" cy="32" r="3" />
                            </svg>
                          </div>
                          <p>No hay buses que coincidan con los filtros</p>
                        </div>
                      </td>
                      <td>
                        <div className="td-actions">
                          <button
                            className="td-action-btn td-action-btn--edit"
                            title="Editar bus"
                            onClick={() => {
                              setBusSeleccionado(bus);
                              setEditModalVisible(true);
                            }}
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 16 16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            >
                              <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" />
                              <path d="M9.5 3.5l3 3" />
                            </svg>
                          </button>
                          <button
                            className="td-action-btn td-action-btn--delete"
                            title="Eliminar bus"
                            onClick={() => {
                              setBusSeleccionado(bus);
                              setDeleteModalVisible(true);
                            }}
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 16 16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            >
                              <polyline
                                points="2 4 14 4"
                                strokeLinecap="round"
                              />
                              <path d="M5 4V2h6v2" />
                              <path d="M3 4l1 10h8l1-10" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    busesFiltrados.map((bus) => {
                      const r = bus.ultimoReporte;
                      const pct = r?.porcentaje_ocupacion ?? null;
                      const nivel = getNivel(pct);

                      return (
                        <tr key={bus.id_bus}>
                          <td>
                            <div className="td-codigo">
                              <div className="bus-avatar">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                >
                                  <rect
                                    x="1"
                                    y="4"
                                    width="14"
                                    height="8"
                                    rx="2"
                                  />
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
                              <div className="td-codigo-text">
                                <strong>{bus.codigo_bus}</strong>
                                <span>ID #{bus.id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="td-servicio">
                            {bus.tipoServicio?.tiposervicio ?? "—"}
                          </td>

                          <td className="td-capacidad">{bus.capacidad} pax</td>

                          <td className="td-ocu">
                            {r ? (
                              <>
                                <div className="td-ocu-row">
                                  <span className="td-ocu-pct">{pct}%</span>
                                  <span className="td-ocu-num">
                                    {r.cantidad_pasajeros}/{bus.capacidad}
                                  </span>
                                </div>
                                <div className="ocu-bar-bg">
                                  <div
                                    className={`ocu-bar-fill ocu-bar-fill--${nivel}`}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
                                </div>
                              </>
                            ) : (
                              <span
                                style={{
                                  color: "var(--color-text-gray)",
                                  fontSize: 12,
                                }}
                              >
                                Sin datos
                              </span>
                            )}
                          </td>

                          <td>
                            <span
                              className={`badge badge--${
                                bus.estado?.toLowerCase() === "disponible"
                                  ? "disponible"
                                  : bus.estado?.toLowerCase() === "casi lleno"
                                    ? "casi-lleno"
                                    : bus.estado?.toLowerCase() === "lleno"
                                      ? "lleno"
                                      : "sin-datos"
                              }`}
                            >
                              <span className="badge__dot" />
                              {bus.estado ?? "—"}
                            </span>
                          </td>

                          <td className="td-time">{fmtHora(r?.timestamp)}</td>
                          <td>
                            <div className="td-actions">
                              <button
                                className="td-action-btn td-action-btn--edit"
                                title="Editar bus"
                                onClick={() => {
                                  setBusSeleccionado(bus);
                                  setEditModalVisible(true);
                                }}
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                >
                                  <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" />
                                  <path d="M9.5 3.5l3 3" />
                                </svg>
                              </button>
                              <button
                                className="td-action-btn td-action-btn--delete"
                                title="Eliminar bus"
                                onClick={() => {
                                  setBusSeleccionado(bus);
                                  setDeleteModalVisible(true);
                                }}
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                >
                                  <polyline
                                    points="2 4 14 4"
                                    strokeLinecap="round"
                                  />
                                  <path d="M5 4V2h6v2" />
                                  <path d="M3 4l1 10h8l1-10" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal formulario */}
      <FormularioBuses
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        onGuardar={handleGuardar}
      />

      <FormularioEditarBuses
        visible={editModalVisible}
        onHide={() => {
          setEditModalVisible(false);
          setBusSeleccionado(null);
        }}
        onGuardar={handleEditar}
        bus={busSeleccionado}
      />

      <FormularioDeleteBuses
        visible={deleteModalVisible}
        onHide={() => {
          setDeleteModalVisible(false);
          setBusSeleccionado(null);
        }}
        onEliminar={handleEliminar}
        bus={busSeleccionado}
      />
    </div>
  );
}
