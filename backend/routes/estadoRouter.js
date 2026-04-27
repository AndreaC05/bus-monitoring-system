const express = require('express');
const {
    getEstado,
    getEstadoById,
    storeEstado,
    updateEstado,
    deleteEstado
} = require('../controllers/EstadoController');

const router = express.Router();

// Rutas 
router
    .route('/')
    .get(getEstado) 
    .post(storeEstado); 

router
    .route('/:id')
    .get(getEstadoById) 
    .put(updateEstado) 
    .delete(deleteEstado); 

module.exports = router;