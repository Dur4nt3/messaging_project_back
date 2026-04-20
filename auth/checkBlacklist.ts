import type { Request, Response, NextFunction } from 'express';

import { isTokenBlacklisted } from '../db/queries/tokenBlacklist/tokenBlacklistQueries';

import { error401 } from '../controllers/utilities/misc/serverResponses';

export default async function checkBlacklist(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const token = req.headers.authorization;

    // Because this middleware is ran after jwtAuthMiddleware
    // "token" will always be defined
    // This check is for TypeScript
    if (!token) {
        return error401(res);
    }

    const blacklisted = await isTokenBlacklisted(token);

    if (blacklisted) {
        return error401(res);
    }

    next();
}
