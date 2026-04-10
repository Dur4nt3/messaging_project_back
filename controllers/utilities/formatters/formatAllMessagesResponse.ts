import type ChatMessage from '../../../types/ChatMessage';
import { getChatName } from '../../../db/queries/chatParticipant/chatParticipantQueries';
import { getChat } from '../../../db/queries/chat/chatQueries';

export default async function formatAllMessagesResponse(
    chatId: number,
    currentUserId: number,
    messages: ChatMessage[],
) {
    const chat = await getChat(chatId);
    if (chat === null) {
        return null;
    }
    const { isGroup } = chat;
    const chatName = await getChatName(chatId, isGroup, currentUserId);

    const formattedMessages = messages.map((message) => {
        const { sender, ...reminder } = { ...message };
        
        return {
            name: sender.name,
            sent: reminder.senderId === currentUserId,
            ...reminder,
        };
    });

    return {
        name: chatName,
        messages: formattedMessages,
    };
}
