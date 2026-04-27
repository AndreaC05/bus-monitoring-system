const express = require('express');
const {
    getEstacion,
    getEstacionById,
    storeEstacion,
    updateEstacion,
    deleteEstacion
} = require('../controllers/EstacionController');

const router = express.Router();

// Rutas 
router
    .route('/')
    .get(getEstacion) 
    .post(storeEstacion); 

router
    .route('/:id')
    .get(getEstacionById) 
    .put(updateEstacion) 
    .delete(deleteEstacion); 

module.exports = router;