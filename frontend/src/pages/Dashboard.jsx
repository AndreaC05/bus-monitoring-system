import "../style/DashBoard/Dashboard.css";
import Sidebar from "../components/Sidebar";

const BUSES_MOCK = [
  {
    id_bus: 1,
    codigo_bus: "MET-001",
    capacidad: 160,
    tipoServicio: { tiposervicio: "Expreso" },
    ultimoReporte: {
      cantidad_pasajeros: 68,
      porcentaje_ocupacion: 43,
      latitud: -12.04318,
      longitud: -77.02824,
      timestamp: "2025-04-26T14:32:00",
    },
  },
  {
    id_bus: 2,
    codigo_bus: "MET-002",
    capacidad: 160,
    tipoServicio: { tiposervicio: "Expreso" },
    ultimoReporte: {
      cantidad_pasajeros: 140,
      porcentaje_ocupacion: 88,
      latitud: -12.11045,
      longitud: -77.0113,
      timestamp: "2025-04-26T14:31:00",
    },
  },
  {
    id_bus: 3,
    codigo_bus: "MET-003",
    capacidad: 120,
    tipoServicio: { tiposervicio: "Regular" },
    ultimoReporte: {
      cantidad_pasajeros: 120,
      porcentaje_ocupacion: 100,
      latitud: -11.9718,
      longitud: -77.0532,
      timestamp: "2025-04-26T14:30:00",
    },
  },
  {
    id_bus: 4,
    codigo_bus: "MET-004",
    capacidad: 120,
    tipoServicio: { tiposervicio: "Regular" },
    ultimoReporte: {
      cantidad_pasajeros: 45,
      porcentaje_ocupacion: 38,
      latitud: -12.0884,
      longitud: -77.0204,
      timestamp: "2025-04-26T14:29:00",
    },
  },
  {
    id_bus: 5,
    codigo_bus: "MET-005",
    capacidad: 80,
    tipoServicio: { tiposervicio: "Alimentador Norte" },
    ultimoReporte: {
      cantidad_pasajeros: 72,
      porcentaje_ocupacion: 90,
      latitud: -11.9402,
      longitud: -77.0605,
      timestamp: "2025-04-26T14:28:00",
    },
  },
  {
    id_bus: 6,
    codigo_bus: "MET-006",
    capacidad: 80,
    tipoServicio: { tiposervicio: "Alimentador Sur" },
    ultimoReporte: {
      cantidad_pasajeros: 30,
      porcentaje_ocupacion: 38,
      latitud: -12.1822,
      longitud: -77.0042,
      timestamp: "2025-04-26T14:27:00",
    },
  },
  {
    id_bus: 7,
    codigo_bus: "MET-007",
    capacidad: 160,
    tipoServicio: { tiposervicio: "Expreso" },
    ultimoReporte: {
      cantidad_pasajeros: 160,
      porcentaje_ocupacion: 100,
      latitud: -12.0564,
      longitud: -77.0855,
      timestamp: "2025-04-26T14:26:00",
    },
  },
  {
    id_bus: 8,
    codigo_bus: "MET-008",
    capacidad: 120,
    tipoServicio: { tiposervicio: "Regular" },
    ultimoReporte: {
      cantidad_pasajeros: 55,
      porcentaje_ocupacion: 46,
      latitud: -12.1256,
      longitud: -77.0075,
      timestamp: "2025-04-26T14:25:00",
    },
  },
  {
    id_bus: 9,
    codigo_bus: "MET-009",
    capacidad: 80,
    tipoServicio: { tiposervicio: "Alimentador Norte" },
    ultimoReporte: null,
  },
];

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
    second: "2-digit",
  });
};

const fmtCoord = (v) => (v != null ? parseFloat(v).toFixed(5) : "—");

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
  const r = bus.ultimoReporte;
  const pct = r?.porcentaje_ocupacion ?? null;
  const nivel = getNivel(pct);

  return (
    <div className={`bus-card bus-card--${nivel}`}>
      <div className="bus-card__top">
        <div>
          <div className="bus-card__code">{bus.codigo_bus}</div>
          <div className="bus-card__type">
            {bus.tipoServicio?.tiposervicio ?? "—"} · Cap. {bus.capacidad}
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
          {r
            ? `${r.cantidad_pasajeros} / ${bus.capacidad} pasajeros`
            : "Sin reporte"}
        </span>
        <span className="bus-card__pct">{pct !== null ? `${pct}%` : "—"}</span>
      </div>
    </div>
  );
}

export default function DashBoard() {
  const buses = BUSES_MOCK;

  const total = buses.length;
  const dispCount = buses.filter(
    (b) => getNivel(b.ultimoReporte?.porcentaje_ocupacion) === "disponible",
  ).length;
  const casiCount = buses.filter(
    (b) => getNivel(b.ultimoReporte?.porcentaje_ocupacion) === "casi-lleno",
  ).length;
  const llenoCount = buses.filter(
    (b) => getNivel(b.ultimoReporte?.porcentaje_ocupacion) === "lleno",
  ).length;

  const ultimosReportes = buses
    .filter((b) => b.ultimoReporte)
    .sort(
      (a, b) =>
        new Date(b.ultimoReporte.timestamp) -
        new Date(a.ultimoReporte.timestamp),
    )
    .slice(0, 8);

  return (
    <div className="layout-shell">
      <Sidebar />

      <div className="main-area">
        <header className="topbar">
          <span className="topbar-title">Dashboard</span>
          <div className="topbar-right">
            <span className="live-dot" />
            <span className="live-label">Vista previa con datos de prueba</span>
          </div>
        </header>

        <main className="main-content">
          <div className="dashboard">
            {/* Stats */}
            <div className="stats-grid">
              <StatCard label="Total buses" value={total} color="azul" />
              <StatCard label="Disponibles" value={dispCount} color="verde" />
              <StatCard
                label="Casi llenos"
                value={casiCount}
                color="amarillo"
              />
              <StatCard label="Llenos" value={llenoCount} color="rojo" />
            </div>

            {/* Flota */}
            <div className="section-title">Estado de la flota</div>
            <div className="bus-cards-grid">
              {buses.map((bus) => (
                <BusCard key={bus.id_bus} bus={bus} />
              ))}
            </div>

            {/* Tabla */}
            <div className="section-title" style={{ marginTop: 28 }}>
              Últimos reportes
            </div>
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
                  {ultimosReportes.map((bus) => {
                    const r = bus.ultimoReporte;
                    const pct = r?.porcentaje_ocupacion ?? null;
                    const nivel = getNivel(pct);
                    return (
                      <tr key={bus.id_bus}>
                        <td className="td-bold">{bus.codigo_bus}</td>
                        <td>{r.cantidad_pasajeros}</td>
                        <td>
                          <span className={`badge badge--${nivel}`}>
                            {pct !== null ? `${pct}%` : "—"}
                          </span>
                        </td>
                        <td className="muted">{fmtCoord(r.latitud)}</td>
                        <td className="muted">{fmtCoord(r.longitud)}</td>
                        <td className="muted">{fmtHora(r.timestamp)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
