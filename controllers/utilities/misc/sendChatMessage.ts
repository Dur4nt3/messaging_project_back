import { insertMessage } from '../../../db/queries/message/messageMutations';
import { updateLastMessageAt } from '../../../db/queries/chat/chatMutations';

export default async function sendChatMessage(
    userId: number,
    chatId: number,
    message: string,
) {
    const messageSent = await insertMessage(userId, message, chatId);
    const updatedLastMessage = await updateLastMessageAt(chatId);

    return messageSent && updatedLastMessage;
}
