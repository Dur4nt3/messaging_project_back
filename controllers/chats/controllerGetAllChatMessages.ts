import type { Request, Response } from 'express';
import {
    error400,
    error401,
    error500,
} from '../utilities/misc/serverResponses';

import { getChatMessages } from '../../db/queries/message/messageQueries';

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

    const messages = await getChatMessages(Number(chatId), 50);
    if (messages === null) {
        return error500(res);
    }

    return res.json({
        success: true,
        data: messages,
    });
}
