import { insertMessage } from '../../../db/queries/message/messageMutations';

export default async function addQuickTalkBotInitialMessage(
    botUserId: number,
    chatId: number,
) {
    const initialMessage = `Welcome to QuickTalk!

I am the QuickTalk bot, designed to provide you with some helpful information.

Here are a few commands to help you get started:

/manual → View all available commands

/chatters → View all users

/friends → View your friends list

Type a command anytime to explore. Happy chatting!`;

    const messageInserted = await insertMessage(
        botUserId,
        initialMessage,
        chatId,
    );

    return messageInserted;
}
