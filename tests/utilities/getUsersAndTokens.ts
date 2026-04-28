import { getUserByUsername } from '../../db/queries/user/userQueries';

import login from './login';

export default async function getUsersAndTokens(
    request: any,
    app: any,
    ...loginInfo: any[]
) {
    const usersData = await Promise.all(
        loginInfo.map(async (info) => {
            const userData = await getUserByUsername(info[0]);

            if (userData === null) {
                throw new Error(`Invalid username: ${info[0]}`);
            }

            const token = await login(request, app, info[0], info[1]);

            if (token === null) {
                throw new Error(`Invalid credentials: ${info[0]}, ${info[1]}`);
            }

            return [userData, token];
        }),
    );

    return usersData;
}
