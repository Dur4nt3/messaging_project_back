import { prisma } from '../../../lib/prisma';
import logError from '../../utilities/logError';

import type ChatMessage from '../../../types/ChatMessage';

export async function getChatMessages(
    chatId: number,
    fromMessageId: number | null = null,
    toMessageId: number | null = null,
    limit: number = 50,
): Promise<ChatMessage[] | null> {
    try {
        const messages = await prisma.message.findMany({
            where: {
                chatId,
                messageId: {
                    lt: toMessageId ?? undefined,
                    gt: fromMessageId ?? 0,
                },
            },
            orderBy: {
                sentAt: 'desc',
            },
            take: limit,
            include: {
                sender: {
                    select: {
                        username: true,
                        name: true,
                    },
                },
                chat: {
                    select: {
                        isGroup: true,
                    },
                },
            },
        });

        return messages.reverse();
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

export async function areThereAdditionalMessages(
    chatId: number,
    currentOldestMessageId: number,
) {
    try {
        const additionalMessages = await prisma.message.findFirst({
            where: {
                chatId,
                messageId: {
                    lt: currentOldestMessageId,
                },
            },
        });

        return additionalMessages !== null
    } catch (error) {
        logError(
            'Error occurred when attempting to determine message count',
            error,
        );
        return false;
    }
}
