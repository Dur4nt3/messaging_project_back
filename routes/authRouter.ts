import { Router } from 'express';

import jwtAuthMiddleware from '../auth/jwtAuthMiddleware';
import checkBlacklist from '../auth/checkBlacklist';

import controllerGetToken from '../controllers/auth/controllerGetToken';

import controllerPostToken from '../controllers/auth/controllerPostToken';

import controllerDeleteToken from '../controllers/auth/controllerDeleteToken';

const authRouter = Router();

// Login
authRouter.post('/token', controllerPostToken);

// Check authentication
authRouter.get('/token', jwtAuthMiddleware, checkBlacklist, controllerGetToken);

// Logout
authRouter.delete('/token', jwtAuthMiddleware, checkBlacklist, controllerDeleteToken);

export default authRouter;
