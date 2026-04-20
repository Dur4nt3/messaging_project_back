import type { Request, Response } from 'express';

import validateFriendshipStatus from '../utilities/validation/validateFriendshipStatus';
import { matchedData, validationResult } from 'express-validator';

import { getFriendship } from '../../db/queries/friendship/friendshipQueries';
import { updateFriendship } from '../../db/queries/friendship/friendshipMutations';

import {
    error400ExpressValidator,
    error401,
    error400,
    error500,
    error403,
} from '../utilities/misc/serverResponses';
import { return500OrBlank200 } from '../utilities/misc/responseBranching';

const controllerPatchFriendship: any[] = [
    validateFriendshipStatus,
    async (req: Request, res: Response) => {
        const isAuthenticated = !!req.user;

        if (!isAuthenticated || req.user === undefined) {
            return error401(res);
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return error400ExpressValidator(res, errors.array());
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

        const { status } = matchedData(req);

        // You cannot accept a friendship request YOU SENT
        if (friendship.senderId === req.user.userId && status === 'ACCEPTED') {
            return error500(res);
        }

        const updated = await updateFriendship(friendship.friendshipId, status);
        return return500OrBlank200(updated, res);
    },
];

export default controllerPatchFriendship;
