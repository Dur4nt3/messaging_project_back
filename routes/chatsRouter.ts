import { Router } from 'express';

import jwtAuthMiddleware from '../auth/jwtAuthMiddleware';
import checkBlacklist from '../auth/checkBlacklist';

import controllerGetPrivateChat from '../controllers/chats/controllerGetPrivateChat';
import controllerGetAllChats from '../controllers/chats/controllerGetAllChats';
import controllerGetAllChatMessages from '../controllers/chats/controllerGetAllChatMessages';

import controllerPostNewPrivateChat from '../controllers/chats/controllerPostNewPrivateChat';
import controllerPostSendMessage from '../controllers/chats/controllerPostSendMessage';

import controllerPatchChat from '../controllers/chats/controllerPatchChat';

const chatsRouter = Router();

// To be used solely as an initial pull for the dashboard
// Chat data IS NOT pulled all at once
chatsRouter.get('/', jwtAuthMiddleware, checkBlacklist, controllerGetAllChats);

// Get a private
// Returns 200 whether or not it exists
// As long as the request is valid
chatsRouter.get(
    '/:userId',
    jwtAuthMiddleware,
    checkBlacklist,
    controllerGetPrivateChat,
);

// Create and retrieve a new private chat
chatsRouter.post(
    '/:userId',
    jwtAuthMiddleware,
    checkBlacklist,
    controllerPostNewPrivateChat,
);

// Update chat
// Currently only for visibility, but route accommodates any chat-related change
chatsRouter.patch(
    '/:chatId',
    jwtAuthMiddleware,
    checkBlacklist,
    controllerPatchChat,
);

// Get chat messages
chatsRouter.get(
    '/:chatId/messages',
    jwtAuthMiddleware,
    checkBlacklist,
    controllerGetAllChatMessages,
);

// Send chat message
chatsRouter.post(
    '/:chatId/messages',
    jwtAuthMiddleware,
    checkBlacklist,
    controllerPostSendMessage,
);

export default chatsRouter;
