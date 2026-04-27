const express = require('express');
const {
    getReportes,
    getReportesById,
    storeReportes,
    updateReportes,
    deleteReportes
} = require('../controllers/ReportesController');

const router = express.Router();

// Rutas 
router
    .route('/')
    .get(getReportes) 
    .post(storeReportes); 

router
    .route('/:id')
    .get(getReportesById) 
    .put(updateReportes) 
    .delete(deleteReportes); 

module.exports = router;