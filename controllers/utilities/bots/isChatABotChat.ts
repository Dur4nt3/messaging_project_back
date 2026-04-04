import { User } from '../../../generated/prisma/client';

export default function isChatABotChat(chatData: any): false | User {
    if (chatData.isGroup) {
        return false;
    }

    for (const participant of chatData.chatParticipants) {
        if (participant.user.type === 'BOT') {
            return participant.user;
        }
    }

    return false;
}
