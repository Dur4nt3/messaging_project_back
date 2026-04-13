import { prisma } from '../../../lib/prisma';
import logError from '../../utilities/logError';

export async function getUserByUsername(username: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username,
            },
        });

        return user;
    } catch (error) {
        logError(
            'Error occurred when attempting to get user by username',
            error,
        );
        return null;
    }
}

export async function getUserById(userId: number) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                userId,
            },
        });

        return user;
    } catch (error) {
        logError('Error occurred when attempting to get user by id', error);
        return null;
    }
}

export async function getAllUsersRedacted() {
    try {
        const users = await prisma.user.findMany({
            select: {
                userId: true,
                username: true,
                type: true,
            },
        });

        return users;
    } catch (error) {
        logError('Error occurred when attempting to get user by id', error);
        return [];
    }
}

export async function isUserBot(userId: number) {
    try {
        const user = await prisma.user.findFirst({
            where: {
                userId,
                type: 'BOT',
            },
        });

        return user !== null;
    } catch (error) {
        logError('Error occurred when attempting to get user by id', error);
        return null;
    }
}
