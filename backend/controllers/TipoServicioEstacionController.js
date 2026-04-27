const { TipoServicioEstacion, Estacion, TipoServicio } = require("../models");

//Obtener TipoServicioEstacion

const getTipoServicioEstacion = async (req, res) => {
  try {
    const tipo_servicio_estacion = await TipoServicioEstacion.findAll({
      include: [
        {
          model: Estacion,
          as: "estaciones",
        },
        {
          model: TipoServicio,
          as: "tiposervicios",
        },
      ],
    });

    res.status(200).json(tipo_servicio_estacion);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obetener los TipoServicioEstacion", error });
  }
};

//Obtener TipoServicioEstacion por id

const getTipoServicioEstacionById = async (req, res) => {
  try {
    const tipo_servicio_estacion = await TipoServicioEstacion.finByPk(
      req.params.id,
      {
        include: [
          {
            model: Estacion,
            as: "estaciones",
          },
          {
            model: TipoServicio,
            as: "tiposervicios",
          },
        ],
      },
    );

    if (!tipo_servicio_estacion)
      return res
        .status(404)
        .json({ message: "TipoServicioEstacion no encontrado" });

    res.status(200).json(tipo_servicio_estacion);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el TipoServicioEstacion" });
  }
};

// Creación de TipoServicioEstacion

const storeTipoServicioEstacion = async (req, res) => {
  try {
    const { id_estacion, id_tipo_servicio, orden } = req.body;

    const tipo_servicio_estacion = await TipoServicioEstacion.create({
      id_estacion,
      id_tipo_servicio,
      orden,
    });

    console.log(TipoServitipo_servicio_estacioncioEstacion);

    res.status(201).json(tipo_servicio_estacion);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al crear el TipoServicioEstacion", error });
  }
};

//Actualiza usuario

const updateTipoServicioEstacion = async (req, res) => {
  try {
    const { id_estacion, id_tipo_servicio, orden } = req.body;

    const tipo_servicio_estacion = await TipoServicioEstacion.findByPk(
      req.params.id,
    );
    if (!tipo_servicio_estacion)
      return res
        .status(404)
        .json({ message: "No se pudo encontrar el TipoServicioEstacion" });

    const update = await TipoServicioEstacion.update(
      { id_estacion, id_tipo_servicio, orden },
      { where: { id: req.params.id } },
    );

    if (update[0])
      return res
        .status(200)
        .json({ message: "TipoServicioEstacion actuzalido exitosamente" });

    return res
      .status(400)
      .json({ message: "No se pudo actualizar el TipoServicioEstacion" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al actualizar el TipoServicioEstacion", error });
  }
};

//Eliminar usuario

const deleteTipoServicioEstacion = async (req, res) => {
  try {
    const tipo_servicio_estacion = await TipoServicioEstacion.findByPk(
      req.params.id,
    );

    if (!tipo_servicio_estacion)
      return res
        .status(404)
        .json({ message: "No se pudo encontrar el TipoServicioEstacion" });

    await TipoServicioEstacion.destroy({ where: { id: req.params.id } });

    return res
      .status(200)
      .json({ message: "TipoServicioEstacion eliminado exitosamente" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar el TipoServicioEstacion", error });
  }
};

//Exportar modulos

module.exports = {
  getTipoServicioEstacion,
  getTipoServicioEstacionById,
  storeTipoServicioEstacion,
  updateTipoServicioEstacion,
  deleteTipoServicioEstacion,
};
