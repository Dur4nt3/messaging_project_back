import type { Request, Response } from 'express';
import { error401, error500 } from '../utilities/misc/serverResponses';

import getDashboardViewChatData from '../utilities/formatters/getDashboardViewChatData';

import isUserAuthenticated from '../utilities/authentication/isUserAuthenticated';

export default async function controllerGetAllChats(
    req: Request,
    res: Response,
) {
    if (!isUserAuthenticated(req.user)) {
        return error401(res);
    }

    const chatData = await getDashboardViewChatData(req.user.userId);

    if (chatData === null) {
        return error500(res);
    }

    return res.json({ success: true, data: chatData });
}
