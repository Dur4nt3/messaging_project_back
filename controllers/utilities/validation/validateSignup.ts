import { body } from 'express-validator';

import identifierStringValidation from './identifierStringValidation';
import { getUserByUsername } from '../../../db/queries/userQueries';

const emptyErr = 'must not be empty';

const validateSignup = [
    identifierStringValidation({
        targetField: 'username',
        targetEntity: 'Username',
        regex: /^[a-z0-9]+$/,
        minLength: 3,
        maxLength: 30,
    }).custom(async (username) => {
        const userWithUsername = await getUserByUsername(username);
        if (userWithUsername !== null) {
            throw new Error('Username already exists');
        }
        return true;
    }),

    identifierStringValidation({
        targetField: 'name',
        targetEntity: 'Name',
        regex: /^[A-Za-z0-9 ]+$/,
        minLength: 3,
        maxLength: 30,
        errorMsg: 'must only contain letters and numbers',
    }),

    body('password')
        .notEmpty()
        .withMessage(`Password ${emptyErr}`)
        .bail()
        .isLength({ min: 8, max: 30 })
        .withMessage('Password must be between 8 and 30 characters'),

    body('cpassword')
        .notEmpty()
        .withMessage('Please verify your password')
        .bail()
        .custom((cpassword, { req }) => {
            if (cpassword !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
];

export default validateSignup;
