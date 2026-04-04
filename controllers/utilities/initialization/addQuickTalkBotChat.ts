import { insertChat } from '../../../db/queries/chat/chatMutations';
import { insertChatParticipants } from '../../../db/queries/chatParticipant/chatParticipantMutations';

export default async function addQuickTalkBotChat(
    userId: number,
    botUserId: number,
) {
    const chat = await insertChat();
    if (chat === null) {
        return false;
    }

    const participantsAdded = await insertChatParticipants(
        [botUserId, userId],
        chat.chatId,
        new Date(0),
    );

    return participantsAdded !== false ? chat : false;
}
