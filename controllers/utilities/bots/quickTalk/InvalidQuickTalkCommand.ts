import { insertMessage } from '../../../../db/queries/message/messageMutations';

export default async function invalidQuickTalkCommand(
    input: string,
    botUserId: number,
    botChatId: number,
) {
    const sent = await insertMessage(
        botUserId,
        `Command "${input}" does not exist.
Ensure you append a "/" to the start of your command.
To view a list of all commands use "/manual".
`,
        botChatId,
    );
    return sent;
}
