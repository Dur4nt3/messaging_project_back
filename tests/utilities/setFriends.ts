export default async function setFriends(
    request: any,
    app: any,
    token1: string,
    userId1: number,
    token2: string,
    userId2: number,
) {
    const friendRequest = await request(app)
        .post(`/users/friendships/${userId2}`)
        .set('Authorization', token1);

    if (friendRequest.status !== 200) {
        return false;
    }

    const acceptFriendship = await request(app)
        .patch(`/users/friendships/${userId1}`)
        .set('Authorization', token2)
        .send({
            status: 'ACCEPTED',
        });

    if (acceptFriendship.status !== 200) {
        return false;
    }

    return true;
}
