import { findPrivateChat } from '../../../db/queries/chat/chatQueries';

export default async function getQuickTalkBotChat(
    userId: number,
    botUserId: number,
) {
    const chat = await findPrivateChat(userId, botUserId);

    return chat;
}
