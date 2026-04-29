import express from 'express';
import request from 'supertest';

import '../../auth/passportConfig';

import authRouter from '../../routes/authRouter';
import chatsRouter from '../../routes/chatsRouter';
import usersRouter from '../../routes/usersRouter';

import { test, expect, afterAll, beforeAll } from '@jest/globals';

import seedAll from '../utilities/seeds/seedAll';

import setFriends from '../utilities/setFriends';

import getUsersAndTokens from '../utilities/getUsersAndTokens';
import createMultipleUsers from '../utilities/createMultipleUsers';

import { getUserByUsername } from '../../db/queries/user/userQueries';

import truncateAllTables from '../utilities/truncateAll';

import { prisma } from '../../lib/prisma';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/chats', chatsRouter);

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

test('Not able to create a private chat with invalid inputs', async () => {
    const botData = await getUserByUsername('quicktalk');
    expect(botData).not.toBeNull();

    const [[, token1], [user2Data]] = await getUsersAndTokens(
        request,
        app,
        ['test1', 'qw12qw34'],
        ['test2', 'qw12qw34'],
    );

    const invalidUserIdFormat = await request(app)
        .post('/chats/test')
        .set('Authorization', token1);

    expect(invalidUserIdFormat.status).toBe(400);
    expect(invalidUserIdFormat.body).toEqual({
        success: false,
        message: 'Invalid request URL!',
    });

    const alreadyExists = await request(app)
        .post(`/chats/${botData?.userId}`)
        .set('Authorization', token1);

    expect(alreadyExists.status).toBe(400);
    expect(alreadyExists.body).toEqual({
        success: false,
        message: 'Private chat already exists!',
    });

    const notRealUser = await request(app)
        .post('/chats/123')
        .set('Authorization', token1);

    expect(notRealUser.status).toBe(400);
    expect(notRealUser.body).toEqual({
        success: false,
        message: "Cannot create a chat with a user who's not your friend!",
    });

    const notFriends = await request(app)
        .post(`/chats/${user2Data?.userId}`)
        .set('Authorization', token1);

    expect(notFriends.status).toBe(400);
    expect(notFriends.body).toEqual({
        success: false,
        message: "Cannot create a chat with a user who's not your friend!",
    });
});

test('Able to create a private chat', async () => {
    const [[user1Data, token1], [user2Data, token2]] = await getUsersAndTokens(
        request,
        app,
        ['test1', 'qw12qw34'],
        ['test2', 'qw12qw34'],
    );

    const friends = await setFriends(
        request,
        app,
        token1,
        user1Data?.userId,
        token2,
        user2Data?.userId,
    );
    expect(friends).toBeTruthy();

    const response = await request(app)
        .post(`/chats/${user2Data?.userId}`)
        .set('Authorization', token1);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
        success: true,
        chat: {
            chatId: expect.any(Number),
            createdAt: expect.any(String),
            isGroup: false,
            lastMessageAt: expect.any(String),
        },
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
