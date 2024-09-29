//  all endpoints of the API

import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import { Router } from 'express';

const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew)

export default router;
