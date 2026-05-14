import type { Request, Response } from 'express';

import { error401 } from '../utilities/misc/serverResponses';

import isUserAuthenticated from '../utilities/authentication/isUserAuthenticated';

export default function controllerGetOwnInfo(req: Request, res: Response) {
    if (!isUserAuthenticated(req.user)) {
        return error401(res);
    }

    return res.json({
        success: true,
        name: req.user.name,
        username: req.user.username,
    });
}
