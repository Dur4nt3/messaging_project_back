export default async function createUser(
    request: any,
    app: any,
    username: string,
) {
    const response = await request(app).post('/users/').send({
        username,
        name: 'Placeholder',
        password: 'qw12qw34',
        cpassword: 'qw12qw34',
    });

    return response.body.success === true;
}
