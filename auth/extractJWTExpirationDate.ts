import jwt from 'jsonwebtoken';

// Assume the token is a bearer token
// I.e.: "Bearer ${JWT}"
export default function extractJWTExpirationDate(token: string) {
    const [, rawJwt] = token.split(' ');

    const decoded = jwt.decode(rawJwt, { complete: true });

    const week = 7 * 24 * 60 * 60 * 1000;

    if (typeof decoded?.payload !== 'string') {
        const expDate = decoded?.payload?.exp;

        // Fallback, blacklist the token for a week
        if (!expDate) {
            return new Date(Date.now() + week);
        }

        return new Date(expDate * 1000);
    }

    return new Date(Date.now() + week);
}
