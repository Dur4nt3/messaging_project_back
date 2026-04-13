import type { Request, Response } from 'express';

import { validationResult, matchedData } from 'express-validator';
import validateMessage from '../utilities/validation/validateMessage';

import { getChat } from '../../db/queries/chat/chatQueries';
import { getChatMessagesSentByUser } from '../../db/queries/message/messageQueries';
import { insertMessage } from '../../db/queries/message/messageMutations';
import { getPrivateChatParticipants } from '../../db/queries/chatParticipant/chatParticipantQueries';
import { areUsersFriends } from '../../db/queries/friendship/friendshipQueries';

import isChatABotChat from '../utilities/bots/isChatABotChat';
import allBots from '../utilities/bots/botSetup';
import handleBotChat from '../utilities/bots/handleBotChat';

import {
    error401,
    error400,
    error400ExpressValidator,
    error500,
    error403,
} from '../utilities/misc/serverResponses';
import { return500OrBlank200 } from '../utilities/misc/responseBranching';

const controllerPostSendMessage: any[] = [
    validateMessage,
    async (req: Request, res: Response) => {
        const isAuthenticated = !!req.user;

        if (!isAuthenticated || req.user === undefined) {
            return error401(res);
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return error400ExpressValidator(res, errors.array());
        }

        const { chatId } = req.params;
        if (!chatId || Number.isNaN(Number(chatId))) {
            return error400(res, 'Invalid request URL!');
        }

        const { message } = matchedData(req);

        const chat = await getChat(Number(chatId));
        if (chat === null) {
            return;
        }
        const botChat = isChatABotChat(chat);

        if (botChat !== false) {
            const messageSent = await insertMessage(
                req.user?.userId,
                message,
                Number(chatId),
            );
            if (!messageSent) {
                return error500(res);
            }

            const botResult = await handleBotChat(
                message,
                botChat.username,
                Number(chatId),
                req.user.userId,
                allBots,
            );
            return return500OrBlank200(botResult, res);
        }

        if (chat.isGroup) {
            const messageSent = await insertMessage(
                req.user?.userId,
                message,
                Number(chatId),
            );
            return return500OrBlank200(messageSent, res);
        }

        const participants = await getPrivateChatParticipants(Number(chatId));
        if (participants === null) {
            return error500(res);
        }

        const friends = await areUsersFriends(
            participants[0].userId,
            participants[1].userId,
        );

        if (friends === null) {
            return error500(res);
        }

        if (friends === true) {
            const messageSent = await insertMessage(
                req.user?.userId,
                message,
                Number(chatId),
            );
            return return500OrBlank200(messageSent, res);
        }

        const messageCount = await getChatMessagesSentByUser(
            Number(chatId),
            req.user.userId,
            2,
        );

        if (messageCount === null) {
            return error500(res);
        }

        if (messageCount.length > 1) {
            return error403(res);
        }
        const messageSent = await insertMessage(
            req.user?.userId,
            message,
            Number(chatId),
        );
        return return500OrBlank200(messageSent, res);
    },
];

export default controllerPostSendMessage;
