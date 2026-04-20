import { FriendshipStatus } from '../../../generated/prisma/enums';

import { getAllFriendships } from '../../../db/queries/friendship/friendshipQueries';
import { filterUsersByUsername } from '../../../db/queries/user/userQueries';

import formatAllFriendshipsResponse from '../formatters/formatAllFriendshipsResponse';
import formatUserList from '../formatters/formatUserList';

export default async function getFriendshipsBasedOnQuery(
    userId: number,
    status: string | undefined,
    startsWith: string | undefined,
) {
    if (status === undefined && startsWith === undefined) {
        const friendships = await getAllFriendships(userId, false);
        const formattedFriendships = formatAllFriendshipsResponse(
            userId,
            friendships,
        );
        return formattedFriendships;
    }

    if (status !== undefined) {
        const validStatus = Object.keys(FriendshipStatus);
        const formattedStatus = String(status).toUpperCase();
        if (validStatus.includes(formattedStatus)) {
            const friendships = await getAllFriendships(
                userId,
                false,
                formattedStatus as FriendshipStatus,
            );
            const formattedFriendships = formatAllFriendshipsResponse(
                userId,
                friendships,
            );
            return formattedFriendships;
        }
        return [];
    }

    if (startsWith !== undefined) {
        if (startsWith === '') {
            return [];
        }

        const users = await filterUsersByUsername(startsWith, userId, true);
        const usersExtended = await formatUserList(users, userId, startsWith);
        return usersExtended;
    }

    return [];
}
