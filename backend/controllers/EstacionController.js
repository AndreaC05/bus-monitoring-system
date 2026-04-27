const { Estacion, TipoServicioEstacion, TipoServicio } = require('../models');

//Obtener Estacion

const getEstacion = async (req, res) => {
    try {
        const estacion = await Estacion.findAll({
            include: [
                {
                    model: TipoServicioEstacion,
                    as: "tiposerviciosestaciones",
                    include: [
                        {
                            model: TipoServicio,
                            as: "tiposervicios"
                        }
                    ]
                }
            ]
        });

        res.status(200).json(estacion);

    } catch (error) {
         res.status(500).json({message: 'Error al obetener los Estacion', error});
    }
}

//Obtener Estacion por id

const getEstacionById = async (req, res) => {
    try {
        const estacion = await Estacion.finByPk(req.params.id, {
            include: [
                {
                    model: TipoServicioEstacion,
                    as: "tiposerviciosestaciones",
                    include: [
                        {
                            model: TipoServicio,
                            as: "tiposervicios"
                        }
                    ]
                }
            ]
        });

        if (!estacion) return res.status(404).json({message: "Estacion no encontrado"});

        res.status(200).json(estacion);

    } catch (error) {

        res.status(500).json({error:"Error al obtener el Estacion"})
    }
}

// Creación de Estacion

const storeEstacion = async (req, res) => {
    try {
        const { estaciones, latitud_estacion, longitud_estacion } = req.body;

        const estacion = await Estacion.create({ estaciones, latitud_estacion, longitud_estacion });

        console.log(estacion);

        res.status(201).json(estacion)

    } catch (error) {
        res.status(500).json({error: "Error al crear el Estacion", error});
    }
}

//Actualiza usuario

const updateEstacion = async (req, res) => {
    try {
        const { estaciones, latitud_estacion, longitud_estacion } = req.body;

        const estacion = await Estacion.findByPk(req.params.id);
        if (!estacion) return res.status(404).json({ message: "No se pudo encontrar el Estacion" });

        const update = await Estacion.update(
            { estaciones, latitud_estacion, longitud_estacion },
            { where: { id: req.params.id }}
        );

        if (update[0]) return res.status(200).json({ message: "Estacion actuzalido exitosamente"});

        return res.status(400).json({ message: "No se pudo actualizar el Estacion" });

    } catch (error) {
        res.status(500).json({error: "Error al actualizar el Estacion", error});
    }
}

//Eliminar usuario 

const deleteEstacion = async (req, res) => {
    try {
        const estacion = await Estacion.findByPk(req.params.id);
        if (!estacion) return res.status(404).json({ message: "No se pudo encontrar el Estacion" });

        // Primero elimina los registros relacionados
        await TipoServicioEstacion.destroy({ where: { id_estacion: req.params.id } });

        // Luego elimina la estación
        await Estacion.destroy({ where: { id: req.params.id } });

        return res.status(200).json({ message: "Estacion eliminado exitosamente" });
    } catch (error) {
        console.log("ERROR DETALLE:", error.message);
        res.status(500).json({ error: "Error al eliminar el Estacion", detalle: error.message });
    }
}

//Exportar modulos

module.exports = {
    getEstacion,
    getEstacionById,
    storeEstacion,
    updateEstacion,
    deleteEstacion
};