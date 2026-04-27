const express = require('express');
const {
    getBus,
    getBusById,
    storeBus,
    updateBus,
    deleteBus
} = require('../controllers/BusController');

const router = express.Router();

// Rutas 
router
    .route('/')
    .get(getBus) 
    .post(storeBus); 

router
    .route('/:id')
    .get(getBusById) 
    .put(updateBus) 
    .delete(deleteBus); 

module.exports = router;