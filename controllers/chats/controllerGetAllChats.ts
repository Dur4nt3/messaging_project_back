import type { Request, Response } from 'express';
import { error401, error500 } from '../utilities/misc/serverResponses';

import getDashboardViewChatData from '../utilities/misc/geDashboardViewChatData';

export default async function controllerGetAllChats(
    req: Request,
    res: Response,
) {
    const isAuthenticated = !!req.user;

    if (!isAuthenticated || req.user === undefined) {
        return error401(res);
    }

    const chatData = await getDashboardViewChatData(req.user.userId);

    if (chatData === null) {
        return error500(res);
    }

    return res.json({ success: true, data: chatData });
}
