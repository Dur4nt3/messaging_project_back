import type { Request, Response } from 'express';

import getStringQueryParams from '../utilities/query/getStringQueryParams';

import getFriendshipsBasedOnQuery from '../utilities/query/getFriendshipsBasedOnQuery';

import { error401, error500 } from '../utilities/misc/serverResponses';

export default async function controllerGetFriendships(
    req: Request,
    res: Response,
) {
    const isAuthenticated = !!req.user;

    if (!isAuthenticated || req.user === undefined) {
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
