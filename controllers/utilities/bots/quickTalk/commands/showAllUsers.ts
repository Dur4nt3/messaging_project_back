import type { User } from '../../../../../generated/prisma/client';
import { getAllUsersRedacted } from '../../../../../db/queries/user/userQueries';
import { insertMessage } from '../../../../../db/queries/message/messageMutations';

function formatMessage(userList: any[], currentUserId: number) {
    if (userList.length === 0) {
        // eslint-disable-next-line quotes
        return "Unfortunately, there was an error and we couldn't find any users...";
    }

    const listString = userList
        .map(
            (user, index) =>
                `${index + 1}) ${user.username}${user.userId === currentUserId ? ' (You)' : ''}${user.type !== 'HUMAN' ? ' (Utility Bot)' : ''}`,
        )
        .join('\n');

    return `QuickTalk currently has the following users:\n${listString}\nSend a friend request and start chatting!`;
}

export default async function showAllUsers(
    botUser: User,
    chatId: number,
    currentUserId: number,
) {
    const users = await getAllUsersRedacted();
    const message = formatMessage(users, currentUserId);

    const messageInserted = await insertMessage(
        botUser.userId,
        message,
        chatId,
    );
    return messageInserted;
}
