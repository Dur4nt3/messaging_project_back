import { body } from 'express-validator';

const validateMessage = [
    body('message')
        .trim()
        .notEmpty()
        .withMessage('Message must not be empty')
        .bail()
        .isLength({ max: 5000 })
        .withMessage('Message must not exceed 5000 characters'),
];

export default validateMessage;
