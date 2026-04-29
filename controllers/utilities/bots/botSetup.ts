import { getUserByUsername } from '../../../db/queries/user/userQueries';
import BotManager from './BotManager';
import QuickTalkBot from './quickTalk/QuickTalkBot';

const allBots = new BotManager();

let initializationComplete = false;

export async function initBots() {
    if (initializationComplete) {
        return;
    }

    const quickTalkBotData = await getUserByUsername('quicktalk');
    if (quickTalkBotData === null) {
        throw new Error('QuickTalk bot not found in the database!');
    }

    allBots.register('quicktalk', new QuickTalkBot(quickTalkBotData));

    initializationComplete = true;
}

export default allBots;
