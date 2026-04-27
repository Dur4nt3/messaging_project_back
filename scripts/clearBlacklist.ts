import { prisma } from '../lib/prisma';
import logError from '../db/utilities/logError';

async function main() {
    try {
        const now = new Date();
        await prisma.tokenBlacklist.deleteMany({
            where: {
                expiresAt: {
                    lt: now,
                },
            },
        });

        console.log('removed all expired tokens from blacklist');
    } catch (error) {
        logError('Error occurred when attempting to clear blacklist', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
        process.exit();
    });
