import { useState, useMemo } from "react";
import "../style/Mapa/Mapa.css";
import Sidebar from "../components/Sidebar";

const BUSES_MOCK = [
  {
    id_bus: 1,
    codigo_bus: "MET-001",
    capacidad: 160,
    tipoServicio: "Expreso",
    ultimoReporte: {
      cantidad_pasajeros: 68,
      porcentaje_ocupacion: 43,
      latitud: -11.9289,
      longitud: -77.0634,
      timestamp: "2025-04-26T14:32:00",
    },
  },
  {
    id_bus: 2,
    codigo_bus: "MET-002",
    capacidad: 160,
    tipoServicio: "Expreso",
    ultimoReporte: {
      cantidad_pasajeros: 140,
      porcentaje_ocupacion: 88,
      latitud: -12.1104,
      longitud: -77.0113,
      timestamp: "2025-04-26T14:31:00",
    },
  },
  {
    id_bus: 3,
    codigo_bus: "MET-003",
    capacidad: 120,
    tipoServicio: "Regular",
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
    tipoServicio: "Regular",
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
    tipoServicio: "Alimentador Norte",
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
    tipoServicio: "Alimentador Sur",
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
    tipoServicio: "Expreso",
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
    tipoServicio: "Regular",
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
    tipoServicio: "Alimentador Norte",
    ultimoReporte: null,
  },
];

/* Estaciones para dibujar la ruta en el mapa */
const ESTACIONES = [
  { nombre: "Naranjal", lat: -11.9289, lng: -77.0634 },
  { nombre: "Independencia", lat: -11.9512, lng: -77.0577 },
  { nombre: "Caquetá", lat: -11.9718, lng: -77.0532 },
  { nombre: "España", lat: -11.993, lng: -77.0461 },
  { nombre: "Est. Central", lat: -12.0564, lng: -77.0855 },
  { nombre: "Javier Prado", lat: -12.0884, lng: -77.0204 },
  { nombre: "Angamos", lat: -12.1104, lng: -77.0113 },
  { nombre: "Benavides", lat: -12.1256, lng: -77.0075 },
  { nombre: "Matellini", lat: -12.1822, lng: -77.0042 },
];

const getNivel = (pct) => {
  if (pct === null || pct === undefined) return "sin-datos";
  if (pct >= 100) return "lleno";
  if (pct >= 80) return "casi-lleno";
  return "disponible";
};

const getLabelNivel = (n) => {
  if (n === "lleno") return "Lleno";
  if (n === "casi-lleno") return "Casi lleno";
  if (n === "disponible") return "Disponible";
  return "Sin datos";
};

const PIN_COLOR = {
  disponible: "#27AE60",
  "casi-lleno": "#F2C94C",
  lleno: "#EB5757",
  "sin-datos": "#B0B7C3",
};

const fmtHora = (ts) =>
  new Date(ts).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });

/* Proyección simple lat/lng → px dentro del viewBox 800x520 */
const LAT_MIN = -12.22,
  LAT_MAX = -11.9;
const LNG_MIN = -77.11,
  LNG_MAX = -76.98;
const W = 800,
  H = 520;

const project = (lat, lng) => ({
  x: ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W,
  y: ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * (H * -1) + H,
});

const FILTROS = [
  { key: "todos", label: "Todos" },
  { key: "disponible", label: "Disponibles" },
  { key: "casi-lleno", label: "Casi llenos" },
  { key: "lleno", label: "Llenos" },
];

