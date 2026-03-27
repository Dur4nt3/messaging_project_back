import { Router } from 'express';

import jwtAuthMiddleware from '../auth/jwtAuthMiddleware';

import controllerPostSignup from '../controllers/users/controllerPostSignup';

const usersRouter = Router();

// Signup
usersRouter.post('/', controllerPostSignup);

export default usersRouter;
