import { getUserByUsername } from '../../../db/queries/user/userQueries';

export default async function getQuickTalkBot() {
    const bot = await getUserByUsername('quicktalk');
    return bot;
}
