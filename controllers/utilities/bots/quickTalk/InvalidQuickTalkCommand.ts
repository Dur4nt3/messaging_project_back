import sendChatMessage from '../../misc/sendChatMessage';

export default async function invalidQuickTalkCommand(
    input: string,
    botUserId: number,
    botChatId: number,
) {
    const sent = await sendChatMessage(
        botUserId,
        botChatId,
        `Command "${input}" does not exist.
Ensure you append a "/" to the start of your command.
To view a list of all commands use "/manual".
`,
    );
    return sent;
}
