import { Router } from 'express';

import jwtAuthMiddleware from '../auth/jwtAuthMiddleware';

import controllerGetOwnInfo from '../controllers/users/controllerGetOwnInfo';

import controllerPostSignup from '../controllers/users/controllerPostSignup';
import controllerPostFriendRequest from '../controllers/users/controllerPostFriendRequest';

import controllerPatchFriendship from '../controllers/users/controllerPatchFriendship';

import controllerDeleteFriendship from '../controllers/users/controllerDeleteFriendship';

const usersRouter = Router();

// Get own user info
usersRouter.get('/me', jwtAuthMiddleware, controllerGetOwnInfo);

// Signup
usersRouter.post('/', controllerPostSignup);

// Send friend request
usersRouter.post(
    '/friendships/:userId',
    jwtAuthMiddleware,
    controllerPostFriendRequest,
);

// Update friendship status
usersRouter.patch(
    '/friendships/:userId',
    jwtAuthMiddleware,
    controllerPatchFriendship,
);

// Delete friendship
usersRouter.delete(
    '/friendships/:userId',
    jwtAuthMiddleware,
    controllerDeleteFriendship,
);

export default usersRouter;
