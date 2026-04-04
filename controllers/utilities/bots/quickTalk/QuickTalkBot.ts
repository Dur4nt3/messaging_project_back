import type { User } from '../../../../generated/prisma/client';

import QUICK_TALK_BOT_COMMANDS from './QUICK_TALK_BOT_COMMANDS';
import invalidQuickTalkCommand from './InvalidQuickTalkCommand';

const allCommands: any = {};

for (const commandObject of QUICK_TALK_BOT_COMMANDS) {
    for (const alias of commandObject.aliases) {
        allCommands[alias] = commandObject.execute;
    }
}
export default class QuickTalkBot {
    botData: User;

    constructor(botData: User) {
        this.botData = botData;
    }

    run(input: string, chatId: number, currentUserId: number) {
        const func = allCommands[input];
        const result = func
            ? func(input, this.botData, chatId, currentUserId)
            : invalidQuickTalkCommand(input, this.botData.userId, chatId);
        return result;
    }
}
