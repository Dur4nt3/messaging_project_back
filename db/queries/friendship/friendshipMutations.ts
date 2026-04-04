import { FriendshipStatus } from '../../../generated/prisma/enums';
import { prisma } from '../../../lib/prisma';
import logError from '../../utilities/logError';

// ImmediateAccept helps handling bot friendships
export async function sendFriendRequest(
    senderId: number,
    receiverId: number,
    immediateAccept: boolean = false,
) {
    try {
        const request = await prisma.friendship.create({
            data: {
                senderId,
                receiverId,
                friendshipStatus: immediateAccept ? 'ACCEPTED' : 'PENDING',
            },
        });

        return request;
    } catch (error) {
        logError(
            'Error occurred when attempting to send friend request',
            error,
        );
        return null;
    }
}

export async function acceptFriendRequest(
    senderId: number,
    receiverId: number,
) {
    try {
        await prisma.friendship.update({
            where: {
                senderId_receiverId: {
                    senderId,
                    receiverId,
                },
            },
            data: {
                friendshipStatus: 'ACCEPTED',
            },
        });

        return true;
    } catch (error) {
        logError(
            'Error occurred when attempting to accept friend request',
            error,
        );
        return false;
    }
}

export async function updateFriendship(
    friendshipId: number,
    status: FriendshipStatus,
) {
    try {
        await prisma.friendship.update({
            where: {
                friendshipId,
            },
            data: {
                friendshipStatus: status,
            },
        });

        return true;
    } catch (error) {
        logError('Error occurred when attempting to update friendship', error);
        return false;
    }
}

export async function deleteFriendship(friendshipId: number) {
    try {
        await prisma.friendship.delete({
            where: {
                friendshipId,
            },
        });

        return true;
    } catch (error) {
        logError('Error occurred when attempting to delete friendship', error);
        return false;
    }
}
