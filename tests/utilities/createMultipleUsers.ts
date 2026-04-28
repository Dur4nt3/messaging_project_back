import createUser from './createUser';

export default async function createMultipleUsers(
    request: any,
    app: any,
    ...users: string[]
) {
    await Promise.all(
        users.map(async (user) => {
            const userCreated = await createUser(request, app, user);
            if (!userCreated) {
                throw new Error(`Couldn't create user: ${user}`);
            }
        }),
    );

    return true;
}
