//  all endpoints of the API
import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersControllerr';
import AuthController from '../controllers/AuthControllerr';

const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);
export default router;
