import { UserGetPayload } from '../generated/prisma/models';

type UserRedacted = UserGetPayload<{
    select: {
        userId: true;
        username: true;
        name: true;
        type: true;
    };
}>;

export default UserRedacted;
