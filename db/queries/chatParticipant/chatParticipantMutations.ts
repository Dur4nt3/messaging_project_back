import { prisma } from '../../../lib/prisma';
import logError from '../../utilities/logError';

// lastReadAt is useful when you don't want the default null value
// This allows to choose whether the user will have unread messages upon entering a chat
export async function insertChatParticipants(
    userIds: number[],
    chatId: number,
    lastReadAt: null | Date = null,
) {
    try {
        await Promise.all(
            userIds.map((userId) =>
                prisma.chatParticipant.create({
                    data: {
                        userId,
                        chatId,
                        lastReadAt,
                    },
                }),
            ),
        );

        return true;
    } catch (error) {
        logError(
            'Error occurred when attempting to insert chat participants',
            error,
        );
        return false;
    }
}

export async function updateChatVisibility(
    chatId: number,
    userId: number,
    currentVisibility: boolean,
) {
    try {
        await prisma.chatParticipant.update({
            where: {
                chatId_userId: {
                    chatId,
                    userId,
                },
            },
            data: {
                visible: !currentVisibility,
            },
        });

        return true;
    } catch (error) {
        logError(
            'Error occurred when attempting to update chat visibility',
            error,
        );
        return false;
    }
}

export async function updateLastReadAt(chatId: number, userId: number) {
    try {
        await prisma.chatParticipant.update({
            where: {
                chatId_userId: {
                    chatId,
                    userId,
                },
            },
            data: {
                lastReadAt: new Date(),
            },
        });

        return true;
    } catch (error) {
        logError(
            'Error occurred when attempting to update last read time',
            error,
        );
        return false;
    }
}
