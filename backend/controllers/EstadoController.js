const { Estado } = require('../models');

//Obtener Estado

const getEstado = async (req, res) => {
    try {
        const estados = await Estado.findAll();

        res.status(200).json(estados);

    } catch (error) {
         res.status(500).json({message: 'Error al obetener los Estado', error});
    }
}

//Obtener Estado por id

const getEstadoById = async (req, res) => {
    try {
        const estados = await Estado.finByPk(req.params.id);

        if (!estados) return res.status(404).json({message: "Estado no encontrado"});

        res.status(200).json(estados);

    } catch (error) {

        res.status(500).json({error:"Error al obtener el Estado"})
    }
}

// Creación de Estado

const storeEstado = async (req, res) => {
    try {
        const { estado } = req.body;

        const estados = await Estado.create({ estado });

        console.log(estados);

        res.status(201).json(estados)

    } catch (error) {
        res.status(500).json({error: "Error al crear el Estado", error});
    }
}

//Actualiza usuario

const updateEstado = async (req, res) => {
    try {
        const { estado } = req.body;

        const estados = await Estado.findByPk(req.params.id);
        if (!estados) return res.status(404).json({ message: "No se pudo encontrar el Estado" });

        const update = await Estado.update(
            { estado },
            { where: { id: req.params.id }}
        );

        if (update[0]) return res.status(200).json({ message: "Estado actuzalido exitosamente"});

        return res.status(400).json({ message: "No se pudo actualizar el Estado" });

    } catch (error) {
        res.status(500).json({error: "Error al actualizar el Estado", error});
    }
}

//Eliminar usuario 

const deleteEstado = async (req, res) => {
    try {
        const estados = await Estado.findByPk(req.params.id);

        if (!estados) return res.status(404).json({ message: "No se pudo encontrar el Estado"});

        await Estado.destroy({ where: { id: req.params.id } });

        return res.status(200).json({ message: "Estado eliminado exitosamente" });

    } catch (error) {
        res.status(500).json({error: "Error al eliminar el Estado", error});
    }
}

//Exportar modulos

module.exports = {
    getEstado,
    getEstadoById,
    storeEstado,
    updateEstado,
    deleteEstado
};