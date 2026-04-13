import type { FriendshipStatus } from '../../../generated/prisma/enums';

import { prisma } from '../../../lib/prisma';
import logError from '../../utilities/logError';

// This query EXCLUDES ALL NON-HUMAN FRIENDS
// This means you will not get bot friendships
export async function getAllFriends(userId: number) {
    try {
        const friends = await prisma.friendship.findMany({
            where: {
                friendshipStatus: 'ACCEPTED',
                OR: [
                    {
                        senderId: userId,
                        sender: {
                            type: {
                                in: ['HUMAN'],
                            },
                        },
                        receiverId: {
                            not: userId,
                        },
                        receiver: {
                            type: {
                                in: ['HUMAN'],
                            },
                        },
                    },
                    {
                        receiverId: userId,
                        receiver: {
                            type: {
                                in: ['HUMAN'],
                            },
                        },
                        senderId: {
                            not: userId,
                        },
                        sender: {
                            type: {
                                in: ['HUMAN'],
                            },
                        },
                    },
                ],
            },
            include: {
                sender: true,
                receiver: true,
            },
        });

        return friends;
    } catch (error) {
        logError('Error occurred when attempting to get all friends', error);
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
