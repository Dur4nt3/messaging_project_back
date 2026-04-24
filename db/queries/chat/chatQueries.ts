import { prisma } from '../../../lib/prisma';
import logError from '../../utilities/logError';

import type BotChat from '../../../types/BotChat';

export async function getChat(chatId: number) {
    try {
        const chat = await prisma.chat.findUnique({
            where: {
                chatId,
            },
            include: {
                chatParticipants: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        return chat;
    } catch (error) {
        logError('Error occurred when attempting to get chat', error);
        return null;
    }
}

export async function findPrivateChat(
    participant1Id: number,
    participant2Id: number,
) {
    try {
        const chat = await prisma.chat.findFirst({
            where: {
                isGroup: false,
                chatParticipants: {
                    every: {
                        userId: { in: [participant1Id, participant2Id] },
                    },
                },
                AND: [
                    // This is just extra security
                    // It ensures the result 100% includes a chat that has BOTH participants
                    { chatParticipants: { some: { userId: participant1Id } } },
                    { chatParticipants: { some: { userId: participant2Id } } },
                ],
            },
        });

        return chat;
    } catch (error) {
        logError('Error occurred when attempting to find private chat', error);
        return false;
    }
}

export async function getLatestActiveChats(userId: number) {
    try {
        const chats = await prisma.chat.findMany({
            where: {
                chatParticipants: {
                    some: {
                        userId,
                        visible: true,
                    },
                },
            },
            orderBy: {
                lastMessageAt: 'desc',
            },
            include: {
                messages: {
                    orderBy: {
                        sentAt: 'desc',
                    },
                    take: 1,
                },
                chatParticipants: {
                    select: {
                        lastReadAt: true,
                        user: {
                            select: {
                                userId: true,
                                username: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return chats;
    } catch (error) {
        logError('Error occurred when attempting to get chat data', error);
        return null;
    }
}

export async function getBotChat(chatId: number): Promise<BotChat | null> {
    try {
        const chat = await prisma.chat.findFirst({
            where: {
                chatId,
                isGroup: false,
                chatParticipants: {
                    some: {
                        user: {
                            type: 'BOT',
                        },
                    },
                },
            },
            include: {
                chatParticipants: {
                    where: {
                        user: {
                            type: 'BOT',
                        },
                    },
                    include: {
                        user: true,
                    },
                },
            },
        });

        return chat;
    } catch (error) {
        logError('Error occurred when getting bot chat', error);
        return null;
    }
}
