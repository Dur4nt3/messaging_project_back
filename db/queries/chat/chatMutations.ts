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
