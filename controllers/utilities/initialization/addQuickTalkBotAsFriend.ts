import {
    sendFriendRequest,
    acceptFriendRequest,
} from '../../../db/queries/friendship/friendshipMutations';

export default async function addQuickTalkBotAsFriend(
    userId: number,
    botUserId: number,
) {
    const friendRequest = await sendFriendRequest(botUserId, userId);
    if (friendRequest === null) {
        return false;
    }

    const accepted = await acceptFriendRequest(botUserId, userId);

    return accepted;
}
