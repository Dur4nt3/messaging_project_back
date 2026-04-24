import type { Request, Response } from 'express';
import {
    error401,
    error500,
    error400,
} from '../utilities/misc/serverResponses';

import { findPrivateChat } from '../../db/queries/chat/chatQueries';
import { insertChat } from '../../db/queries/chat/chatMutations';
import { insertChatParticipants } from '../../db/queries/chatParticipant/chatParticipantMutations';

export default async function controllerPostNewPrivateChat(
    req: Request,
    res: Response,
) {
    const isAuthenticated = !!req.user;

    if (!isAuthenticated || req.user === undefined) {
        return error401(res);
    }

    const { userId } = req.params;

    if (!userId || Number.isNaN(Number(userId))) {
        return error400(res, 'Invalid request URL!');
    }

    const chatAlreadyExists = await findPrivateChat(
        req.user.userId,
        Number(userId),
    );
    if (chatAlreadyExists !== null) {
        return error400(res, 'Private chat already exists!');
    }

    const chat = await insertChat();

    if (chat === null) {
        return error500(res);
    }

    const participantsAdded = await insertChatParticipants(
        [req.user.userId, Number(userId)],
        chat.chatId,
    );

    if (!participantsAdded) {
        return error500(res);
    }

    return res.json({ success: true, chat });
}
