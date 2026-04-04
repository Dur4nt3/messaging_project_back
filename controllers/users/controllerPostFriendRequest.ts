import type { Request, Response } from 'express';

import { isUserBot } from '../../db/queries/user/userQueries';
import { getFriendship } from '../../db/queries/friendship/friendshipQueries';
import { sendFriendRequest } from '../../db/queries/friendship/friendshipMutations';

import { return500OrBlank200 } from '../utilities/misc/responseBranching';
import {
    error401,
    error400,
    error500,
    error403,
} from '../utilities/misc/serverResponses';

export default async function controllerPostFriendRequest(
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

    const friendship = await getFriendship(req.user.userId, Number(userId));
    if (friendship === false) {
        return error500(res);
    }

    if (friendship !== null) {
        return error403(res);
    }

    const isTargetBot = await isUserBot(Number(userId));
    if (isTargetBot === null) {
        return error500(res);
    }

    const friendRequest = await sendFriendRequest(
        req.user.userId,
        Number(userId),
        isTargetBot,
    );
    return return500OrBlank200(friendRequest, res);
}
