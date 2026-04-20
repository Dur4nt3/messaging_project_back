import { FriendshipGetPayload } from '../generated/prisma/models';

type FriendshipFull = FriendshipGetPayload<{
    include: {
        sender: {
            select: {
                username: true;
                name: true;
            };
        };
        receiver: {
            select: {
                username: true;
                name: true;
            };
        };
    };
}>;

export default FriendshipFull;
