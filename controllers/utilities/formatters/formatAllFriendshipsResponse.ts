import FriendshipFull from '../../../types/FriendshipExtended';

export default function formatAllFriendshipsResponse(
    userId: number,
    friendships: FriendshipFull[],
) {
    const formattedFriendships = friendships.map((friendship) => {
        const { sender, receiver, ...reminder } = friendship;
        if (friendship.senderId === userId) {
            return {
                ...reminder,
                ...receiver,
                sent: true,
            };
        }

        return {
            ...reminder,
            ...sender,
            sent: false,
        };
    });

    return formattedFriendships;
}
