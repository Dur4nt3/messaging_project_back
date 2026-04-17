import { insertMessage } from '../../../db/queries/message/messageMutations';
import { updateLastReadAt } from '../../../db/queries/chatParticipant/chatParticipantMutations';
import { updateLastMessageAt } from '../../../db/queries/chat/chatMutations';

export default async function sendChatMessage(
    userId: number,
    chatId: number,
    message: string,
) {
    const messageSent = await insertMessage(userId, message, chatId);
    const updatedLastRead = await updateLastReadAt(chatId, userId);
    const updatedLastMessage = await updateLastMessageAt(chatId);

    return messageSent && updatedLastMessage && updatedLastRead;
}
