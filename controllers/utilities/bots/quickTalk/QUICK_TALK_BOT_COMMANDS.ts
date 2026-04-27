import type { User } from '../../../../generated/prisma/client';
import QuickTalkCommand from './QuickTalkBotCommand';

import showQuickTalkBotManual from './commands/showQuickTalkBotManual';
import showAllUsers from './commands/showAllUsers';
import showAllFriends from './commands/showAllFriends';

/* eslint-disable no-unused-vars */

const QUICK_TALK_BOT_COMMANDS: QuickTalkCommand[] = [
    new QuickTalkCommand(
        ['/manual', '/man', '/help', '/h', '/list', '/commands', '/command'],
        async (
            input: string,
            botUser: User,
            chatId: number,
            currentUserId: number,
        ) => {
            const result = await showQuickTalkBotManual(botUser, chatId);
            return result;
        },
    ),

    new QuickTalkCommand(
        ['/chatters', '/users'],
        async (
            input: string,
            botUser: User,
            chatId: number,
            currentUserId: number,
        ) => {
            const result = await showAllUsers(botUser, chatId, currentUserId);
            return result;
        },
    ),

    new QuickTalkCommand(
        [
            '/friend',
            '/friends',

            '/friends:sent',
            '/friends:sent:pending',
            '/friends:sent:accepted',

            '/friends:received',
            '/friends:received:denied',
            '/friends:received:pending',
            '/friends:received:accepted',
        ],
        async (
            input: string,
            botUser: User,
            chatId: number,
            currentUserId: number,
        ) => {
            const result = await showAllFriends(
                input,
                botUser,
                chatId,
                currentUserId,
            );
            return result;
        },
    ),
];

export default QUICK_TALK_BOT_COMMANDS;
