import type { Response } from 'express';
import type { ValidationError } from 'express-validator';

export function errorCustom(
    res: Response,
    statusCode: number,
    message: string,
) {
    return res.status(statusCode).json({
        success: false,
        message,
    });
}

export function error400(res: Response, message: string) {
    return res.status(400).json({
        success: false,
        message,
    });
}

export function error400ExpressValidator(
    res: Response,
    errors: ValidationError[],
) {
    return res.status(400).json({
        success: false,
        errors,
    });
}

export function error401(res: Response) {
    return res.status(401).json({
        success: false,
        message: 'Could not validate session!',
    });
}

export function error403(res: Response) {
    return res.status(403).json({
        success: false,
        message: 'You are not allowed to perform this action',
    });
}

export function error500(res: Response) {
    return res.status(500).json({
        success: false,
        message: 'Internal server error!',
    });
}
