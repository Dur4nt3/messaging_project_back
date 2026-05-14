import type { Request, Response } from 'express';

import { getFriendship } from '../../db/queries/friendship/friendshipQueries';

import {
    error401,
    error400,
    error500,
    error403,
} from '../utilities/misc/serverResponses';
import { deleteFriendship } from '../../db/queries/friendship/friendshipMutations';
import { return500OrBlank200 } from '../utilities/misc/responseBranching';

import isUserAuthenticated from '../utilities/authentication/isUserAuthenticated';

export default async function controllerDeleteFriendship(
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

    const friendship = await getFriendship(req.user.userId, Number(userId));
    if (friendship === false) {
        return error500(res);
    }

    if (friendship === null) {
        return error403(res);
    }

    const deleted = await deleteFriendship(friendship.friendshipId);
    return return500OrBlank200(deleted, res);
}
