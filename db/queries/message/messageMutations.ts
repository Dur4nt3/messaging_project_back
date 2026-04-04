import { prisma } from '../../../lib/prisma';
import logError from '../../utilities/logError';

export async function insertMessage(
    senderId: number,
    content: string,
    chatId: number,
) {
    try {
        await prisma.message.create({
            data: {
                senderId,
                content,
                chatId,
            },
        });

        return true;
    } catch (error) {
        logError('Error occurred when attempting to insert message', error);
        return false;
    }
}
