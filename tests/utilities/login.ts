export default async function login(
    request: any,
    app: any,
    username: string,
    password: string,
) {
    const response = await request(app).post('/auth/token/').send({
        username,
        password,
    });

    return response.body.success ? response.body.token : null;
}
