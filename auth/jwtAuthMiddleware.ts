import passport from 'passport';

import type { Request, Response } from 'express';

export default function jwtAuthMiddleware(
    req: Request,
    res: Response,
    next: any,
): void {
    passport.authenticate(
        'jwt',
        { session: false },
        (err: Error | null, user: any) => {
            if (err) {
                return next(err);
            }

            if (user) {
                req.user = user;
            }

            next();
        },
    )(req, res, next);
}
