import { prisma } from '../../../lib/prisma';
import logError from '../../utilities/logError';

export async function insertChat() {
    try {
        const chat = await prisma.chat.create({
            data: {
                lastMessageAt: new Date(),
            },
        });

        return chat;
    } catch (error) {
        logError('Error occurred when attempting to insert chat', error);
        return null;
    }
}

export async function updateLastMessageAt(chatId: number) {
    try {
        await prisma.chat.update({
            where: {
                chatId,
            },
            data: {
                lastMessageAt: new Date(),
            },
        });

        return true;
    } catch (error) {
        logError('Error occurred when attempting to update chat', error);
        return false;
    }
}
