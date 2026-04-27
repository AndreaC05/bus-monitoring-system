import { useState, useMemo } from "react";
import "../style/Reportes/Reportes.css";
import Sidebar from "../components/Sidebar";

const BUSES_DISPONIBLES = [
  { id: 1, codigo: "MET-001", capacidad: 160 },
  { id: 2, codigo: "MET-002", capacidad: 160 },
  { id: 3, codigo: "MET-003", capacidad: 120 },
  { id: 4, codigo: "MET-004", capacidad: 120 },
  { id: 5, codigo: "MET-005", capacidad: 80 },
  { id: 6, codigo: "MET-006", capacidad: 80 },
  { id: 7, codigo: "MET-007", capacidad: 160 },
  { id: 8, codigo: "MET-008", capacidad: 120 },
  { id: 9, codigo: "MET-009", capacidad: 80 },
];

const REPORTES_MOCK = [
  {
    id_reporte: 1,
    id_bus: 1,
    codigo_bus: "MET-001",
    capacidad: 160,
    cantidad_pasajeros: 68,
    latitud: -12.04318,
    longitud: -77.02824,
    timestamp: "2025-04-26T14:32:00",
  },
  {
    id_reporte: 2,
    id_bus: 2,
    codigo_bus: "MET-002",
    capacidad: 160,
    cantidad_pasajeros: 140,
    latitud: -12.11045,
    longitud: -77.0113,
    timestamp: "2025-04-26T14:31:00",
  },
  {
    id_reporte: 3,
    id_bus: 3,
    codigo_bus: "MET-003",
    capacidad: 120,
    cantidad_pasajeros: 120,
    latitud: -11.9718,
    longitud: -77.0532,
    timestamp: "2025-04-26T14:30:00",
  },
  {
    id_reporte: 4,
    id_bus: 4,
    codigo_bus: "MET-004",
    capacidad: 120,
    cantidad_pasajeros: 45,
    latitud: -12.0884,
    longitud: -77.0204,
    timestamp: "2025-04-26T14:29:00",
  },
  {
    id_reporte: 5,
    id_bus: 5,
    codigo_bus: "MET-005",
    capacidad: 80,
    cantidad_pasajeros: 72,
    latitud: -11.9402,
    longitud: -77.0605,
    timestamp: "2025-04-26T14:28:00",
  },
  {
    id_reporte: 6,
    id_bus: 6,
    codigo_bus: "MET-006",
    capacidad: 80,
    cantidad_pasajeros: 30,
    latitud: -12.1822,
    longitud: -77.0042,
    timestamp: "2025-04-26T14:27:00",
  },
  {
    id_reporte: 7,
    id_bus: 7,
    codigo_bus: "MET-007",
    capacidad: 160,
    cantidad_pasajeros: 160,
    latitud: -12.0564,
    longitud: -77.0855,
    timestamp: "2025-04-26T14:26:00",
  },
  {
    id_reporte: 8,
    id_bus: 8,
    codigo_bus: "MET-008",
    capacidad: 120,
    cantidad_pasajeros: 55,
    latitud: -12.1256,
    longitud: -77.0075,
    timestamp: "2025-04-26T14:25:00",
  },
  {
    id_reporte: 9,
    id_bus: 1,
    codigo_bus: "MET-001",
    capacidad: 160,
    cantidad_pasajeros: 90,
    latitud: -12.0884,
    longitud: -77.0204,
    timestamp: "2025-04-26T14:10:00",
  },
  {
    id_reporte: 10,
    id_bus: 2,
    codigo_bus: "MET-002",
    capacidad: 160,
    cantidad_pasajeros: 110,
    latitud: -12.0564,
    longitud: -77.0855,
    timestamp: "2025-04-26T14:05:00",
  },
  {
    id_reporte: 11,
    id_bus: 3,
    codigo_bus: "MET-003",
    capacidad: 120,
    cantidad_pasajeros: 98,
    latitud: -11.9851,
    longitud: -77.0401,
    timestamp: "2025-04-26T13:55:00",
  },
  {
    id_reporte: 12,
    id_bus: 5,
    codigo_bus: "MET-005",
    capacidad: 80,
    cantidad_pasajeros: 80,
    latitud: -11.9512,
    longitud: -77.0577,
    timestamp: "2025-04-26T13:40:00",
  },
];

const FORM_INIT = {
  id_bus: "",
  latitud: "",
  longitud: "",
  cantidad_pasajeros: "",
};

