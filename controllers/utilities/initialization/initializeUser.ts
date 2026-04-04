import type { User } from '../../../generated/prisma/client';

import getQuickTalkBot from './getQuickTalkBot';

import addQuickTalkBotAsFriend from './addQuickTalkBotAsFriend';
import addQuickTalkBotChat from './addQuickTalkBotChat';
import addQuickTalkBotInitialMessage from './addQuickTalkBotInitialMessage';

function userInitializationError(errorMessage: string) {
    console.log(errorMessage, '\n');
    console.log('Aborting and attempting to delete user\n');
}

export default async function initializeUser(user: User) {
    const botUser = await getQuickTalkBot();
    if (!botUser) {
        userInitializationError(
            'Was not able to fetch bot user for initialization',
        );
        return false;
    }

    const botAdded = await addQuickTalkBotAsFriend(user.userId, botUser.userId);
    if (!botAdded) {
        userInitializationError(
            `Was not able to add bot as friend to user: ${JSON.stringify(user)}`,
        );
        return false;
    }

    const botChat = await addQuickTalkBotChat(user.userId, botUser.userId);
    if (botChat === false) {
        userInitializationError(
            `Was not able to create chat with bot for user: ${JSON.stringify(user)}`,
        );
        return false;
    }

    const initialMessageSent = await addQuickTalkBotInitialMessage(
        botUser.userId,
        botChat.chatId,
    );
    if (!initialMessageSent) {
        userInitializationError(
            `Was not able to send initial message to user: ${JSON.stringify(user)}`,
        );
        return false;
    }

    return true;
}
