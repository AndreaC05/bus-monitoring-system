const express = require("express");
const cors = require("cors");
const app = express();

require('dotenv').config();

app.use(express.json());

// Habilitar CORS
app.use(cors());

//Importaciones de rutas
const estado = require("./routes/estadoRouter");
const tiposervicios = require("./routes/tiposervicioRouter");
const buses = require("./routes/busRouter");
const reportes = require("./routes/reportesRouter");
const estacion = require("./routes/estacionRouter");
const tiposervicioestacion = require("./routes/tiposervicioestacionRouter");


// Estado
app.use("/api/estados", estado);

// tipo servicios
app.use("/api/tiposervicios", tiposervicios);

// buses
app.use("/api/buses", buses);

// reportes
app.use("/api/reportes", reportes);

// estacion
app.use("/api/estacion", estacion);

// tipo servicio estacion
app.use("/api/tiposervicioestacion", tiposervicioestacion);

// Configurar HTTP
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
});