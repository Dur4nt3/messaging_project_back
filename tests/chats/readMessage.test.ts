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

import { findPrivateChat } from '../../db/queries/chat/chatQueries';

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

test('Not able to fetch messages with an invalid input', async () => {
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

    const invalidChatId = await request(app)
        .get('/chats/test/messages')
        .set('Authorization', token1);

    expect(invalidChatId.status).toBe(400);
    expect(invalidChatId.body).toEqual({
        success: false,
        message: 'Invalid request URL!',
    });
});

test('Able to fetch messages', async () => {
    const [[user1Data, token1], [user2Data]] = await getUsersAndTokens(
        request,
        app,
        ['test1', 'qw12qw34'],
        ['test2', 'qw12qw34'],
    );

    // In-order to prevent race conditions
    const message1 = await request(app)
        .post(`/chats/${user2Data.userId}/messages`)
        .set('Authorization', token1)
        .send({
            message: 'From test1',
        });

    const message2 = await request(app)
        .post(`/chats/${user2Data.userId}/messages`)
        .set('Authorization', token1)
        .send({
            message: 'From test1 #2',
        });

    const message3 = await request(app)
        .post(`/chats/${user2Data.userId}/messages`)
        .set('Authorization', token1)
        .send({
            message: 'From test1 #3',
        });

    const message4 = await request(app)
        .post(`/chats/${user2Data.userId}/messages`)
        .set('Authorization', token1)
        .send({
            message: 'From test1 #4',
        });

    expect(message1.status).toBe(200);
    expect(message2.status).toBe(200);
    expect(message3.status).toBe(200);
    expect(message4.status).toBe(200);

    const chat = await findPrivateChat(user1Data.userId, user2Data.userId);
    expect(chat).toBeTruthy();

    if (!chat) {
        throw new Error('no chat found!');
    }

    const chatMessages = await request(app)
        .get(`/chats/${chat?.chatId}/messages`)
        .set('Authorization', token1);

    expect(chatMessages.status).toBe(200);
    expect(chatMessages.body).toMatchObject({
        success: true,
        userId: expect.any(Number),
        chatId: chat?.chatId,
        name: 'Placeholder',
        messages: [
            {
                name: 'Placeholder',
                sent: true,
                messageId: expect.any(Number),
                content: 'From test1',
                senderId: expect.any(Number),
                sentAt: expect.any(String),
                edited: false,
                chatId: chat?.chatId,
                chat: {
                    isGroup: false,
                },
            },
            {
                name: 'Placeholder',
                sent: true,
                messageId: expect.any(Number),
                content: 'From test1 #2',
                senderId: expect.any(Number),
                sentAt: expect.any(String),
                edited: false,
                chatId: chat?.chatId,
                chat: {
                    isGroup: false,
                },
            },
            {
                name: 'Placeholder',
                sent: true,
                messageId: expect.any(Number),
                content: 'From test1 #3',
                senderId: expect.any(Number),
                sentAt: expect.any(String),
                edited: false,
                chatId: chat?.chatId,
                chat: {
                    isGroup: false,
                },
            },
            {
                name: 'Placeholder',
                sent: true,
                messageId: expect.any(Number),
                content: 'From test1 #4',
                senderId: expect.any(Number),
                sentAt: expect.any(String),
                edited: false,
                chatId: chat?.chatId,
                chat: {
                    isGroup: false,
                },
            },
        ],
        more: false,
        friends: true,
    });

    const filterTo = await request(app)
        .get(
            `/chats/${chat?.chatId}/messages?to=${chatMessages.body.messages[1].messageId}`,
        )
        .set('Authorization', token1);

    expect(filterTo.status).toBe(200);
    expect(filterTo.body).toMatchObject({
        success: true,
        userId: expect.any(Number),
        chatId: chat?.chatId,
        name: 'Placeholder',
        messages: [
            {
                name: 'Placeholder',
                sent: true,
                messageId: expect.any(Number),
                content: 'From test1',
                senderId: expect.any(Number),
                sentAt: expect.any(String),
                edited: false,
                chatId: chat?.chatId,
                chat: {
                    isGroup: false,
                },
            },
        ],
        more: false,
        friends: true,
    });

    const filterFrom = await request(app)
        .get(
            `/chats/${chat?.chatId}/messages?from=${chatMessages.body.messages[2].messageId}`,
        )
        .set('Authorization', token1);

    expect(filterFrom.status).toBe(200);
    expect(filterFrom.body).toMatchObject({
        success: true,
        userId: expect.any(Number),
        chatId: chat?.chatId,
        name: 'Placeholder',
        messages: [
            {
                name: 'Placeholder',
                sent: true,
                messageId: expect.any(Number),
                content: 'From test1 #4',
                senderId: expect.any(Number),
                sentAt: expect.any(String),
                edited: false,
                chatId: chat?.chatId,
                chat: {
                    isGroup: false,
                },
            },
        ],
        more: true,
        friends: true,
    });

    const filterFromTo = await request(app)
        .get(
            `/chats/${chat?.chatId}/messages?from=${chatMessages.body.messages[1].messageId}&to=${chatMessages.body.messages[3].messageId}`,
        )
        .set('Authorization', token1);

    expect(filterFromTo.status).toBe(200);
    expect(filterFromTo.body).toMatchObject({
        success: true,
        userId: expect.any(Number),
        chatId: chat?.chatId,
        name: 'Placeholder',
        messages: [
            {
                name: 'Placeholder',
                sent: true,
                messageId: expect.any(Number),
                content: 'From test1 #3',
                senderId: expect.any(Number),
                sentAt: expect.any(String),
                edited: false,
                chatId: chat?.chatId,
                chat: {
                    isGroup: false,
                },
            },
        ],
        more: true,
        friends: true,
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
