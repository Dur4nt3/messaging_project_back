import express from 'express';
import request from 'supertest';

import '../../auth/passportConfig';

import authRouter from '../../routes/authRouter';
import usersRouter from '../../routes/usersRouter';

import { test, expect, afterAll, beforeAll } from '@jest/globals';

import seedAll from '../utilities/seeds/seedAll';

import login from '../utilities/login';

import createMultipleUsers from '../utilities/createMultipleUsers';
import getUsersAndTokens from '../utilities/getUsersAndTokens';

import { getUserByUsername } from '../../db/queries/user/userQueries';

import truncateAllTables from '../utilities/truncateAll';

import { prisma } from '../../lib/prisma';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/users', usersRouter);
app.use('/auth', authRouter);

beforeAll(async () => {
    console.log(
        '###################### TEST SETUP START ######################\n',
    );
    await seedAll();

    const usersCreated = await createMultipleUsers(
        request,
        app,
        'test1',
        'test2',
    );
    expect(usersCreated).toBeTruthy();
    console.log('Test users created');

    console.log(
        '###################### TEST SETUP END ######################\n',
    );
});

test('Not able to delete friendships with invalid input', async () => {
    const user2Data = await getUserByUsername('test2');
    expect(user2Data).not.toBeNull();

    const token = await login(request, app, 'test1', 'qw12qw34');
    expect(token).not.toBeNull();

    const invalidUserIdFormat = await request(app)
        .delete('/users/friendships/test')
        .set('Authorization', token);

    expect(invalidUserIdFormat.status).toBe(400);
    expect(invalidUserIdFormat.body).toEqual({
        success: false,
        message: 'Invalid request URL!',
    });

    const noneExistentUser = await request(app)
        .delete('/users/friendships/123')
        .set('Authorization', token);

    expect(noneExistentUser.status).toBe(403);
    expect(noneExistentUser.body).toEqual({
        success: false,
        message: 'You are not allowed to perform this action',
    });

    const friendshipNoneExistent = await request(app)
        .delete(`/users/friendships/${user2Data?.userId}`)
        .set('Authorization', token);

    expect(friendshipNoneExistent.status).toBe(403);
    expect(friendshipNoneExistent.body).toEqual({
        success: false,
        message: 'You are not allowed to perform this action',
    });
});

test('Able to delete friendship', async () => {
    const [[user1Data, token1], [user2Data, token2]] = await getUsersAndTokens(
        request,
        app,
        ['test1', 'qw12qw34'],
        ['test2', 'qw12qw34'],
    );

    // test1 -> test2
    const response1 = await request(app)
        .post(`/users/friendships/${user2Data?.userId}`)
        .set('Authorization', token1);

    expect(response1.status).toBe(200);

    const acceptFriendship1 = await request(app)
        .patch(`/users/friendships/${user1Data?.userId}`)
        .set('Authorization', token2)
        .send({
            status: 'ACCEPTED',
        });

    expect(acceptFriendship1.status).toBe(200);

    const deleteFriend1 = await request(app)
        .delete(`/users/friendships/${user1Data?.userId}`)
        .set('Authorization', token2);

    expect(deleteFriend1.status).toBe(200);
    expect(deleteFriend1.body).toEqual({
        success: true,
    });

    // test2 -> test1
    const response2 = await request(app)
        .post(`/users/friendships/${user1Data?.userId}`)
        .set('Authorization', token2);

    expect(response2.status).toBe(200);

    const acceptFriendship2 = await request(app)
        .patch(`/users/friendships/${user2Data?.userId}`)
        .set('Authorization', token1)
        .send({
            status: 'ACCEPTED',
        });

    expect(acceptFriendship2.status).toBe(200);

    const deleteFriend2 = await request(app)
        .delete(`/users/friendships/${user2Data?.userId}`)
        .set('Authorization', token1);

    expect(deleteFriend2.status).toBe(200);
    expect(deleteFriend2.body).toEqual({
        success: true,
    });
});

afterAll(async () => {
    console.log(
        '###################### TRUNCATE START ######################\n',
    );
    await truncateAllTables();
    await prisma.$disconnect();
    console.log('###################### TRUNCATE END ######################\n');
});
