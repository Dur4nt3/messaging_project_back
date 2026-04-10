import type { Request, Response } from 'express';
import {
    error400,
    error401,
    error500,
} from '../utilities/misc/serverResponses';

import { getChatMessages } from '../../db/queries/message/messageQueries';
import formatAllMessagesResponse from '../utilities/formatters/formatAllMessagesResponse';

export default async function controllerGetAllChatMessages(
    req: Request,
    res: Response,
) {
    const isAuthenticated = !!req.user;

    if (!isAuthenticated || req.user === undefined) {
        return error401(res);
    }

    const { chatId } = req.params;
    if (!chatId || Number.isNaN(Number(chatId))) {
        return error400(res, 'Invalid request URL!');
    }

    const { from } = req.query;
    let messages;
    if (!from) {
        messages = await getChatMessages(Number(chatId), null, 50);
    } else {
        messages = await getChatMessages(Number(chatId), Number(from), 50);
    }

    if (messages === null) {
        return error500(res);
    }

    const formattedResponse = await formatAllMessagesResponse(
        Number(chatId),
        req.user.userId,
        messages,
    );
    if (formattedResponse === null) {
        return error500(res);
    }

    return res.json({
        success: true,
        name: formattedResponse.name,
        messages: formattedResponse.messages,
    });
}
