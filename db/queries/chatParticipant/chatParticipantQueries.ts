import { prisma } from '../../../lib/prisma';
import logError from '../../utilities/logError';

export async function getChatName(
    chatId: number,
    isGroup: boolean,
    currentUserId: number,
) {
    try {
        if (isGroup) {
            return 'PLACEHOLDER FOR GROUP NAME';
        }

        const participant = await prisma.chatParticipant.findFirst({
            where: {
                chatId,
                userId: {
                    not: currentUserId,
                },
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (participant === null) {
            return null;
        }

        return participant?.user.name;
    } catch (error) {
        logError('Error occurred when attempting to get chat name', error);
        return null;
    }
}

export async function getCurrentUserChatParticipantData(
    chatId: number,
    userId: number,
) {
    try {
        const chatParticipant = await prisma.chatParticipant.findUnique({
            where: {
                chatId_userId: {
                    chatId,
                    userId,
                },
            },
        });

        return chatParticipant;
    } catch (error) {
        logError(
            'Error occurred when attempting to get current user chat participant data',
            error,
        );
        return null;
    }
}

export async function getPrivateChatParticipants(chatId: number) {
    try {
        const participants = await prisma.chatParticipant.findMany({
            where: {
                chatId,
                chat: {
                    isGroup: false,
                },
            },
            include: {
                user: true,
            },
        });

        return participants;
    } catch (error) {
        logError(
            'Error occurred when attempting to get private chat participants',
            error,
        );
        return null;
    }
}
