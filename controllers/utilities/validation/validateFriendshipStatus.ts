import { body } from 'express-validator';
import { FriendshipStatus } from '../../../generated/prisma/enums';

const validStatus = Object.keys(FriendshipStatus);

const validateFriendshipStatus = [
    body('status')
        .trim()
        .notEmpty()
        .withMessage('You must specify a status')
        .bail()
        .isIn(validStatus)
        .withMessage('Status invalid'),
];

export default validateFriendshipStatus;
