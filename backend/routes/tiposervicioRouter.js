const express = require('express');
const {
    getTipoServicio,
    getTipoServicioById,
    storeTipoServicio,
    updateTipoServicio,
    deleteTipoServicio
} = require('../controllers/TipoServicioController');

const router = express.Router();

// Rutas 
router
    .route('/')
    .get(getTipoServicio) 
    .post(storeTipoServicio); 

router
    .route('/:id')
    .get(getTipoServicioById) 
    .put(updateTipoServicio) 
    .delete(deleteTipoServicio); 

module.exports = router;