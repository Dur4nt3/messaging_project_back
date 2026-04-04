import type { User } from '../../../../../generated/prisma/client';
import { getAllUsersRedacted } from '../../../../../db/queries/user/userQueries';
import { insertMessage } from '../../../../../db/queries/message/messageMutations';

function formatMessage(userList: any[]) {
    if (userList.length === 0) {
        // eslint-disable-next-line quotes
        return "Unfortunately, there was an error and we couldn't find any users...";
    }

    return `QuickTalk currently has the following users:
    ${userList.map((user) => {
        `${user.username}\n`;
    })}Send a friend request and start chatting!`;
}

export default async function showAllUsers(botUser: User, chatId: number) {
    const users = await getAllUsersRedacted();
    const message = formatMessage(users);

    const messageInserted = await insertMessage(
        botUser.userId,
        message,
        chatId,
    );
    return messageInserted;
}
