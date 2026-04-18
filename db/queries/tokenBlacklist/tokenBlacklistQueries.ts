import { prisma } from '../../../lib/prisma';
import logError from '../../utilities/logError';

export async function isTokenBlacklisted(token: string) {
    try {
        const blacklisted = await prisma.tokenBlacklist.findUnique({
            where: {
                token,
            },
        });

        return blacklisted !== null;
    } catch (error) {
        logError('Error occurred when attempting to insert token', error);
        return true;
    }
}
