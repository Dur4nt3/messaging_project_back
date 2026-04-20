import type { FriendshipStatus } from '../../../generated/prisma/enums';
import { UserWhereInput } from '../../../generated/prisma/models';

import { prisma } from '../../../lib/prisma';
import logError from '../../utilities/logError';

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
            include: {
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
            },
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
            include: {
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
            },
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

export async function areUsersFriends(user1Id: number, user2Id: number) {
    try {
        const friends = await prisma.friendship.findFirst({
            where: {
                friendshipStatus: 'ACCEPTED',
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

        return friends !== null;
    } catch (error) {
        logError('Error occurred when attempting to check friendship', error);
        return null;
    }
}
