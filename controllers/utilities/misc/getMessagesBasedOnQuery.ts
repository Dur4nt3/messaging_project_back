import { getChatMessages } from '../../../db/queries/message/messageQueries';

export default async function getMessagesBasedOnQuery(
    from: string | undefined,
    to: string | undefined,
    chatId: number,
    limit: number,
) {
    if (!from && !to) {
        const messages = await getChatMessages(
            Number(chatId),
            null,
            null,
            limit,
        );
        return messages;
    }

    if (from && !to) {
        const messages = await getChatMessages(
            Number(chatId),
            Number(from),
            null,
            limit,
        );
        return messages;
    }

    if (!from && to) {
        const messages = await getChatMessages(
            Number(chatId),
            null,
            Number(to),
            limit,
        );
        return messages;
    }

    const messages = await getChatMessages(
        Number(chatId),
        Number(from),
        Number(to),
        limit,
    );

    return messages;
}
