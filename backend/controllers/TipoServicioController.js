const { TipoServicio } = require('../models');

//Obtener Estado

const getTipoServicio = async (req, res) => {
    try {
        const tipo_servicio = await TipoServicio.findAll();

        res.status(200).json(tipo_servicio);

    } catch (error) {
         res.status(500).json({message: 'Error al obetener los tipo_servicio', error});
    }
}

//Obtener Estado por id

const getTipoServicioById = async (req, res) => {
    try {
        const tipo_servicio = await TipoServicio.finByPk(req.params.id);

        if (!tipo_servicio) return res.status(404).json({message: "tipo_servicio no encontrado"});

        res.status(200).json(tipo_servicio);

    } catch (error) {

        res.status(500).json({error:"Error al obtener el tipo_servicio"})
    }
}

// Creación de Estado

const storeTipoServicio = async (req, res) => {
    try {
        const { tiposervicio } = req.body;

        const tipo_servicio = await TipoServicio.create({ tiposervicio });

        console.log(tipo_servicio);

        res.status(201).json(tipo_servicio)

    } catch (error) {
        res.status(500).json({error: "Error al crear el tipo_servicio", error});
    }
}

//Actualiza usuario

const updateTipoServicio = async (req, res) => {
    try {
        const { tiposervicio } = req.body;

        const tipo_servicio = await TipoServicio.findByPk(req.params.id);
        if (!tipo_servicio) return res.status(404).json({ message: "No se pudo encontrar el tipo_servicio" });

        const update = await TipoServicio.update(
            { tiposervicio },
            { where: { id: req.params.id }}
        );

        if (update[0]) return res.status(200).json({ message: "tipo_servicio actuzalido exitosamente"});

        return res.status(400).json({ message: "No se pudo actualizar el tipo_servicio" });

    } catch (error) {
        res.status(500).json({error: "Error al actualizar el tipo_servicio", error});
    }
}

//Eliminar usuario 

const deleteTipoServicio = async (req, res) => {
    try {
        const tipo_servicio = await TipoServicio.findByPk(req.params.id);

        if (!tipo_servicio) return res.status(404).json({ message: "No se pudo encontrar el tipo_servicio"});

        await TipoServicio.destroy({ where: { id: req.params.id } });

        return res.status(200).json({ message: "tipo_servicio eliminado exitosamente" });

    } catch (error) {
        res.status(500).json({error: "Error al eliminar el tipo_servicio", error});
    }
}

//Exportar modulos

module.exports = {
    getTipoServicio,
    getTipoServicioById,
    storeTipoServicio,
    updateTipoServicio,
    deleteTipoServicio
};