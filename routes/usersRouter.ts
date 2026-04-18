import { Router } from 'express';

import jwtAuthMiddleware from '../auth/jwtAuthMiddleware';
import checkBlacklist from '../auth/checkBlacklist';

import controllerGetOwnInfo from '../controllers/users/controllerGetOwnInfo';

import controllerPostSignup from '../controllers/users/controllerPostSignup';
import controllerPostFriendRequest from '../controllers/users/controllerPostFriendRequest';

import controllerPatchFriendship from '../controllers/users/controllerPatchFriendship';

import controllerDeleteFriendship from '../controllers/users/controllerDeleteFriendship';

const usersRouter = Router();

// Get own user info
usersRouter.get('/me', jwtAuthMiddleware, checkBlacklist, controllerGetOwnInfo);

// Signup
usersRouter.post('/', controllerPostSignup);

// Send friend request
usersRouter.post(
    '/friendships/:userId',
    jwtAuthMiddleware,
    checkBlacklist,
    controllerPostFriendRequest,
);

// Update friendship status
usersRouter.patch(
    '/friendships/:userId',
    jwtAuthMiddleware,
    checkBlacklist,
    controllerPatchFriendship,
);

// Delete friendship
usersRouter.delete(
    '/friendships/:userId',
    jwtAuthMiddleware,
    checkBlacklist,
    controllerDeleteFriendship,
);

export default usersRouter;
