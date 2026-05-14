import type { Express } from 'express';

export default function isUserAuthenticated(
    user: Express.User | undefined,
): user is Express.User {
    const authenticated = !!user;

    return authenticated;
}