const getNivel = (pct) => {
  if (pct >= 100) return "lleno";
  if (pct >= 80) return "casi-lleno";
  return "disponible";
};

const getLabelNivel = (nivel) => {
  if (nivel === "lleno") return "Lleno";
  if (nivel === "casi-lleno") return "Casi lleno";
  return "Disponible";
};

const fmtHora = (ts) =>
  new Date(ts).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
const fmtFecha = (ts) =>
  new Date(ts).toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
const fmtCoord = (v) => parseFloat(v).toFixed(5);

export default function Reportes() {
  const [reportes, setReportes] = useState(REPORTES_MOCK);
  const [busqueda, setBusqueda] = useState("");
  const [filtroBus, setFiltroBus] = useState("todos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_INIT);
  const [formError, setFormError] = useState("");

  /* Stats derivadas */
  const totalReportes = reportes.length;
  const busesUnicos = [...new Set(reportes.map((r) => r.id_bus))].length;
  const promedioOcu = Math.round(
    reportes.reduce(
      (acc, r) => acc + Math.round((r.cantidad_pasajeros / r.capacidad) * 100),
      0,
    ) / reportes.length,
  );
  const llenosCount = reportes.filter(
    (r) => Math.round((r.cantidad_pasajeros / r.capacidad) * 100) >= 100,
  ).length;

  /* Filtros */
  const reportesFiltrados = useMemo(() => {
    return reportes
      .filter((r) => {
        const q = busqueda.toLowerCase();
        const matchQ = !q || r.codigo_bus.toLowerCase().includes(q);
        const matchB =
          filtroBus === "todos" || r.id_bus === parseInt(filtroBus);
        return matchQ && matchB;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [reportes, busqueda, filtroBus]);

  /* Form handlers */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleSubmit = () => {
    const { id_bus, latitud, longitud, cantidad_pasajeros } = form;
    if (!id_bus || !latitud || !longitud || !cantidad_pasajeros) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }
    const bus = BUSES_DISPONIBLES.find((b) => b.id === parseInt(id_bus));
    const pax = parseInt(cantidad_pasajeros);
    if (pax > bus.capacidad) {
      setFormError(
        `La cantidad excede la capacidad del bus (${bus.capacidad} pax).`,
      );
      return;
    }
    if (pax < 0) {
      setFormError("La cantidad de pasajeros no puede ser negativa.");
      return;
    }
    const nuevo = {
      id_reporte: reportes.length + 1,
      id_bus: bus.id,
      codigo_bus: bus.codigo,
      capacidad: bus.capacidad,
      cantidad_pasajeros: pax,
      latitud: parseFloat(latitud),
      longitud: parseFloat(longitud),
      timestamp: new Date().toISOString(),
    };
    setReportes((prev) => [nuevo, ...prev]);
    setForm(FORM_INIT);
    setFormError("");
    setModalAbierto(false);
  };

  return (
    <div className="layout-shell">
      <Sidebar />

      <div className="main-area">
        <header className="topbar">
          <span className="topbar-title">Reportes</span>
          <div className="topbar-right">
            <span className="live-dot" />
            <span className="live-label">Vista previa con datos de prueba</span>
          </div>
        </header>

        <main className="main-content">
          <div className="reportes-page">
            {/* Header */}
            <div className="reportes-header">
              <div className="reportes-header__titles">
                <h2>Historial de reportes</h2>
                <p>Registro de ubicación y ocupación por bus</p>
              </div>
              <button
                className="btn-primary"
                onClick={() => setModalAbierto(true)}
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
                Nuevo reporte
              </button>
            </div>

            {/* Stats */}
            <div className="reportes-stats">
              <div className="rep-stat">
                <div className="rep-stat__label">Total reportes</div>
                <div className="rep-stat__val azul">{totalReportes}</div>
                <div className="rep-stat__bar azul" />
              </div>
              <div className="rep-stat">
                <div className="rep-stat__label">Buses reportados</div>
                <div className="rep-stat__val verde">{busesUnicos}</div>
                <div className="rep-stat__bar verde" />
              </div>
              <div className="rep-stat">
                <div className="rep-stat__label">Ocupación promedio</div>
                <div className="rep-stat__val amarillo">{promedioOcu}%</div>
                <div className="rep-stat__bar amarillo" />
              </div>
              <div className="rep-stat">
                <div className="rep-stat__label">Reportes llenos</div>
                <div className="rep-stat__val rojo">{llenosCount}</div>
                <div className="rep-stat__bar rojo" />
              </div>
            </div>

            {/* Toolbar */}
            <div className="reportes-toolbar">
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
                  placeholder="Buscar por código..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <select
                className="select-filtro"
                value={filtroBus}
                onChange={(e) => setFiltroBus(e.target.value)}
              >
                <option value="todos">Todos los buses</option>
                {BUSES_DISPONIBLES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.codigo}
                  </option>
                ))}
              </select>
            </div>

            <div className="reportes-count">
              Mostrando <span>{reportesFiltrados.length}</span> de{" "}
              {reportes.length} reportes
            </div>

            {/* Tabla */}
            <div className="reportes-table-wrap">
              <table className="reportes-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Bus</th>
                    <th>Pasajeros</th>
                    <th>Ocupación</th>
                    <th>Estado</th>
                    <th>Latitud</th>
                    <th>Longitud</th>
                    <th>Fecha / Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {reportesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="reportes-empty">
                          <svg
                            width="38"
                            height="38"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="#B0B7C3"
                            strokeWidth="1.2"
                          >
                            <path
                              d="M2 13l4-4 3 3 5-6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p>No hay reportes que coincidan</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reportesFiltrados.map((r) => {
                      const pct = Math.round(
                        (r.cantidad_pasajeros / r.capacidad) * 100,
                      );
                      const nivel = getNivel(pct);
                      return (
                        <tr key={r.id_reporte}>
                          <td className="td-id">#{r.id_reporte}</td>
                          <td>
                            <div className="td-bus">
                              <span className="bus-chip">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                >
                                  <rect
                                    x="1"
                                    y="4"
                                    width="14"
                                    height="8"
                                    rx="2"
                                  />
                                  <path d="M4 4V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" />
                                </svg>
                                {r.codigo_bus}
                              </span>
                            </div>
                          </td>
                          <td>
                            {r.cantidad_pasajeros} / {r.capacidad}
                          </td>
                          <td>
                            <div className="td-ocu-wrap">
                              <div className="td-ocu-top">
                                <span className="td-ocu-pct">{pct}%</span>
                              </div>
                              <div className="ocu-bar-bg">
                                <div
                                  className={`ocu-bar-fill ocu-bar-fill--${nivel}`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge--${nivel}`}>
                              <span className="badge__dot" />
                              {getLabelNivel(nivel)}
                            </span>
                          </td>
                          <td className="td-coord">{fmtCoord(r.latitud)}</td>
                          <td className="td-coord">{fmtCoord(r.longitud)}</td>
                          <td className="td-time">
                            {fmtHora(r.timestamp)}
                            <span className="td-time-date">
                              {fmtFecha(r.timestamp)}
                            </span>
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

      {/* Modal nuevo reporte */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Registrar reporte manual</h3>
              <button
                className="modal__close"
                onClick={() => setModalAbierto(false)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="1" y1="1" x2="13" y2="13" />
                  <line x1="13" y1="1" x2="1" y2="13" />
                </svg>
              </button>
            </div>

            <div className="modal__body">
              <div className="form-group">
                <label>Bus</label>
                <select
                  name="id_bus"
                  value={form.id_bus}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar bus...</option>
                  {BUSES_DISPONIBLES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.codigo} — Cap. {b.capacidad}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitud</label>
                  <input
                    name="latitud"
                    type="number"
                    step="0.00001"
                    placeholder="-12.04318"
                    value={form.latitud}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Longitud</label>
                  <input
                    name="longitud"
                    type="number"
                    step="0.00001"
                    placeholder="-77.02824"
                    value={form.longitud}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Cantidad de pasajeros</label>
                <input
                  name="cantidad_pasajeros"
                  type="number"
                  min="0"
                  placeholder="Ej: 85"
                  value={form.cantidad_pasajeros}
                  onChange={handleChange}
                />
                {form.id_bus && (
                  <span className="form-hint">
                    Capacidad máxima:{" "}
                    {
                      BUSES_DISPONIBLES.find(
                        (b) => b.id === parseInt(form.id_bus),
                      )?.capacidad
                    }{" "}
                    pax
                  </span>
                )}
                {formError && <span className="form-error">{formError}</span>}
              </div>
            </div>

            <div className="modal__footer">
              <button
                className="btn-secondary"
                onClick={() => setModalAbierto(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                Guardar reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
