import { Router } from 'express';
import {
  getScholarships,
  getScholarshipById,
  getFilterMeta,
} from '../controllers/scholarshipController.js';

const router = Router();

router.get('/', getScholarships);
router.get('/meta/filters', getFilterMeta);
router.get('/:id', getScholarshipById);

export default router;
