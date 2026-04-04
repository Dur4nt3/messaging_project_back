import type { Response } from 'express';
import { error500 } from './serverResponses';

export function return500OrBlank200(value: any, res: Response) {
    if (!value) {
        return error500(res);
    }
    return res.json({
        success: true,
    });
}
