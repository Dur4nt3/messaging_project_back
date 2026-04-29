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

test('Not able to send invalid friend requests', async () => {
    const [[user1Data, token1]] = await getUsersAndTokens(request, app, [
        'test1',
        'qw12qw34',
    ]);

    const invalidUserIdFormat = await request(app)
        .post('/users/friendships/test')
        .set('Authorization', token1);

    expect(invalidUserIdFormat.status).toBe(400);
    expect(invalidUserIdFormat.body).toEqual({
        success: false,
        message: 'Invalid request URL!',
    });

    // This will cause a logged error (which is exactly what should happen)
    const noneExistentUser = await request(app)
        .post('/users/friendships/123')
        .set('Authorization', token1);

    expect(noneExistentUser.status).toBe(500);
    expect(noneExistentUser.body).toEqual({
        success: false,
        message: 'Internal server error!',
    });

    const sendToYourself = await request(app)
        .post(`/users/friendships/${user1Data.userId}`)
        .set('Authorization', token1);

    expect(sendToYourself.status).toBe(400);
    expect(sendToYourself.body).toEqual({
        success: false,
        message: 'Invalid request URL!',
    });
});

test('Able to send friend requests', async () => {
    const user2Data = await getUserByUsername('test2');
    expect(user2Data).not.toBeNull();

    const token = await login(request, app, 'test1', 'qw12qw34');
    expect(token).not.toBeNull();

    const response = await request(app)
        .post(`/users/friendships/${user2Data?.userId}`)
        .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
        success: true,
    });
});

// The test case above is the initial friend request
test('Not able to send a friend request to the same user if one already exists', async () => {
    const user2Data = await getUserByUsername('test2');
    expect(user2Data).not.toBeNull();

    const token = await login(request, app, 'test1', 'qw12qw34');
    expect(token).not.toBeNull();

    const response = await request(app)
        .post(`/users/friendships/${user2Data?.userId}`)
        .set('Authorization', token);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
        success: false,
        message: 'You are not allowed to perform this action',
    });
});

test('Able to immediately accept a friendship if the other user is a bot', async () => {
    const botData = await getUserByUsername('quicktalk');
    expect(botData).not.toBeNull();

    const token = await login(request, app, 'test1', 'qw12qw34');
    expect(token).not.toBeNull();

    const deleteBot = await request(app)
        .delete(`/users/friendships/${botData?.userId}`)
        .set('Authorization', token);

    expect(deleteBot.status).toBe(200);

    const requestFriendship = await request(app)
        .post(`/users/friendships/${botData?.userId}`)
        .set('Authorization', token);

    expect(requestFriendship.status).toBe(200);

    const acceptedFriends = await request(app)
        .get('/users/friendships')
        .set('Authorization', token);

    expect(acceptedFriends.status).toBe(200);
    expect(acceptedFriends.body).toMatchObject({
        success: true,
        friendships: [
            {
                friendshipId: expect.any(Number),
                senderId: expect.any(Number),
                receiverId: expect.any(Number),
                friendshipStatus: 'ACCEPTED',
                username: 'quicktalk',
                name: 'Quick Talk',
                sent: true,
            },
        ],
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
