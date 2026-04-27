const { Bus, TipoServicio, Estado, Reportes } = require('../models');

//Obtener Bus

const getBus = async (req, res) => {
    try {
        const buses = await Bus.findAll({
            include: [
                {
                    model: TipoServicio,
                    as:"tiposervicios"
                },
                {
                    model: Estado,
                    as: "estados"
                },
                {
                    model: Reportes,
                    as: "reportes"
                }
            ]
        });

        res.status(200).json(buses);

    } catch (error) {
         res.status(500).json({message: 'Error al obetener los Bus', error});
    }
}

//Obtener Bus por id

const getBusById = async (req, res) => {
    try {
        const buses = await Bus.finByPk(req.params.id, {
            include: [
                {
                    model: TipoServicio,
                    as:"tiposervicios"
                },
                {
                    model: Estado,
                    as: "estados"
                },
                {
                    model: Reportes,
                    as: "reportes"
                }
            ]
        
        });

        if (!buses) return res.status(404).json({message: "Bus no encontrado"});

        res.status(200).json(buses);

    } catch (error) {

        res.status(500).json({error:"Error al obtener el Bus"})
    }
}

// Creación de Bus

const storeBus = async (req, res) => {
    try {
        const { codigo_bus, capacidad, id_tipo_servicio, id_estado } = req.body;

        const buses = await Bus.create({ codigo_bus, capacidad, id_tipo_servicio, id_estado });

        console.log(buses);

        res.status(201).json(buses)

    } catch (error) {
        res.status(500).json({error: "Error al crear el Bus", error});
    }
}

//Actualiza usuario

const updateBus = async (req, res) => {
    try {
        const { codigo_bus, capacidad, id_tipo_servicio, id_estado } = req.body;

        const buses = await Bus.findByPk(req.params.id);
        if (!buses) return res.status(404).json({ message: "No se pudo encontrar el Bus" });

        const update = await Bus.update(
            { codigo_bus, capacidad, id_tipo_servicio, id_estado },
            { where: { id: req.params.id }}
        );

        if (update[0]) return res.status(200).json({ message: "Bus actuzalido exitosamente"});

        return res.status(400).json({ message: "No se pudo actualizar el Bus" });

    } catch (error) {
        res.status(500).json({error: "Error al actualizar el Bus", error});
    }
}

//Eliminar usuario 

const deleteBus = async (req, res) => {
    try {
        const buses = await Bus.findByPk(req.params.id);

        if (!buses) return res.status(404).json({ message: "No se pudo encontrar el Bus"});

        await Bus.destroy({ where: { id: req.params.id } });

        return res.status(200).json({ message: "Bus eliminado exitosamente" });

    } catch (error) {
        res.status(500).json({error: "Error al eliminar el Bus", error});
    }
}

//Exportar modulos

module.exports = {
    getBus,
    getBusById,
    storeBus,
    updateBus,
    deleteBus
};