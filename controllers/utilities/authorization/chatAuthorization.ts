import { getUserById } from '../../../db/queries/user/userQueries';

export async function usersExist(userIds: number[]) {
    try {
        await Promise.all(
            userIds.map(async (userId) => {
                const user = await getUserById(userId);
                if (user === null) {
                    throw new Error('User does not exist!');
                }
                return true;
            }),
        );
    } catch {
        return false;
    }

    return true;
}
