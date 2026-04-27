const { Reportes, Bus } = require("../models");

//Obtener Reportes

const getReportes = async (req, res) => {
  try {
    const reportes = await Reportes.findAll({
      include: [{ model: Bus, as: "buses" }],
      order: [["timestamp", "DESC"]],
      limit: 100,
    });
    res.status(200).json(reportes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los Reportes", error });
  }
};

//Obtener Reportes por id

const getReportesById = async (req, res) => {
  try {
    const reportes = await Reportes.finByPk(req.params.id, {
      include: [
        {
          model: Bus,
          as: "buses",
        },
      ],
    });

    if (!reportes)
      return res.status(404).json({ message: "Reportes no encontrado" });

    res.status(200).json(reportes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el Reportes" });
  }
};

// Creación de Reportes

const storeReportes = async (req, res) => {
  try {
    const { id_bus, latitud, longitud, cantidad_pasajeros, timestamp } =
      req.body;

    const reportes = await Reportes.create({
      id_bus,
      latitud,
      longitud,
      cantidad_pasajeros,
      timestamp,
    });

    console.log(reportes);

    res.status(201).json(reportes);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el Reportes", error });
  }
};

//Actualiza usuario

const updateReportes = async (req, res) => {
  try {
    const { id_bus, latitud, longitud, cantidad_pasajeros, timestamp } =
      req.body;

    const reportes = await Reportes.findByPk(req.params.id);
    if (!reportes)
      return res
        .status(404)
        .json({ message: "No se pudo encontrar el Reportes" });

    const update = await Reportes.update(
      { id_bus, latitud, longitud, cantidad_pasajeros, timestamp },
      { where: { id: req.params.id } },
    );

    if (update[0])
      return res
        .status(200)
        .json({ message: "Reportes actuzalido exitosamente" });

    return res
      .status(400)
      .json({ message: "No se pudo actualizar el Reportes" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el Reportes", error });
  }
};

//Eliminar usuario

const deleteReportes = async (req, res) => {
  try {
    const reportes = await Reportes.findByPk(req.params.id);

    if (!reportes)
      return res
        .status(404)
        .json({ message: "No se pudo encontrar el Reportes" });

    await Reportes.destroy({ where: { id: req.params.id } });

    return res.status(200).json({ message: "Reportes eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el Reportes", error });
  }
};

//Exportar modulos

module.exports = {
  getReportes,
  getReportesById,
  storeReportes,
  updateReportes,
  deleteReportes,
};
