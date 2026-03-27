import type { Request, Response } from 'express';

import { matchedData, validationResult } from 'express-validator';

import validateSignup from '../utilities/validation/validateSignup';
import { generatePassword } from '../../auth/passwordUtils';
import { insertUser } from '../../db/queries/userQueries';
import {
    error400ExpressValidator,
    error500,
} from '../utilities/misc/serverResponses';

const controllerPostSignup: any[] = [
    validateSignup,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return error400ExpressValidator(res, errors);
        }

        const { username, name, password } = matchedData(req);
        const passwordHash = await generatePassword(password);

        const creationSuccess = await insertUser(username, name, passwordHash);
        if (!creationSuccess) {
            return error500(res);
        }

        return res.json({
            success: true,
            message: 'User created',
        });
    },
];

export default controllerPostSignup;
