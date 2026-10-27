import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getSavedScholarships,
  saveScholarship,
  removeSavedScholarship,
} from '../controllers/savedScholarshipController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getSavedScholarships);
router.post('/', saveScholarship);
router.delete('/:id', removeSavedScholarship);

export default router;
