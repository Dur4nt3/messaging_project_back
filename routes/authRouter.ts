import { Router } from 'express';

import jwtAuthMiddleware from '../auth/jwtAuthMiddleware';

import controllerPostToken from '../controllers/auth/controllerPostToken';
import controllerGetToken from '../controllers/auth/controllerGetToken';

const authRouter = Router();

// Login
authRouter.post('/token', controllerPostToken);

// Check authentication
authRouter.get('/token', jwtAuthMiddleware, controllerGetToken);

export default authRouter;
