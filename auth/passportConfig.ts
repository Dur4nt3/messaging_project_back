import type { Request } from 'express';

import passport from 'passport';
import {
    Strategy as JwtStrategy,
    StrategyOptionsWithoutRequest,
    ExtractJwt
} from 'passport-jwt';

import { getPublicKey } from './getRSAKey';

import { getUserById } from '../db/queries/user/userQueries';

const PUBLIC_KEY = getPublicKey();

if (PUBLIC_KEY === undefined) {
    throw new Error('Public key not defined');
}

async function verifyCallback(payload: any, done: any) {
    try {
        const user = await getUserById(payload.sub);

        if (user === null) {
            return done(null, false);
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}

const options: StrategyOptionsWithoutRequest = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUBLIC_KEY,
    algorithms: ['RS256'],
};

const strategy = new JwtStrategy(options, verifyCallback);

passport.use(strategy);
