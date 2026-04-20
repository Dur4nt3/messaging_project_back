import type UserRedacted from '../../../types/UserRedacted';

import { getFriendship } from '../../../db/queries/friendship/friendshipQueries';

export default async function formatUserList(
    users: UserRedacted[],
    currentUserId: number,
    searchTerm: string | null = null,
) {
    const initial = await Promise.all(
        users.map(async (user) => {
            const friendship = await getFriendship(currentUserId, user.userId);
            if (!friendship) {
                return {
                    ...user,
                    status: null,
                    searchTerm,
                };
            }

            if (friendship.friendshipStatus !== 'DENIED') {
                return {
                    ...user,
                    status: friendship.friendshipStatus,
                    searchTerm,
                };
            }

            if (friendship.receiverId === currentUserId) {
                return {
                    ...user,
                    status: friendship.friendshipStatus,
                    searchTerm,
                };
            }

            return null;
        }),
    );

    const usersExtended = initial.filter((record) => record !== null);

    return usersExtended;
}
