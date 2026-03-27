import { body } from 'express-validator';

import type IdentifierValidationRequirements from '../../../types/IdentifierValidationRequirements';

const alphaNumericError =
    'must only contain letters and numbers (lowercase only)';

export default function identifierStringValidation(
    validationData: IdentifierValidationRequirements,
) {
    return body(validationData.targetField)
        .trim()
        .notEmpty()
        .withMessage(`${validationData.targetEntity} must not be empty`)
        .bail()
        .matches(validationData.regex)
        .withMessage(
            `${validationData.targetEntity} ${validationData.errorMsg !== undefined ? validationData.errorMsg : alphaNumericError}`,
        )
        .bail()
        .isLength({
            min: validationData.minLength,
            max: validationData.maxLength,
        })
        .withMessage(
            `${validationData.targetEntity} must be between ${validationData.minLength} and ${validationData.maxLength} characters`,
        );
}
