const express = require('express');
const {
    getTipoServicioEstacion,
    getTipoServicioEstacionById,
    storeTipoServicioEstacion,
    updateTipoServicioEstacion,
    deleteTipoServicioEstacion
} = require('../controllers/TipoServicioEstacionController');

const router = express.Router();

// Rutas 
router
    .route('/')
    .get(getTipoServicioEstacion) 
    .post(storeTipoServicioEstacion); 

router
    .route('/:id')
    .get(getTipoServicioEstacionById) 
    .put(updateTipoServicioEstacion) 
    .delete(deleteTipoServicioEstacion); 

module.exports = router;