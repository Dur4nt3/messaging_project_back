import { prisma } from '../../lib/prisma';

import logError from '../utilities/logError';

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

export async function insertUser(
    username: string,
    name: string,
    passwordHash: string,
) {
    try {
        await prisma.user.create({
            data: {
                username,
                name,
                password: passwordHash,
            },
        });

        return true;
    } catch (error) {
        logError('Error occurred when attempting to insert user', error);
        return false;
    }
}
