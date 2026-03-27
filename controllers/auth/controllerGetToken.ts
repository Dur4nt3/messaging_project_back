import type { Request, Response } from 'express';

import { error401 } from '../utilities/misc/serverResponses';

export default function controllerGetToken(req: Request, res: Response) {
    const isAuthenticated = !!req.user;

    if (!isAuthenticated || req.user === undefined) {
        return error401(res);
    }

    return res.json({
        success: true,
        message: 'Successful authentication!',
    });
}
