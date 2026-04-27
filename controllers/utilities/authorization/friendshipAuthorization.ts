import type {
    Friendship,
    FriendshipStatus,
} from '../../../generated/prisma/client';

export function canPatchFriendship(
    currentUserId: number,
    friendship: Friendship,
    status: FriendshipStatus,
) {
    // If you got DENIED you CANNOT perform ANY action on the friendship
    if (
        friendship.senderId === currentUserId &&
        friendship.friendshipStatus === 'DENIED'
    ) {
        return false;
    }

    // You cannot accept a friendship request YOU SENT
    if (friendship.senderId === currentUserId && status === 'ACCEPTED') {
        return false;
    }

    // Must move to the intermediate "PENDING" state when removing a user from your deny list
    if (status === 'ACCEPTED' && friendship.friendshipStatus === 'DENIED') {
        return false;
    }

    return true;
}
