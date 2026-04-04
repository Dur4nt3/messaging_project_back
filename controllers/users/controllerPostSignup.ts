import type { Request, Response } from 'express';

import { matchedData, validationResult } from 'express-validator';

import validateSignup from '../utilities/validation/validateSignup';
import { generatePassword } from '../../auth/passwordUtils';

import { insertUser, deleteUser } from '../../db/queries/user/userMutations';

import initializeUser from '../utilities/initialization/initializeUser';

import {
    error400ExpressValidator,
    error500,
} from '../utilities/misc/serverResponses';

const controllerPostSignup: any[] = [
    validateSignup,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return error400ExpressValidator(res, errors.array());
        }

        const { username, name, password } = matchedData(req);
        const passwordHash = await generatePassword(password);

        const createdUser = await insertUser(username, name, passwordHash);
        if (createdUser === null) {
            return error500(res);
        }

        const initialized = await initializeUser(createdUser);
        if (!initialized) {
            await deleteUser(createdUser.userId);
            return error500(res);
        }

        return res.json({
            success: true,
            message: 'User created',
        });
    },
];

export default controllerPostSignup;
