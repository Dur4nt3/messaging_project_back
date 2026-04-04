import type { User } from '../../../generated/prisma/client';
import type BotChat from '../../../types/BotChat';
import BotManager from './BotManager';

export default async function handleBotChat(
    message: string,
    botUsername: string,
    chatId: number,
    userId: number,
    allBots: BotManager,
) {
    const bot = allBots.get(botUsername);
    if (bot === undefined) {
        return false;
    }

    const result = await bot.run(message.toLowerCase(), chatId, userId);
    if (!result) {
        return false;
    }
    return true;
}
