import type { Request, Response } from 'express';

import { getUserByUsername } from '../../db/queries/user/userQueries';
import { validatePassword } from '../../auth/passwordUtils';
import { errorCustom } from '../utilities/misc/serverResponses';
import issueJWT from '../../auth/issueJWT';

export default async function controllerPostToken(req: Request, res: Response) {
    const { username, password } = req.body;

    const user = await getUserByUsername(username);

    if (user === null || user.type !== 'HUMAN' || user.password === null) {
        return errorCustom(res, 401, 'Invalid credentials');
    }

    const passwordValid = await validatePassword(password, user.password);

    if (!passwordValid) {
        return errorCustom(res, 401, 'Invalid credentials');
    }

    const jwt = issueJWT(user);

    return res.json({
        success: true,
        token: jwt.token,
    });
}
