import express from 'express';
import salesController from '../controllers/salesController.js';

const router = express.Router();

router.get('/', salesController.getSales);
router.get('/metrics', salesController.getMetrics);
router.get('/filter-options', salesController.getFilterOptions);

export default router;

