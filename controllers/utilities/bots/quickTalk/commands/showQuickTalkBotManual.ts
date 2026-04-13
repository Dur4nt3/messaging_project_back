import type { User } from '../../../../../generated/prisma/client';

import { insertMessage } from '../../../../../db/queries/message/messageMutations';

export default async function showQuickTalkBotManual(
    botUser: User,
    chatId: number,
) {
    const manual = `The QuickTalk bot currently offers the following commands:

/manual — View the full list of available commands

/chatters — See all active chat participants

/friends — View your current friends list

/friends:sent - View all friend request you've sent regardless of current state (pending/denied/accepted)

/friends:sent:pending - View all friend request you've sent that are currently pending

/friends:sent:denied - View all friend request you've sent that were denied

/friends:sent:accepted - View all friend request you've sent that were accepted

/friends:received - View all friend request you've received regardless of current state (pending/denied/accepted)

/friends:received:pending - View all friend request you've received that are currently pending

/friends:received:denied - View all friend request you've received that were denied

/friends:received:accepted - View all friend request you've received that were accepted

Use these commands at any time to quickly navigate and stay connected.`;

    const messageSent = await insertMessage(botUser.userId, manual, chatId);
    return messageSent;
}
