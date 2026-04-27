import type { FriendshipStatus } from '../../../generated/prisma/enums';
import {
    UserWhereInput,
    FriendshipInclude,
} from '../../../generated/prisma/models';

import { prisma } from '../../../lib/prisma';
import logError from '../../utilities/logError';

const includeFriendsInfo: FriendshipInclude = {
    sender: {
        select: {
            username: true,
            name: true,
        },
    },
    receiver: {
        select: {
            username: true,
            name: true,
        },
    },
};

export async function getAllFriendships(
    userId: number,
    onlyHumans: boolean = true,
    status: FriendshipStatus = 'ACCEPTED',
) {
    try {
        const humanFilter: UserWhereInput | undefined = onlyHumans
            ? { type: { in: ['HUMAN'] } }
            : undefined;

        const friends = await prisma.friendship.findMany({
            where: {
                friendshipStatus: status,
                OR: [
                    {
                        senderId: userId,
                        receiverId: {
                            not: userId,
                        },
                        receiver: humanFilter,
                    },
                    {
                        receiverId: userId,
                        senderId: {
                            not: userId,
                        },
                        sender: humanFilter,
                    },
                ],
            },
            include: includeFriendsInfo,
        });

        return friends;
    } catch (error) {
        logError('Error occurred when attempting to get all friends', error);
        return [];
    }
}

export async function getFriendshipsFiltered(
    userId: number,
    startsWith: string,
) {
    try {
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    {
                        sender: {
                            username: {
                                startsWith,
                            },
                        },
                        senderId: {
                            not: userId,
                        },
                        receiverId: userId,
                    },
                    {
                        receiver: {
                            username: {
                                startsWith,
                            },
                        },
                        receiverId: {
                            not: userId,
                        },
                        senderId: userId,
                    },
                ],
            },
            include: includeFriendsInfo,
        });

        return friendships;
    } catch (error) {
        logError('Error occurred when attempting to get friendships', error);
        return [];
    }
}

export async function getFriendship(user1Id: number, user2Id: number) {
    try {
        const friendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    {
                        senderId: user1Id,
                        receiverId: user2Id,
                    },
                    {
                        senderId: user2Id,
                        receiverId: user1Id,
                    },
                ],
            },
        });

        return friendship;
    } catch (error) {
        logError('Error occurred when attempting to get friendship', error);
        return false;
    }
}

export async function getSentFriendships(
    userId: number,
    status?: FriendshipStatus,
) {
    try {
        const friends = await prisma.friendship.findMany({
            where: {
                senderId: userId,
                friendshipStatus: status,
            },
            include: {
                receiver: true,
            },
        });

        return friends;
    } catch (error) {
        logError(
            'Error occurred when attempting to get all sent friendships',
            error,
        );
        return [];
    }
}

export async function getReceivedFriendships(
    userId: number,
    status?: FriendshipStatus,
) {
    try {
        const friends = await prisma.friendship.findMany({
            where: {
                receiverId: userId,
                friendshipStatus: status,
            },
            include: {
                sender: true,
            },
        });

        return friends;
    } catch (error) {
        logError(
            'Error occurred when attempting to get all received friendships',
            error,
        );
        return [];
    }
}

export async function getDenyList(userId: number) {
    try {
        const friends = await prisma.friendship.findMany({
            where: {
                receiverId: userId,
                friendshipStatus: 'DENIED',
            },
            include: includeFriendsInfo,
        });

        return friends;
    } catch (error) {
        logError(
            'Error occurred when attempting to get all denied friendships',
            error,
        );
        return [];
    }
}

export async function areUsersFriends(user1Id: number, user2Id: number) {
    const friendship = await getFriendship(user1Id, user2Id);
    if (friendship === false) {
        return null;
    }

    if (friendship === null || friendship.friendshipStatus !== 'ACCEPTED') {
        return false;
    }

    return true;
}
