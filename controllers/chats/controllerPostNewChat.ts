import type { Request, Response } from 'express';
import {
    error401,
    error500,
    error400,
} from '../utilities/misc/serverResponses';
import { insertChat } from '../../db/queries/chat/chatMutations';

export default async function controllerPostNewChat(
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

    const chat = await insertChat();

    if (chat === null) {
        return error500(res);
    }

    return res.json({ success: true, chat });
}
