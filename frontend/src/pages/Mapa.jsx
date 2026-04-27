import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "../style/Mapa/Mapa.css";
import Sidebar from "../components/Sidebar";
import { getReportes } from "../api/reportes";
import { getBuses } from "../api/buses";
import { getEstaciones } from "../api/estaciones";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ─── Colores por nivel de ocupación ────────────────────── */
const PIN_COLOR = {
  disponible: "#27AE60",
  "casi-lleno": "#F2C94C",
  lleno: "#EB5757",
  "sin-datos": "#B0B7C3",
};

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

const fmtHora = (ts) =>
  new Date(ts).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });

const FILTROS = [
  { key: "todos", label: "Todos" },
  { key: "disponible", label: "Disponibles" },
  { key: "casi-lleno", label: "Casi llenos" },
  { key: "lleno", label: "Llenos" },
];

/* ─── Icono personalizado para cada bus ────────────────── */
const crearIconoBus = (codigo, color, isSelected) => {
  const size = isSelected ? 44 : 38;
  const html = `
    <div style="
      position:relative;
      display:flex;
      flex-direction:column;
      align-items:center;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
    ">
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:${color};
        border:3px solid #fff;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:800;
        color:#fff;
        font-size:${isSelected ? 16 : 14}px;
        font-family:Inter,sans-serif;
        box-shadow: 0 0 0 ${isSelected ? "4px" : "2px"} ${color}55;
      ">🚌</div>
      <div style="
        background:${isSelected ? color : "#fff"};
        color:${isSelected ? "#fff" : color};
        border:1.5px solid ${color};
        border-radius:4px;
        padding:1px 5px;
        font-size:9px;
        font-weight:700;
        font-family:Inter,sans-serif;
        margin-top:2px;
        white-space:nowrap;
      ">${codigo}</div>
    </div>
  `;
  return L.divIcon({
    html,
    className: "",
    iconSize: [size + 20, size + 22],
    iconAnchor: [(size + 20) / 2, (size + 22) / 2],
    popupAnchor: [0, -(size / 2 + 14)],
  });
};

