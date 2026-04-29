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

test('Not able to update invalid chats', async () => {
    const [[, token1]] = await getUsersAndTokens(request, app, [
        'test1',
        'qw12qw34',
    ]);

    const invalidUserIdFormat = await request(app)
        .patch('/chats/test')
        .set('Authorization', token1);

    expect(invalidUserIdFormat.status).toBe(400);
    expect(invalidUserIdFormat.body).toEqual({
        success: false,
        message: 'Invalid request URL!',
    });

    const notRealChat = await request(app)
        .patch('/chats/123')
        .set('Authorization', token1);

    expect(notRealChat.status).toBe(400);
    expect(notRealChat.body).toEqual({
        success: false,
        message: 'Chat not found!',
    });
});

test('Able to update chats', async () => {
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

    const chatCreated = await request(app)
        .post(`/chats/${user2Data?.userId}`)
        .set('Authorization', token1);

    expect(chatCreated.status).toBe(200);

    const chatUpdated = await request(app)
        .patch(`/chats/${chatCreated.body.chat.chatId}`)
        .set('Authorization', token1);

    expect(chatUpdated.status).toBe(200);
    expect(chatUpdated.body).toEqual({
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
