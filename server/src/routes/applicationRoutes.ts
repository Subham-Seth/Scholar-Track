import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../controllers/applicationController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getApplications);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

export default router;
