import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import "../style/Reportes/Reportes.css";
import Sidebar from "../components/Sidebar";
import { getReportes, storeReportes } from "../api/reportes";
import { getBuses } from "../api/buses";

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
  const [reportes, setReportes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroBus, setFiltroBus] = useState("todos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_INIT);
  const [formError, setFormError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const intervalRef = useRef(null);

  /* ── Cargar reportes ── */
  const cargarReportes = useCallback(async () => {
    try {
      const data = await getReportes();
      setReportes(data ?? []);
    } catch (err) {
      console.error("Error al cargar reportes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Cargar buses para el select ── */
  const cargarBuses = useCallback(async () => {
    try {
      const data = await getBuses();
      setBuses(data ?? []);
    } catch (err) {
      console.error("Error al cargar buses:", err);
    }
  }, []);

  /* ── Polling cada 5 segundos ── */
  useEffect(() => {
    cargarReportes();
    cargarBuses();

    intervalRef.current = setInterval(() => {
      cargarReportes();
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [cargarReportes, cargarBuses]);

  /* ── Stats derivadas ── */
  const totalReportes = reportes.length;
  const busesUnicos = [...new Set(reportes.map((r) => r.id))].length;
  const promedioOcu = reportes.length
    ? Math.round(
        reportes.reduce(
          (acc, r) =>
            acc +
            Math.round(
              (r.cantidad_pasajeros / (r.bus?.capacidad ?? r.capacidad ?? 1)) *
                100,
            ),
          0,
        ) / reportes.length,
      )
    : 0;
  const llenosCount = reportes.filter((r) => {
    const cap = r.buses?.capacidad ?? 1;
    return Math.round((r.cantidad_pasajeros / cap) * 100) >= 100;
  }).length;

  /* ── Filtros ── */
  const reportesFiltrados = useMemo(() => {
    return reportes
      .filter((r) => {
        const codigo = r.buses?.codigo_bus ?? `Bus #${r.id_bus}`;
        const q = busqueda.toLowerCase();
        const matchQ = !q || codigo.toLowerCase().includes(q);
        const matchB =
          filtroBus === "todos" || r.id_bus === parseInt(filtroBus);
        return matchQ && matchB;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [reportes, busqueda, filtroBus]);

  /* ── Form handlers ── */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleSubmit = async () => {
    const { id_bus, latitud, longitud, cantidad_pasajeros } = form;
    if (!id_bus || !latitud || !longitud || !cantidad_pasajeros) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }
    const bus = buses.find((b) => b.id === parseInt(id_bus));
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
    setGuardando(true);
    try {
      await storeReportes({
        id_bus: parseInt(id_bus),
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
        cantidad_pasajeros: pax,
        timestamp: new Date().toISOString(),
      });
      await cargarReportes();
      setForm(FORM_INIT);
      setFormError("");
      setModalAbierto(false);
    } catch {
      setFormError("Error al guardar el reporte. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="layout-shell">
      <Sidebar />

      <div className="main-area">
        <header className="topbar">
          <span className="topbar-title">Reportes</span>
          <div className="topbar-right">
            <span className="live-dot" />
            <span className="live-label">Actualizando cada 5s</span>
          </div>
        </header>

        <main className="main-content">
          <div className="reportes-page">
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
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.codigo_bus}
                  </option>
                ))}
              </select>
            </div>

            <div className="reportes-count">
              Mostrando <span>{reportesFiltrados.length}</span> de{" "}
              {reportes.length} reportes
            </div>

            <div className="reportes-table-wrap">
              {loading ? (
                <div className="reportes-empty">
                  <i
                    className="pi pi-spin pi-spinner"
                    style={{ fontSize: 24, color: "var(--color-blue)" }}
                  />
                  <p style={{ marginTop: 10 }}>Cargando reportes...</p>
                </div>
              ) : (
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
                        const cap = r.buses?.capacidad ?? r.capacidad ?? 1;
                        const codigo = r.buses?.codigo_bus ?? `Bus #${r.id_bus}`;
                        const pct = Math.round(
                          (r.cantidad_pasajeros / cap) * 100,
                        );
                        const nivel = getNivel(pct);
                        return (
                          <tr key={r.id}>
                            <td className="td-id">#{r.id}</td>
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
                                  {codigo}
                                </span>
                              </div>
                            </td>
                            <td>
                              {r.cantidad_pasajeros} / {cap}
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
              )}
            </div>
          </div>
        </main>
      </div>

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
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.codigo_bus} — Cap. {b.capacidad}
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
                      buses.find((b) => b.id === parseInt(form.id_bus))
                        ?.capacidad
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
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar reporte"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
