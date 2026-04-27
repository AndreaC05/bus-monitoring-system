const { Reportes, Bus, Estacion, TipoServicioEstacion } = require("./models");

const estadoBuses = {};

// 🔹 Función para construir la ruta
const construirRuta = async (idTipoServicio) => {
  const paradas = await TipoServicioEstacion.findAll({
    where: { id_tipo_servicio: idTipoServicio },
    include: [{ model: Estacion, as: "estaciones" }],
    order: [["orden", "ASC"]],
  });

  return paradas.map((p) => ({
    nombre: p.estaciones.estaciones,
    latitud: parseFloat(p.estaciones.latitud_estacion),
    longitud: parseFloat(p.estaciones.longitud_estacion),
  }));
};

// 🔹 Interpolación (movimiento entre puntos)
const interpolar = (inicio, fin, progreso) => {
  return inicio + (fin - inicio) * progreso;
};

const iniciarSimulador = async () => {
  const buses = await Bus.findAll();

  // Inicializar estado
  for (const bus of buses) {
    const ruta = await construirRuta(bus.id_tipo_servicio);
    if (ruta.length === 0) continue;

    estadoBuses[bus.id] = {
      ruta,
      paradaActual: 0,
      pasajeros: 0,
      capacidad: bus.capacidad,
      enViaje: true,
      progreso: 0,
      direccion: 1, // 1 = ida, -1 = vuelta
    };
  }

  console.log(`Simulador iniciado con ${Object.keys(estadoBuses).length} buses`);

  setInterval(async () => {
    try {
      const buses = await Bus.findAll();

      for (const bus of buses) {
        const estado = estadoBuses[bus.id];
        if (!estado || estado.ruta.length < 2) continue;

        const ruta = estado.ruta;
        const paradaIdx = estado.paradaActual;

        let siguienteIdx = paradaIdx + estado.direccion;

        // 🔁 Control de extremos (ida/vuelta)
        if (siguienteIdx >= ruta.length) {
          estado.direccion = -1;
          siguienteIdx = paradaIdx + estado.direccion;
        }

        if (siguienteIdx < 0) {
          estado.direccion = 1;
          siguienteIdx = paradaIdx + estado.direccion;
        }

        const paradaActual = ruta[paradaIdx];
        const paradaSiguiente = ruta[siguienteIdx];

        // 🔹 Avance progresivo
        estado.progreso += 0.2; // velocidad

        // 🔹 Si llega a la siguiente parada
        if (estado.progreso >= 1) {
          estado.paradaActual = siguienteIdx;
          estado.progreso = 0;

          // 🎲 Lógica de pasajeros SOLO en paradas
          const esUltima = estado.paradaActual === ruta.length - 1;
          const esPrimera = estado.paradaActual === 0;

          if (esUltima || esPrimera) {
            estado.pasajeros = 0;
          } else {
            const bajaron = Math.floor(Math.random() * Math.min(estado.pasajeros + 1, 20));
            const espacioDisponible = estado.capacidad - (estado.pasajeros - bajaron);
            const subieron = Math.floor(Math.random() * Math.min(espacioDisponible + 1, 25));

            estado.pasajeros = Math.max(0, estado.pasajeros - bajaron + subieron);
          }
        }

        // 📍 Coordenadas interpoladas
        const lat = interpolar(
          paradaActual.latitud,
          paradaSiguiente.latitud,
          estado.progreso
        );

        const lng = interpolar(
          paradaActual.longitud,
          paradaSiguiente.longitud,
          estado.progreso
        );

        // 💾 Guardar reporte
        await Reportes.create({
          id_bus: bus.id,
          latitud: parseFloat(lat.toFixed(6)),
          longitud: parseFloat(lng.toFixed(6)),
          cantidad_pasajeros: estado.pasajeros,
          timestamp: new Date(),
        });

        console.log(
          `[${bus.codigo_bus}] Moviendo → (${lat.toFixed(5)}, ${lng.toFixed(5)}) | ` +
          `Pasajeros: ${estado.pasajeros}/${estado.capacidad}`
        );
      }
    } catch (err) {
      console.error("Error en simulador:", err.message);
    }
  }, 5000); // ⏱ cada 5 segundos
};

module.exports = { iniciarSimulador };