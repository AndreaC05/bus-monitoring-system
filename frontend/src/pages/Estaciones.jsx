import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import FormularioEstaciones from "../components/Estaciones/FormularioEstaciones";
import FormularioEditarEstaciones from "../components/Estaciones/FormularioEditarEstaciones";
import FormularioDeleteEstaciones from "../components/Estaciones/FormularioDeleteEstaciones";
import EstacionCard from "../components/Estaciones/EstacionCard";
import { getEstaciones } from "../api/estaciones";
import "../style/Estaciones/Estaciones.css";
import Sidebar from "../components/Sidebar";

export default function Estaciones() {
  const [estaciones, setEstaciones] = useState([]);
  const [loadingTabla, setLoadingTabla] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState(null);
  const toast = useRef(null);

  /* ── Cargar estaciones ── */
  const cargarEstaciones = useCallback(async () => {
    setLoadingTabla(true);
    try {
      const data = await getEstaciones();
      setEstaciones(data ?? []);
    } catch (err) {
      console.error("Error al cargar estaciones:", err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar la lista de estaciones.",
        life: 4000,
      });
    } finally {
      setLoadingTabla(false);
    }
  }, []);

  useEffect(() => {
    cargarEstaciones();
  }, [cargarEstaciones]);

  /* ── Escuchar eventos de EstacionCard para editar/eliminar estación ── */
  useEffect(() => {
    const handleEditar = (e) => {
      setEstacionSeleccionada(e.detail);
      setModalEditarVisible(true);
    };
    const handleEliminar = (e) => {
      setEstacionSeleccionada(e.detail);
      setModalDeleteVisible(true);
    };

    window.addEventListener("editar-estacion", handleEditar);
    window.addEventListener("eliminar-estacion", handleEliminar);
    return () => {
      window.removeEventListener("editar-estacion", handleEditar);
      window.removeEventListener("eliminar-estacion", handleEliminar);
    };
  }, []);

  /* ── Callbacks al guardar ── */
  const handleGuardar = (estacionCreada) => {
    toast.current?.show({
      severity: "success",
      summary: "Estación registrada",
      detail: `${estacionCreada?.estaciones ?? "Nueva estación"} agregada a la ruta.`,
      life: 3500,
    });
    cargarEstaciones();
  };

  const handleGuardadoEdicion = (est) => {
    toast.current?.show({
      severity: "success",
      summary: "Estación actualizada",
      detail: `${est.estaciones} fue modificada correctamente.`,
      life: 3500,
    });
    cargarEstaciones();
  };

  const handleEliminado = (est) => {
    toast.current?.show({
      severity: "success",
      summary: "Estación eliminada",
      detail: `${est.estaciones} fue eliminada.`,
      life: 3500,
    });
    cargarEstaciones();
  };

  /* ── Filtrado local ── */
  const estacionesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return estaciones;
    const q = busqueda.toLowerCase();
    return estaciones.filter((e) => e.estaciones?.toLowerCase().includes(q));
  }, [estaciones, busqueda]);

  return (
    <div className="layout-shell">
      <Sidebar />

      <Toast ref={toast} position="top-right" />

      <div className="main-area">
        <header className="topbar">
          <span className="topbar-title">Estaciones</span>
          <div className="topbar-right">
            <span className="live-dot" />
            <span className="live-label">
              {loadingTabla ? "Actualizando..." : "En vivo"}
            </span>
          </div>
        </header>

        <main className="main-content">
          <div className="estaciones-page">
            {/* Header */}
            <div className="estaciones-header">
              <div className="estaciones-header__titles">
                <h2>Estaciones de la ruta</h2>
                <p>{estaciones.length} estaciones registradas en el sistema</p>
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
                Nueva estación
              </button>
            </div>

            {/* Stats */}
            <div className="estaciones-stats">
              <div className="est-stat">
                <div className="est-stat__icon est-stat__icon--blue">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M8 1C5.8 1 4 2.8 4 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" />
                    <circle cx="8" cy="5" r="1.5" />
                  </svg>
                </div>
                <div>
                  <div className="est-stat__val">{estaciones.length}</div>
                  <div className="est-stat__label">Estaciones</div>
                </div>
              </div>

              <div className="est-stat">
                <div className="est-stat__icon est-stat__icon--navy">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <polygon
                      points="1,3 6,1 10,3 15,1 15,13 10,15 6,13 1,15"
                      strokeLinejoin="round"
                    />
                    <line x1="6" y1="1" x2="6" y2="13" />
                    <line x1="10" y1="3" x2="10" y2="15" />
                  </svg>
                </div>
                <div>
                  <div className="est-stat__val">
                    {estacionesFiltradas.length}
                  </div>
                  <div className="est-stat__label">Mostrando</div>
                </div>
              </div>
            </div>

            {/* Línea visual de ruta */}
            {estaciones.length > 0 && (
              <div className="ruta-line">
                {estaciones.map((e, i) => (
                  <div
                    key={e.id}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <div className="ruta-stop">
                      <div className="ruta-stop__dot" />
                      <div className="ruta-stop__label">{e.estaciones}</div>
                    </div>
                    {i < estaciones.length - 1 && (
                      <div className="ruta-line-segment" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Buscador */}
            <div className="estaciones-search">
              <span className="estaciones-search__icon">
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
                type="text"
                placeholder="Buscar estación..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Grid de cards */}
            <div className="estaciones-grid">
              {loadingTabla ? (
                <div className="estaciones-empty">
                  <i
                    className="pi pi-spin pi-spinner"
                    style={{ fontSize: 24, color: "var(--color-blue)" }}
                  />
                  <p style={{ marginTop: 10 }}>Cargando estaciones...</p>
                </div>
              ) : estacionesFiltradas.length === 0 ? (
                <div className="estaciones-empty">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="#B0B7C3"
                    strokeWidth="1.2"
                  >
                    <path d="M8 1C5.8 1 4 2.8 4 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" />
                    <circle cx="8" cy="5" r="1.5" />
                  </svg>
                  <p>No se encontraron estaciones</p>
                </div>
              ) : (
                estacionesFiltradas.map((est, i) => (
                  <EstacionCard
                    key={est.id}
                    est={est}
                    index={i}
                    onRefresh={cargarEstaciones}
                    toast={toast}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modales de estación */}
      <FormularioEstaciones
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        onGuardar={handleGuardar}
      />

      <FormularioEditarEstaciones
        visible={modalEditarVisible}
        onHide={() => setModalEditarVisible(false)}
        onGuardar={handleGuardadoEdicion}
        estacion={estacionSeleccionada}
      />

      <FormularioDeleteEstaciones
        visible={modalDeleteVisible}
        onHide={() => setModalDeleteVisible(false)}
        onEliminado={handleEliminado}
        estacion={estacionSeleccionada}
      />
    </div>
  );
}
