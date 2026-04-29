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

test('Able to fetch dashboard view', async () => {
    const botData = await getUserByUsername('quicktalk');
    expect(botData).not.toBeNull();

    const [[user1Data, token1], [user2Data, token2]] = await getUsersAndTokens(
        request,
        app,
        ['test1', 'qw12qw34'],
        ['test2', 'qw12qw34'],
    );

    // Initial fetch should only return the bot chat
    const response1 = await request(app)
        .get('/chats')
        .set('Authorization', token1);

    expect(response1.status).toBe(200);
    expect(response1.body).toMatchObject({
        success: true,
        data: [
            {
                chatId: expect.any(Number),
                createdAt: expect.any(String),
                lastMessageAt: expect.any(String),
                isGroup: false,
                chatParticipant: {
                    lastReadAt: expect.any(String),
                    user: {
                        userId: expect.any(Number),
                        username: 'quicktalk',
                        name: 'Quick Talk',
                    },
                },
                messages: {
                    lastContent: expect.any(String),
                    sent: false,
                    unread: expect.any(Number),
                },
            },
        ],
    });

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

    const message1 = await request(app)
        .post(`/chats/${user2Data.userId}/messages`)
        .set('Authorization', token1)
        .send({
            message: 'From test1',
        });

    expect(message1.status).toBe(200);

    // Should see the new chat with the new message
    const response2 = await request(app)
        .get('/chats')
        .set('Authorization', token1);

    expect(response2.status).toBe(200);
    expect(response2.body).toMatchObject({
        success: true,
        data: [
            {
                chatId: expect.any(Number),
                createdAt: expect.any(String),
                lastMessageAt: expect.any(String),
                isGroup: false,
                chatParticipant: {
                    lastReadAt: expect.any(String),
                    user: {
                        userId: expect.any(Number),
                        username: 'test2',
                        name: 'Placeholder',
                    },
                },
                messages: {
                    lastContent: 'From test1',
                    sent: true,
                    unread: 0,
                },
            },

            {
                chatId: expect.any(Number),
                createdAt: expect.any(String),
                lastMessageAt: expect.any(String),
                isGroup: false,
                chatParticipant: {
                    lastReadAt: expect.any(String),
                    user: {
                        userId: expect.any(Number),
                        username: 'quicktalk',
                        name: 'Quick Talk',
                    },
                },
                messages: {
                    lastContent: expect.any(String),
                    sent: false,
                    unread: 1,
                },
            },
        ],
    });

    const chatUpdated = await request(app)
        .patch(`/chats/${chatCreated.body.chat.chatId}`)
        .set('Authorization', token1);

    expect(chatUpdated.status).toBe(200);
    expect(chatUpdated.body).toEqual({
        success: true,
    });

    // New chat shouldn't be visible after changing the visibility
    const response3 = await request(app)
        .get('/chats')
        .set('Authorization', token1);

    expect(response3.status).toBe(200);
    expect(response3.body).toMatchObject({
        success: true,
        data: [
            {
                chatId: expect.any(Number),
                createdAt: expect.any(String),
                lastMessageAt: expect.any(String),
                isGroup: false,
                chatParticipant: {
                    lastReadAt: expect.any(String),
                    user: {
                        userId: expect.any(Number),
                        username: 'quicktalk',
                        name: 'Quick Talk',
                    },
                },
                messages: {
                    lastContent: expect.any(String),
                    sent: false,
                    unread: 1,
                },
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
