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

test('Not able to send an invalid message', async () => {
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

    const invalidContent = await request(app)
        .post(`/chats/${user2Data?.userId}/messages`)
        .set('Authorization', token1)
        .send({
            message: '',
        });

    expect(invalidContent.status).toBe(400);
    expect(invalidContent.body).toEqual({
        success: false,
        errors: [
            {
                type: 'field',
                value: '',
                msg: 'Message must not be empty',
                path: 'message',
                location: 'body',
            },
        ],
    });

    const invalidChatId = await request(app)
        .post('/chats/test/messages')
        .set('Authorization', token1)
        .send({
            message: 'test',
        });

    expect(invalidChatId.status).toBe(400);
    expect(invalidChatId.body).toEqual({
        success: false,
        message: 'Invalid request URL!',
    });

    const noneExistentChat = await request(app)
        .post('/chats/123/messages')
        .set('Authorization', token1)
        .send({
            message: 'test',
        });

    expect(noneExistentChat.status).toBe(400);
    expect(noneExistentChat.body).toEqual({
        success: false,
        message: "Chat doesn't exist!",
    });
});

test('Able to send a message', async () => {
    const botData = await getUserByUsername('quicktalk');
    expect(botData).not.toBeNull();

    const [[user1Data, token1], [user2Data, token2]] = await getUsersAndTokens(
        request,
        app,
        ['test1', 'qw12qw34'],
        ['test2', 'qw12qw34'],
    );

    const user1toUser2 = await request(app)
        .post(`/chats/${user2Data.userId}/messages`)
        .set('Authorization', token1)
        .send({
            message: 'From test1',
        });

    expect(user1toUser2.status).toBe(200);
    expect(user1toUser2.body).toEqual({
        success: true,
    });

    const user2toUser1 = await request(app)
        .post(`/chats/${user1Data.userId}/messages`)
        .set('Authorization', token2)
        .send({
            message: 'From test2',
        });

    expect(user2toUser1.status).toBe(200);
    expect(user2toUser1.body).toEqual({
        success: true,
    });

    const toBot = await request(app)
        .post(`/chats/${botData?.userId}/messages`)
        .set('Authorization', token1)
        .send({
            message: '/manual',
        });

    expect(toBot.status).toBe(200);
    expect(toBot.body).toEqual({
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
