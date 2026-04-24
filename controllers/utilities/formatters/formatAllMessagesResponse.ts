import type ChatMessage from '../../../types/ChatMessage';
import {
    getChatName,
    getOtherPrivateChatParticipant,
} from '../../../db/queries/chatParticipant/chatParticipantQueries';
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

    let userId;
    if (isGroup) {
        userId = chat.chatId;
    } else {
        const otherUser = await getOtherPrivateChatParticipant(
            chat.chatId,
            currentUserId,
        );
        if (otherUser === null) {
            return null;
        }
        ({ userId } = otherUser.user);
    }

    const formattedMessages = messages.map((message) => {
        const { sender, ...reminder } = { ...message };

        return {
            name: sender.name,
            sent: reminder.senderId === currentUserId,
            ...reminder,
        };
    });

    return {
        userId,
        chatId: chat.chatId,
        name: chatName,
        messages: formattedMessages,
    };
}
