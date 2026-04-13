import type {
    FriendshipStatus,
    User,
} from '../../../../../generated/prisma/client';
import {
    getAllFriends,
    getSentFriendships,
    getReceivedFriendships,
} from '../../../../../db/queries/friendship/friendshipQueries';
import { insertMessage } from '../../../../../db/queries/message/messageMutations';

function formatFriendData(
    friendList: any[],
    currentUserId: number,
    friendProperty: null | string = null,
) {
    const modifiedList = [];

    for (const friend of friendList) {
        if (friendProperty !== null) {
            const modifiedFriend = { user: friend[friendProperty], ...friend };
            modifiedList.push(modifiedFriend);
            continue;
        }

        const { receiver, sender, ...remainder } = friend;

        if (receiver.userId === currentUserId) {
            const modifiedFriend = { user: sender, ...remainder };
            modifiedList.push(modifiedFriend);
            continue;
        }
        const modifiedFriend = { user: receiver, ...remainder };
        modifiedList.push(modifiedFriend);
        continue;
    }

    return modifiedList;
}

function formatMessage(modifiedList: any[], messageModifier: string) {
    if (modifiedList.length === 0) {
        return 'Your friend list is empty!\nYou may use "/chatters" to view all users using QuickTalk.\nAdd some friends and get started!';
    }

    return `${messageModifier}\n${modifiedList.map(
        (friend) => `${friend.user.username} (${friend.user.name})\n`,
    )}`;
}

async function finalizeAndSendMessage(
    friendList: any[],
    currentUserId: number,
    botUserId: number,
    chatId: number,
    friendProperty: null | string,
    messageModifier: string,
) {
    const modifiedList = formatFriendData(
        friendList,
        currentUserId,
        friendProperty,
    );

    const message = formatMessage(modifiedList, messageModifier);

    const messageSent = await insertMessage(botUserId, message, chatId);

    return messageSent;
}

export default async function showAllFriends(
    input: string,
    botUser: User,
    chatId: number,
    currentUserId: number,
) {
    const COMMAND_MODIFIERS = {
        SENT: 'sent',
        RECEIVED: 'received',
    };

    const [, direction, rawStatus] = input.split(':');
    const status = rawStatus?.toUpperCase() as FriendshipStatus | undefined;

    let friendList;
    let friendProperty;
    let messageModifier;

    if (direction === COMMAND_MODIFIERS.SENT) {
        friendList = await getSentFriendships(currentUserId, status);
        friendProperty = 'receiver';
        messageModifier = rawStatus
            ? `Sent friend requests that are ${rawStatus}:`
            : 'Sent friend requests:';
    } else if (direction === COMMAND_MODIFIERS.RECEIVED) {
        friendList = await getReceivedFriendships(currentUserId, status);
        friendProperty = 'sender';
        messageModifier = rawStatus
            ? `Received friend requests that are ${rawStatus}:`
            : 'received friend requests:';
    } else {
        friendList = await getAllFriends(currentUserId);
        friendProperty = null;
        messageModifier = 'You currently have the following users added:';
    }

    return finalizeAndSendMessage(
        friendList,
        currentUserId,
        botUser.userId,
        chatId,
        friendProperty,
        messageModifier,
    );
}
