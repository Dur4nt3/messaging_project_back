import type { Request, Response } from 'express';
import {
    error400,
    error401,
    error500,
} from '../utilities/misc/serverResponses';

import { findPrivateChat } from '../../db/queries/chat/chatQueries';
import { updateChatVisibility } from '../../db/queries/chatParticipant/chatParticipantMutations';

import isUserAuthenticated from '../utilities/authentication/isUserAuthenticated';

export default async function controllerGetPrivateChat(
    req: Request,
    res: Response,
) {
    if (!isUserAuthenticated(req.user)) {
        return error401(res);
    }

    const { userId } = req.params;

    if (!userId || Number.isNaN(Number(userId))) {
        return error400(res, 'Invalid request URL!');
    }

    const chat = await findPrivateChat(req.user.userId, Number(userId));

    if (chat === false) {
        return error500(res);
    }

    // When fetching a chat, make it visible
    if (chat !== null) {
        await updateChatVisibility(chat.chatId, req.user.userId, false);
    }

    return res.json({
        success: true,
        chat,
    });
}
