import type { User } from '../generated/prisma/client';
import jsonwebtoken from 'jsonwebtoken';

import { getPrivateKey } from './getRSAKey';

const PRIVATE_KEY = getPrivateKey();

if (PRIVATE_KEY === undefined) {
    throw new Error('Private key not defined');
}

export default function issueJWT(user: User) {
    const { userId } = user;

    const expiresIn = '7d';

    const payload = {
        sub: userId,
    };

    const signedToken = jsonwebtoken.sign(payload, PRIVATE_KEY, {
        expiresIn,
        algorithm: 'RS256',
    });

    return {
        token: `Bearer ${signedToken}`,
        expires: expiresIn,
    };
}
