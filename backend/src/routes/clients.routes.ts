import { Router } from 'express';
import {
  listClients,
  createClient,
  getClient,
  updateClient,
  deleteClient,
} from '../controllers/clients.controller';

const router = Router();

router.get('/', listClients);
router.post('/', createClient);
router.get('/:id', getClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
