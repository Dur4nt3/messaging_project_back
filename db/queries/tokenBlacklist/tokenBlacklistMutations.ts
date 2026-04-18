import { prisma } from '../../../lib/prisma';
import logError from '../../utilities/logError';

export async function blacklistToken(token: string, expiresAt: Date) {
    try {
        await prisma.tokenBlacklist.create({
            data: {
                token,
                expiresAt,
            },
        });

        return true;
    } catch (error) {
        logError('Error occurred when attempting to insert token', error);
        return false;
    }
}