export default function Mapa() {
  const [filtro, setFiltro] = useState("todos");
  const [seleccionado, setSeleccionado] = useState(null);

  const busesFiltrados = useMemo(() => {
    return BUSES_MOCK.filter((b) => {
      const nivel = getNivel(b.ultimoReporte?.porcentaje_ocupacion);
      return filtro === "todos" || nivel === filtro;
    });
  }, [filtro]);

  const busesMapa = busesFiltrados.filter((b) => b.ultimoReporte);

  const busSelec = seleccionado
    ? BUSES_MOCK.find((b) => b.id_bus === seleccionado)
    : null;

  const stats = {
    total: BUSES_MOCK.length,
    disponible: BUSES_MOCK.filter(
      (b) => getNivel(b.ultimoReporte?.porcentaje_ocupacion) === "disponible",
    ).length,
    casi: BUSES_MOCK.filter(
      (b) => getNivel(b.ultimoReporte?.porcentaje_ocupacion) === "casi-lleno",
    ).length,
    lleno: BUSES_MOCK.filter(
      (b) => getNivel(b.ultimoReporte?.porcentaje_ocupacion) === "lleno",
    ).length,
  };

  return (
    <div className="layout-shell">
      <Sidebar />

      <div className="main-area">
        <header className="topbar">
          <span className="topbar-title">Mapa</span>
          <div className="topbar-right">
            <span className="live-dot" />
            <span className="live-label">Vista previa con datos de prueba</span>
          </div>
        </header>

        <main className="main-content">
          <div className="mapa-page">
            {/* Header */}
            <div className="mapa-header">
              <div className="mapa-header__titles">
                <h2>Posición en tiempo real</h2>
                <p>
                  Ruta Naranjal → Matellini · {busesMapa.length} buses en mapa
                </p>
              </div>
            </div>

            {/* Chips filtro */}
            <div className="mapa-chips">
              {FILTROS.map((f) => (
                <button
                  key={f.key}
                  className={`mchip ${filtro === f.key ? "active" : ""}`}
                  onClick={() => setFiltro(f.key)}
                >
                  {f.key !== "todos" && (
                    <span
                      className="mchip__dot"
                      style={{ background: PIN_COLOR[f.key] }}
                    />
                  )}
                  {f.label}
                </button>
              ))}
            </div>

            {/* Body: mapa + panel */}
            <div className="mapa-body">
              {/* Panel lateral */}
              <div className="mapa-panel">
                <div className="panel-title">
                  Buses · {busesFiltrados.length}
                </div>
                {busesFiltrados.map((bus) => {
                  const r = bus.ultimoReporte;
                  const pct = r?.porcentaje_ocupacion ?? null;
                  const nivel = getNivel(pct);
                  const isSelected = seleccionado === bus.id_bus;
                  return (
                    <div
                      key={bus.id_bus}
                      className={`panel-bus-card panel-bus-card--${nivel} ${isSelected ? "selected" : ""}`}
                      onClick={() =>
                        setSeleccionado(isSelected ? null : bus.id_bus)
                      }
                    >
                      <div className="pbc-top">
                        <span className="pbc-code">{bus.codigo_bus}</span>
                        <span className={`badge badge--${nivel}`}>
                          <span className="badge__dot" />
                          {getLabelNivel(nivel)}
                        </span>
                      </div>
                      <div className="ocu-bar-bg">
                        <div
                          className={`ocu-bar-fill ocu-bar-fill--${nivel}`}
                          style={{ width: `${Math.min(pct ?? 0, 100)}%` }}
                        />
                      </div>
                      <div className="pbc-meta">
                        <span>{bus.tipoServicio}</span>
                        <span>{pct !== null ? `${pct}%` : "—"}</span>
                      </div>
                      {r && (
                        <div className="pbc-coord">
                          {parseFloat(r.latitud).toFixed(4)},{" "}
                          {parseFloat(r.longitud).toFixed(4)}
                          {" · "}
                          {fmtHora(r.timestamp)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mapa SVG */}
              <div className="mapa-container">
                {/* Contador flotante */}
                <div className="mapa-counter">
                  <div className="mapa-counter-item">
                    <span>{stats.total}</span>
                    <span>Total</span>
                  </div>
                  <div className="mapa-counter-item">
                    <span style={{ color: "#27AE60" }}>{stats.disponible}</span>
                    <span>Libres</span>
                  </div>
                  <div className="mapa-counter-item">
                    <span style={{ color: "#B7770D" }}>{stats.casi}</span>
                    <span>Casi</span>
                  </div>
                  <div className="mapa-counter-item">
                    <span style={{ color: "#EB5757" }}>{stats.lleno}</span>
                    <span>Llenos</span>
                  </div>
                </div>

                <svg
                  className="mapa-svg"
                  viewBox={`0 0 ${W} ${H}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Fondo de cuadrícula sutil */}
                  <defs>
                    <pattern
                      id="grid"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="#D8DDE6"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width={W} height={H} fill="#EDF1F7" />
                  <rect width={W} height={H} fill="url(#grid)" />

                  {/* Línea de ruta entre estaciones */}
                  {ESTACIONES.map((est, i) => {
                    if (i === ESTACIONES.length - 1) return null;
                    const a = project(est.lat, est.lng);
                    const b = project(
                      ESTACIONES[i + 1].lat,
                      ESTACIONES[i + 1].lng,
                    );
                    return (
                      <line
                        key={i}
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke="#0B3C5D"
                        strokeWidth="2.5"
                        strokeDasharray="6 4"
                        opacity="0.4"
                      />
                    );
                  })}

                  {/* Puntos de estaciones */}
                  {ESTACIONES.map((est) => {
                    const { x, y } = project(est.lat, est.lng);
                    return (
                      <g key={est.nombre}>
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#fff"
                          stroke="#0B3C5D"
                          strokeWidth="2"
                        />
                        <text
                          x={x}
                          y={y - 10}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#6B7280"
                          fontFamily="Inter, sans-serif"
                        >
                          {est.nombre}
                        </text>
                      </g>
                    );
                  })}

                  {/* Pines de buses */}
                  {busesMapa.map((bus) => {
                    const r = bus.ultimoReporte;
                    const pct = r.porcentaje_ocupacion;
                    const nivel = getNivel(pct);
                    const color = PIN_COLOR[nivel];
                    const { x, y } = project(r.latitud, r.longitud);
                    const isSelected = seleccionado === bus.id_bus;

                    return (
                      <g
                        key={bus.id_bus}
                        className={`bus-pin ${isSelected ? "selected" : ""}`}
                        onClick={() =>
                          setSeleccionado(isSelected ? null : bus.id_bus)
                        }
                        transform={`translate(${x}, ${y})`}
                      >
                        {/* Sombra */}
                        <circle cx="0" cy="2" r="10" fill="rgba(0,0,0,0.1)" />
                        {/* Pin cuerpo */}
                        <circle
                          cx="0"
                          cy="0"
                          r="14"
                          fill={color}
                          opacity="0.2"
                        />
                        <circle cx="0" cy="0" r="10" fill={color} />
                        {/* Ícono bus */}
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fontSize="11"
                          fill="#fff"
                          fontFamily="Inter, sans-serif"
                          fontWeight="700"
                          style={{ pointerEvents: "none" }}
                        >
                          B
                        </text>
                        {/* Etiqueta código */}
                        <rect
                          x="-22"
                          y="14"
                          width="44"
                          height="14"
                          rx="4"
                          fill={isSelected ? color : "#fff"}
                          stroke={color}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="24"
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="600"
                          fill={isSelected ? "#fff" : color}
                          fontFamily="Inter, sans-serif"
                          style={{ pointerEvents: "none" }}
                        >
                          {bus.codigo_bus}
                        </text>
                      </g>
                    );
                  })}

                  {/* Popup del bus seleccionado */}
                  {busSelec &&
                    busSelec.ultimoReporte &&
                    (() => {
                      const r = busSelec.ultimoReporte;
                      const pct = r.porcentaje_ocupacion;
                      const nivel = getNivel(pct);
                      const { x, y } = project(r.latitud, r.longitud);
                      const px = Math.min(x + 18, W - 160);
                      const py = Math.max(y - 90, 10);
                      return (
                        <g transform={`translate(${px}, ${py})`}>
                          <rect
                            x="0"
                            y="0"
                            width="150"
                            height="80"
                            rx="8"
                            fill="#fff"
                            stroke="#E5E7EB"
                            strokeWidth="1"
                          />
                          <text
                            x="10"
                            y="18"
                            fontSize="11"
                            fontWeight="700"
                            fill="#1F2937"
                            fontFamily="Inter, sans-serif"
                          >
                            {busSelec.codigo_bus}
                          </text>
                          <text
                            x="10"
                            y="32"
                            fontSize="9"
                            fill="#6B7280"
                            fontFamily="Inter, sans-serif"
                          >
                            {busSelec.tipoServicio}
                          </text>
                          <text
                            x="10"
                            y="48"
                            fontSize="9"
                            fill="#6B7280"
                            fontFamily="Inter, sans-serif"
                          >
                            Pasajeros:
                          </text>
                          <text
                            x="80"
                            y="48"
                            fontSize="9"
                            fontWeight="600"
                            fill="#1F2937"
                            fontFamily="Inter, sans-serif"
                          >
                            {r.cantidad_pasajeros}/{busSelec.capacidad}
                          </text>
                          <text
                            x="10"
                            y="62"
                            fontSize="9"
                            fill="#6B7280"
                            fontFamily="Inter, sans-serif"
                          >
                            Ocupación:
                          </text>
                          <text
                            x="80"
                            y="62"
                            fontSize="9"
                            fontWeight="600"
                            fill={PIN_COLOR[nivel]}
                            fontFamily="Inter, sans-serif"
                          >
                            {pct}%
                          </text>
                          <text
                            x="10"
                            y="75"
                            fontSize="8"
                            fill="#B0B7C3"
                            fontFamily="Inter, sans-serif"
                          >
                            {fmtHora(r.timestamp)}
                          </text>
                        </g>
                      );
                    })()}
                </svg>

                {/* Leyenda */}
                <div className="mapa-leyenda">
                  <div className="leyenda-item">
                    <span
                      className="leyenda-dot"
                      style={{ background: "#27AE60" }}
                    />
                    Disponible
                  </div>
                  <div className="leyenda-item">
                    <span
                      className="leyenda-dot"
                      style={{ background: "#F2C94C" }}
                    />
                    Casi lleno
                  </div>
                  <div className="leyenda-item">
                    <span
                      className="leyenda-dot"
                      style={{ background: "#EB5757" }}
                    />
                    Lleno
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
