import { Router } from 'express';

import jwtAuthMiddleware from '../auth/jwtAuthMiddleware';

import controllerGetAllChats from '../controllers/chats/controllerGetAllChats';
import controllerGetAllChatMessages from '../controllers/chats/controllerGetAllChatMessages';

import controllerPostNewChat from '../controllers/chats/controllerPostNewChat';

import controllerPatchChat from '../controllers/chats/controllerPatchChat';

const chatsRouter = Router();

// To be used solely as an initial pull for the dashboard
// Chat data IS NOT pulled all at once
chatsRouter.get('/', jwtAuthMiddleware, controllerGetAllChats);

// Create and retrieve a new private chat
chatsRouter.post('/:userId', jwtAuthMiddleware, controllerPostNewChat);

// Update chat
// Currently only for visibility, but route accommodates any chat-related change
chatsRouter.patch('/:chatId', jwtAuthMiddleware, controllerPatchChat);

// Get chat messages
chatsRouter.get(
    '/:chatId/messages',
    jwtAuthMiddleware,
    controllerGetAllChatMessages,
);

// Send chat message
chatsRouter.post('/chatId/messages', jwtAuthMiddleware)

export default chatsRouter;
