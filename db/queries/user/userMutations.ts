import { prisma } from '../../../lib/prisma';
import logError from '../../utilities/logError';

export async function insertUser(
    username: string,
    name: string,
    passwordHash: string,
) {
    try {
        const user = await prisma.user.create({
            data: {
                username,
                type: 'HUMAN',
                name,
                password: passwordHash,
            },
        });

        return user;
    } catch (error) {
        logError('Error occurred when attempting to insert user', error);
        return null;
    }
}

export async function deleteUser(userId: number) {
    try {
        await prisma.user.delete({
            where: {
                userId,
            },
        });

        return true;
    } catch (error) {
        logError('Error occurred when attempting to delete user', error);
        return false;
    }
}