/* ─── Icono para estaciones ─────────────────────────────── */
const iconoEstacion = L.divIcon({
  html: `<div style="
    width:12px;height:12px;
    border-radius:50%;
    background:#fff;
    border:2.5px solid #0B3C5D;
    box-shadow:0 1px 3px rgba(0,0,0,0.2);
  "></div>`,
  className: "",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

/* ─── Último reporte por bus ─────────────────────────────── */
const ultimoReportePorBus = (reportes) => {
  const map = {};
  for (const r of reportes) {
    if (
      !map[r.id_bus] ||
      new Date(r.timestamp) > new Date(map[r.id_bus].timestamp)
    ) {
      map[r.id_bus] = r;
    }
  }
  return map;
};

/* ─── Estación más cercana ──────────────────────────────── */
const estacionMasCercana = (lat, lng, estaciones) => {
  let minDist = Infinity,
    nearest = null,
    nearestIdx = 0;
  estaciones.forEach((est, i) => {
    const d = Math.hypot(
      lat - est.latitud_estacion,
      lng - est.longitud_estacion,
    );
    if (d < minDist) {
      minDist = d;
      nearest = est;
      nearestIdx = i;
    }
  });
  return { nearest, nearestIdx };
};

/* ─── Interpola entre dos coordenadas ──────────────────── */
const interpolar = (desde, hasta, t) => ({
  lat: desde.lat + (hasta.lat - desde.lat) * t,
  lng: desde.lng + (hasta.lng - desde.lng) * t,
});

/* ─── Hook: posición animada por bus ───────────────────── */
const DURACION_MS = 8000; // duración de la animación entre posiciones

function usePosicionAnimada(busesEnriquecidos) {
  // posicionesRef: { [busId]: { lat, lng } } — posición interpolada actual
  const posicionesRef = useRef({});
  // animRef: { [busId]: { desde, hasta, startTime, rafId } }
  const animRef = useRef({});
  // estado para forzar re-render
  const [tick, setTick] = useState(0);

  useEffect(() => {
    busesEnriquecidos.forEach((bus) => {
      const r = bus.ultimoReporte;
      if (!r) return;

      const nuevaPos = {
        lat: parseFloat(r.latitud),
        lng: parseFloat(r.longitud),
      };

      const actual = posicionesRef.current[bus.id];

      // Si no hay posición previa, inicializar sin animar
      if (!actual) {
        posicionesRef.current[bus.id] = nuevaPos;
        return;
      }

      // Si la posición destino cambió, iniciar nueva animación
      const anim = animRef.current[bus.id];
      const mismoDestino =
        anim &&
        anim.hasta.lat === nuevaPos.lat &&
        anim.hasta.lng === nuevaPos.lng;

      if (mismoDestino) return; // ya está animando hacia ahí

      // Cancelar animación previa
      if (anim?.rafId) cancelAnimationFrame(anim.rafId);

      const desde = { ...posicionesRef.current[bus.id] };
      const startTime = performance.now();

      const animar = (now) => {
        const t = Math.min((now - startTime) / DURACION_MS, 1);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out

        posicionesRef.current[bus.id] = interpolar(desde, nuevaPos, eased);
        setTick((n) => n + 1); // fuerza re-render

        if (t < 1) {
          animRef.current[bus.id] = {
            ...animRef.current[bus.id],
            rafId: requestAnimationFrame(animar),
          };
        }
      };

      animRef.current[bus.id] = {
        desde,
        hasta: nuevaPos,
        startTime,
        rafId: requestAnimationFrame(animar),
      };
    });

    // Cleanup al desmontar
    return () => {
      Object.values(animRef.current).forEach((a) => {
        if (a?.rafId) cancelAnimationFrame(a.rafId);
      });
    };
  }, [busesEnriquecidos]);

  return posicionesRef.current;
}

export default function Mapa() {
  const [buses, setBuses] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [estaciones, setEstaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [seleccionado, setSeleccionado] = useState(null);
  const [rutaVial, setRutaVial] = useState([]);
  const intervalRef = useRef(null);
  const mapRef = useRef(null);

  /* ── Carga de datos ── */
  const cargar = useCallback(async () => {
    try {
      const [bData, rData, eData] = await Promise.all([
        getBuses(),
        getReportes(),
        getEstaciones(),
      ]);
      setBuses(bData ?? []);
      setReportes(rData ?? []);
      setEstaciones(eData ?? []);
    } catch (err) {
      console.error("Error al cargar datos del mapa:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    intervalRef.current = setInterval(cargar, 10000);
    return () => clearInterval(intervalRef.current);
  }, [cargar]);

  const ultimosPorBus = useMemo(
    () => ultimoReportePorBus(reportes),
    [reportes],
  );

  const busesEnriquecidos = useMemo(() => {
    return buses.map((bus) => {
      const r = ultimosPorBus[bus.id] ?? null;
      const pct = r
        ? Math.round((r.cantidad_pasajeros / bus.capacidad) * 100)
        : null;
      return {
        ...bus,
        ultimoReporte: r ? { ...r, pct } : null,
        tipoServicio: bus.tiposervicios?.tiposervicio ?? "—",
        estado: bus.estados?.estado ?? "—",
      };
    });
  }, [buses, ultimosPorBus]);

  /* ── Posiciones animadas ── */
  const posicionesAnimadas = usePosicionAnimada(busesEnriquecidos);

  const estacionesOrdenadas = useMemo(
    () => [...estaciones].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
    [estaciones],
  );

  /* ── Ruta vial OSRM ── */
  useEffect(() => {
    if (estacionesOrdenadas.length < 2) return;
    const coords = estacionesOrdenadas
      .map(
        (e) =>
          `${parseFloat(e.longitud_estacion)},${parseFloat(e.latitud_estacion)}`,
      )
      .join(";");
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.routes?.[0]) {
          const puntos = data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng],
          );
          setRutaVial(puntos);
        }
      })
      .catch(console.error);
  }, [estacionesOrdenadas]);

  const busesFiltrados = useMemo(() => {
    return busesEnriquecidos.filter((b) => {
      const nivel = getNivel(b.ultimoReporte?.pct);
      return filtro === "todos" || nivel === filtro;
    });
  }, [busesEnriquecidos, filtro]);

  const busesMapa = busesFiltrados.filter((b) => b.ultimoReporte);

  const stats = useMemo(
    () => ({
      total: busesEnriquecidos.length,
      disponible: busesEnriquecidos.filter(
        (b) => getNivel(b.ultimoReporte?.pct) === "disponible",
      ).length,
      casi: busesEnriquecidos.filter(
        (b) => getNivel(b.ultimoReporte?.pct) === "casi-lleno",
      ).length,
      lleno: busesEnriquecidos.filter(
        (b) => getNivel(b.ultimoReporte?.pct) === "lleno",
      ).length,
    }),
    [busesEnriquecidos],
  );

  const destinoPorBus = useMemo(() => {
    const map = {};
    busesMapa.forEach((bus) => {
      const r = bus.ultimoReporte;
      if (!r || estacionesOrdenadas.length === 0) return;
      const { nearestIdx } = estacionMasCercana(
        r.latitud,
        r.longitud,
        estacionesOrdenadas,
      );
      const destIdx = (nearestIdx + 1) % estacionesOrdenadas.length;
      map[bus.id] = estacionesOrdenadas[destIdx];
    });
    return map;
  }, [busesMapa, estacionesOrdenadas]);

  const mapCenter = useMemo(() => {
    if (estacionesOrdenadas.length === 0) return [-12.05, -77.05];
    const lats = estacionesOrdenadas.map((e) => parseFloat(e.latitud_estacion));
    const lngs = estacionesOrdenadas.map((e) =>
      parseFloat(e.longitud_estacion),
    );
    return [
      lats.reduce((a, b) => a + b, 0) / lats.length,
      lngs.reduce((a, b) => a + b, 0) / lngs.length,
    ];
  }, [estacionesOrdenadas]);

  const handleSeleccionarBus = useCallback(
    (busId) => {
      setSeleccionado((prev) => (prev === busId ? null : busId));
      const bus = busesEnriquecidos.find((b) => b.id === busId);
      const pos = posicionesAnimadas[busId];
      if (pos && mapRef.current) {
        mapRef.current.flyTo([pos.lat, pos.lng], 16, { duration: 1.2 });
      }
    },
    [busesEnriquecidos, posicionesAnimadas],
  );

  return (
    <div className="layout-shell">
      <Sidebar />

      <div className="main-area">
        <header className="topbar">
          <span className="topbar-title">Mapa</span>
          <div className="topbar-right">
            <span className="live-dot" />
            <span className="live-label">
              {loading ? "Cargando..." : "Actualizando cada 10s"}
            </span>
          </div>
        </header>

        <main className="main-content">
          <div className="mapa-page">
            <div className="mapa-header">
              <div className="mapa-header__titles">
                <h2>Posición en tiempo real</h2>
                <p>
                  {estacionesOrdenadas.length > 0
                    ? `${estacionesOrdenadas[0]?.estaciones} → ${estacionesOrdenadas[estacionesOrdenadas.length - 1]?.estaciones}`
                    : "Cargando ruta..."}
                  {" · "}
                  {busesMapa.length} buses en mapa
                </p>
              </div>
            </div>

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

            <div className="mapa-body">
              {/* Panel lateral */}
              <div className="mapa-panel">
                <div className="panel-title">
                  Buses · {busesFiltrados.length}
                </div>

                {loading ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px 0",
                      color: "var(--color-text-gray)",
                    }}
                  >
                    <i
                      className="pi pi-spin pi-spinner"
                      style={{ fontSize: 20 }}
                    />
                    <p style={{ marginTop: 8, fontSize: 12 }}>Cargando...</p>
                  </div>
                ) : (
                  busesFiltrados.map((bus) => {
                    const r = bus.ultimoReporte;
                    const pct = r?.pct ?? null;
                    const nivel = getNivel(pct);
                    const isSelected = seleccionado === bus.id;
                    const destino = destinoPorBus[bus.id];

                    return (
                      <div
                        key={bus.id}
                        className={`panel-bus-card panel-bus-card--${nivel} ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSeleccionarBus(bus.id)}
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
                          <div className="pbc-pasajeros">
                            <span className="pbc-pax-icon">👥</span>
                            <span>
                              {r.cantidad_pasajeros} / {bus.capacidad} pax
                            </span>
                          </div>
                        )}

                        {destino && (
                          <div className="pbc-destino">
                            <span className="pbc-destino-arrow">→</span>
                            <span>{destino.estaciones}</span>
                          </div>
                        )}

                        {r && (
                          <div className="pbc-coord">
                            {posicionesAnimadas[bus.id]
                              ? `${posicionesAnimadas[bus.id].lat.toFixed(4)}, ${posicionesAnimadas[bus.id].lng.toFixed(4)}`
                              : `${parseFloat(r.latitud).toFixed(4)}, ${parseFloat(r.longitud).toFixed(4)}`}
                            {" · "}
                            {fmtHora(r.timestamp)}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Mapa Leaflet */}
              <div
                className="mapa-container"
                style={{ padding: 0, overflow: "hidden", borderRadius: 12 }}
              >
                {/* Contador flotante */}
                <div className="mapa-counter" style={{ zIndex: 1000 }}>
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

                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      flexDirection: "column",
                      gap: 12,
                      color: "var(--color-text-gray)",
                    }}
                  >
                    <i
                      className="pi pi-spin pi-spinner"
                      style={{ fontSize: 28, color: "var(--color-blue)" }}
                    />
                    <p style={{ fontSize: 13 }}>Cargando mapa...</p>
                  </div>
                ) : (
                  <MapContainer
                    center={mapCenter}
                    zoom={14}
                    style={{ width: "100%", height: "100%", borderRadius: 12 }}
                    ref={mapRef}
                    zoomControl={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    {/* Ruta vial */}
                    {rutaVial.length > 1 && (
                      <Polyline
                        positions={rutaVial}
                        pathOptions={{
                          color: "#0B3C5D",
                          weight: 5,
                          opacity: 0.8,
                        }}
                      />
                    )}

                    {/* Estaciones */}
                    {estacionesOrdenadas.map((est) => (
                      <Marker
                        key={est.id ?? est.estaciones}
                        position={[
                          parseFloat(est.latitud_estacion),
                          parseFloat(est.longitud_estacion),
                        ]}
                        icon={iconoEstacion}
                      >
                        <Tooltip
                          direction="top"
                          offset={[0, -8]}
                          permanent
                          className="estacion-tooltip"
                        >
                          {est.estaciones}
                        </Tooltip>
                      </Marker>
                    ))}

                    {/* Buses — usan posición interpolada */}
                    {busesMapa.map((bus) => {
                      const r = bus.ultimoReporte;
                      const nivel = getNivel(r.pct);
                      const color = PIN_COLOR[nivel];
                      const isSelected = seleccionado === bus.id;
                      const destino = destinoPorBus[bus.id];

                      // Posición animada o fallback al reporte real
                      const pos = posicionesAnimadas[bus.id] ?? {
                        lat: parseFloat(r.latitud),
                        lng: parseFloat(r.longitud),
                      };

                      return (
                        <Marker
                          key={bus.id}
                          position={[pos.lat, pos.lng]}
                          icon={crearIconoBus(
                            bus.codigo_bus,
                            color,
                            isSelected,
                          )}
                          eventHandlers={{
                            click: () => handleSeleccionarBus(bus.id),
                          }}
                          zIndexOffset={isSelected ? 1000 : 0}
                        >
                          <Popup
                            closeOnClick={false}
                            autoPan={false}
                            className="bus-popup"
                          >
                            <div
                              style={{
                                fontFamily: "Inter, sans-serif",
                                minWidth: 180,
                                padding: "4px 2px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: 8,
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 15,
                                    color: "#1F2937",
                                  }}
                                >
                                  {bus.codigo_bus}
                                </span>
                                <span
                                  style={{
                                    background: color + "22",
                                    color,
                                    border: `1px solid ${color}`,
                                    borderRadius: 6,
                                    padding: "2px 8px",
                                    fontSize: 11,
                                    fontWeight: 600,
                                  }}
                                >
                                  {getLabelNivel(nivel)}
                                </span>
                              </div>

                              <div
                                style={{
                                  background: "#F3F4F6",
                                  borderRadius: 4,
                                  height: 6,
                                  marginBottom: 10,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${Math.min(r.pct ?? 0, 100)}%`,
                                    height: "100%",
                                    background: color,
                                    borderRadius: 4,
                                    transition: "width 0.4s ease",
                                  }}
                                />
                              </div>

                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#6B7280",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 4,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <span>Servicio</span>
                                  <span
                                    style={{
                                      color: "#1F2937",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {bus.tipoServicio}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <span>Pasajeros</span>
                                  <span
                                    style={{
                                      color: "#1F2937",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {r.cantidad_pasajeros} / {bus.capacidad}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <span>Ocupación</span>
                                  <span style={{ color, fontWeight: 700 }}>
                                    {r.pct}%
                                  </span>
                                </div>
                                {destino && (
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <span>→ Próxima</span>
                                    <span
                                      style={{
                                        color: "#1F2937",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {destino.estaciones}
                                    </span>
                                  </div>
                                )}
                                <div
                                  style={{
                                    marginTop: 4,
                                    paddingTop: 6,
                                    borderTop: "1px solid #F3F4F6",
                                    color: "#B0B7C3",
                                    fontSize: 10,
                                  }}
                                >
                                  Última actualización: {fmtHora(r.timestamp)}
                                </div>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                )}

                {/* Leyenda */}
                <div className="mapa-leyenda" style={{ zIndex: 1000 }}>
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
