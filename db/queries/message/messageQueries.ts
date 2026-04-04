import { prisma } from '../../../lib/prisma';
import logError from '../../utilities/logError';

export async function getChatMessages(chatId: number, limit: number = 50) {
    try {
        const messages = await prisma.message.findMany({
            where: {
                chatId,
            },
            orderBy: {
                sentAt: 'desc',
            },
            take: limit,
        });

        return messages;
    } catch (error) {
        logError('Error occurred when attempting to get messages', error);
        return null;
    }
}

export async function getChatMessagesSentByUser(
    chatId: number,
    userId: number,
    limit: number = 50,
) {
    try {
        const messages = await prisma.message.findMany({
            where: {
                chatId,
                senderId: userId,
            },
            orderBy: {
                sentAt: 'desc',
            },
            take: limit,
        });

        return messages;
    } catch (error) {
        logError('Error occurred when attempting to get messages', error);
        return null;
    }
}

export async function getUnreadCount(
    chatId: number,
    currentUserId: number,
    lastReadAt: Date | null,
) {
    try {
        const unreadCount = await prisma.message.count({
            where: {
                chatId,
                senderId: {
                    not: currentUserId,
                },
                sentAt: {
                    gt: lastReadAt ?? new Date(),
                },
            },
        });

        return unreadCount;
    } catch (error) {
        logError('Error occurred when attempting to get unread count', error);
        return null;
    }
}
