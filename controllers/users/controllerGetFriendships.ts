import type { Request, Response } from 'express';

import getStringQueryParams from '../utilities/query/getStringQueryParams';

import getFriendshipsBasedOnQuery from '../utilities/query/getFriendshipsBasedOnQuery';

import { error401, error500 } from '../utilities/misc/serverResponses';

import isUserAuthenticated from '../utilities/authentication/isUserAuthenticated';

export default async function controllerGetFriendships(
    req: Request,
    res: Response,
) {
    if (!isUserAuthenticated(req.user)) {
        return error401(res);
    }

    const status = getStringQueryParams(req.query.status);
    const startsWith = getStringQueryParams(req.query.startsWith);

    const friendships = await getFriendshipsBasedOnQuery(
        req.user.userId,
        status,
        startsWith,
    );

    if (friendships === null) {
        return error500(res);
    }

    return res.json({
        success: true,
        friendships,
    });
}
