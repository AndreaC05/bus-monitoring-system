import { useState, useEffect, useCallback } from "react";
import "../style/DashBoard/Dashboard.css";
import Sidebar from "../components/Sidebar";
import { getBuses } from "../api/buses";

// ── Helpers ──────────────────────────────────────────
const getUltimoReporte = (reportes) => {
  if (!reportes || reportes.length === 0) return null;
  return reportes.reduce((latest, r) =>
    new Date(r.timestamp) > new Date(latest.timestamp) ? r : latest,
  );
};

const calcPct = (pasajeros, capacidad) => {
  if (!capacidad || pasajeros == null) return null;
  return Math.round((pasajeros / capacidad) * 100);
};

const getNivel = (pct) => {
  if (pct === null || pct === undefined) return "sin-datos";
  if (pct >= 100) return "lleno";
  if (pct >= 80) return "casi-lleno";
  return "disponible";
};

const getLabelNivel = (nivel) => {
  const labels = {
    lleno: "Lleno",
    "casi-lleno": "Casi lleno",
    disponible: "Disponible",
    "sin-datos": "Sin datos",
  };
  return labels[nivel] ?? "Sin datos";
};

const fmtHora = (ts) => {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const fmtCoord = (v) => (v != null ? parseFloat(v).toFixed(5) : "—");

// ── Sub-components ────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      <div className="stat-card__bar" />
    </div>
  );
}

function BusCard({ bus }) {
  const ultimoReporte = getUltimoReporte(bus.reportes);
  const pct = ultimoReporte
    ? calcPct(ultimoReporte.cantidad_pasajeros, bus.capacidad)
    : null;
  const nivel = getNivel(pct);

  return (
    <div className={`bus-card bus-card--${nivel}`}>
      <div className="bus-card__top">
        <div>
          <div className="bus-card__code">{bus.codigo_bus}</div>
          <div className="bus-card__type">
            {bus.tiposervicios?.tiposervicio ?? "—"} · Cap. {bus.capacidad}
          </div>
        </div>
        <span className={`badge badge--${nivel}`}>{getLabelNivel(nivel)}</span>
      </div>

      <div className="ocu-bar-bg">
        <div
          className={`ocu-bar-fill ocu-bar-fill--${nivel}`}
          style={{ width: `${Math.min(pct ?? 0, 100)}%` }}
        />
      </div>

      <div className="bus-card__meta">
        <span>
          {ultimoReporte
            ? `${ultimoReporte.cantidad_pasajeros} / ${bus.capacidad} pasajeros`
            : "Sin reporte"}
        </span>
        <span className="bus-card__pct">{pct !== null ? `${pct}%` : "—"}</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────
const POLL_INTERVAL = 30_000; // 30 segundos

export default function DashBoard() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await getBuses();
      setBuses(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError("No se pudo conectar con el servidor. Reintentando...");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial + polling cada 30 segundos
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Stats derivados ──
  const total = buses.length;
  const dispCount = buses.filter((b) => {
    const r = getUltimoReporte(b.reportes);
    return (
      getNivel(calcPct(r?.cantidad_pasajeros, b.capacidad)) === "disponible"
    );
  }).length;
  const casiCount = buses.filter((b) => {
    const r = getUltimoReporte(b.reportes);
    return (
      getNivel(calcPct(r?.cantidad_pasajeros, b.capacidad)) === "casi-lleno"
    );
  }).length;
  const llenoCount = buses.filter((b) => {
    const r = getUltimoReporte(b.reportes);
    return getNivel(calcPct(r?.cantidad_pasajeros, b.capacidad)) === "lleno";
  }).length;

  // Últimos 8 reportes más recientes (uno por bus)
  const ultimosReportes = buses
    .map((bus) => {
      const r = getUltimoReporte(bus.reportes);
      return r ? { bus, reporte: r } : null;
    })
    .filter(Boolean)
    .sort(
      (a, b) => new Date(b.reporte.timestamp) - new Date(a.reporte.timestamp),
    )
    .slice(0, 8);

  return (
    <div className="layout-shell">
      <Sidebar />

      <div className="main-area">
        <header className="topbar">
          <span className="topbar-title">Dashboard</span>
          <div className="topbar-right">
            {loading && buses.length === 0 ? (
              <span className="live-label">Cargando...</span>
            ) : (
              <>
                <span className="live-dot" />
                <span className="live-label">
                  {lastUpdate
                    ? `Actualizado a las ${fmtHora(lastUpdate)}`
                    : "En vivo"}
                </span>
              </>
            )}
          </div>
        </header>

        <main className="main-content">
          <div className="dashboard">
            {/* Error banner */}
            {error && <div className="error-banner">{error}</div>}

            {/* Skeleton de carga inicial */}
            {loading && buses.length === 0 ? (
              <>
                <div className="stats-grid">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="stat-card">
                      <div
                        className="skeleton"
                        style={{ height: 14, width: "60%", marginBottom: 8 }}
                      />
                      <div
                        className="skeleton"
                        style={{ height: 30, width: "40%" }}
                      />
                    </div>
                  ))}
                </div>
                <div className="section-title">Estado de la flota</div>
                <div className="bus-cards-grid">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bus-card"
                      style={{ minHeight: 100 }}
                    >
                      <div
                        className="skeleton"
                        style={{ height: 14, width: "50%", marginBottom: 8 }}
                      />
                      <div
                        className="skeleton"
                        style={{ height: 5, marginBottom: 8 }}
                      />
                      <div
                        className="skeleton"
                        style={{ height: 12, width: "70%" }}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Stats */}
                <div className="stats-grid">
                  <StatCard label="Total buses" value={total} color="azul" />
                  <StatCard
                    label="Disponibles"
                    value={dispCount}
                    color="verde"
                  />
                  <StatCard
                    label="Casi llenos"
                    value={casiCount}
                    color="amarillo"
                  />
                  <StatCard label="Llenos" value={llenoCount} color="rojo" />
                </div>

                {/* Flota */}
                <div className="section-title">Estado de la flota</div>
                {buses.length === 0 ? (
                  <div className="estado-vacio">No hay buses registrados.</div>
                ) : (
                  <div className="bus-cards-grid">
                    {buses.map((bus) => (
                      <BusCard key={bus.id} bus={bus} />
                    ))}
                  </div>
                )}

                {/* Tabla */}
                <div className="section-title" style={{ marginTop: 28 }}>
                  Últimos reportes
                </div>
                {ultimosReportes.length === 0 ? (
                  <div className="estado-vacio">Sin reportes disponibles.</div>
                ) : (
                  <div className="reportes-table-wrap">
                    <table className="reportes-table">
                      <thead>
                        <tr>
                          <th>Bus</th>
                          <th>Pasajeros</th>
                          <th>Ocupación</th>
                          <th>Latitud</th>
                          <th>Longitud</th>
                          <th>Hora</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ultimosReportes.map(({ bus, reporte }) => {
                          const pct = calcPct(
                            reporte.cantidad_pasajeros,
                            bus.capacidad,
                          );
                          const nivel = getNivel(pct);
                          return (
                            <tr key={bus.id}>
                              <td className="td-bold">{bus.codigo_bus}</td>
                              <td>{reporte.cantidad_pasajeros}</td>
                              <td>
                                <span className={`badge badge--${nivel}`}>
                                  {pct !== null ? `${pct}%` : "—"}
                                </span>
                              </td>
                              <td className="muted">
                                {fmtCoord(reporte.latitud)}
                              </td>
                              <td className="muted">
                                {fmtCoord(reporte.longitud)}
                              </td>
                              <td className="muted">
                                {fmtHora(reporte.timestamp)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
