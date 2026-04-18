import type { Request, Response } from 'express';

import extractJWTExpirationDate from '../../auth/extractJWTExpirationDate';

import { blacklistToken } from '../../db/queries/tokenBlacklist/tokenBlacklistMutations';

import { error401 } from '../utilities/misc/serverResponses';

export default async function controllerDeleteToken(
    req: Request,
    res: Response,
) {
    const isAuthenticated = !!req.user;

    if (!isAuthenticated || req.user === undefined) {
        return error401(res);
    }

    const token = req.headers.authorization;
    if (!token) {
        return error401(res);
    }

    const jwtExpirationDate = extractJWTExpirationDate(token);

    // Returning an error here isn't conducive to anything
    // Perform the operation and return a response
    await blacklistToken(token, jwtExpirationDate);

    return res.json({
        success: true,
    });
}
