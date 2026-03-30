import { Router } from 'express';

import jwtAuthMiddleware from '../auth/jwtAuthMiddleware';

import controllerGetOwnInfo from '../controllers/users/controllerGetOwnInfo';
import controllerPostSignup from '../controllers/users/controllerPostSignup';

const usersRouter = Router();

// Get own user info
usersRouter.get('/me', jwtAuthMiddleware, controllerGetOwnInfo);

// Signup
usersRouter.post('/', controllerPostSignup);

export default usersRouter;
