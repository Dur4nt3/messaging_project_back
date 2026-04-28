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

beforeAll(async () => {
    console.log('###################### SEED START ######################\n');
    await seedAll();
    console.log('###################### SEED END ######################\n');
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/users', usersRouter);
app.use('/auth', authRouter);

test('Not able to update friendships with invalid input', async () => {
    const usersCreated = await createMultipleUsers(
        request,
        app,
        'test1',
        'test2',
        'test3',
        'test4',
        'test5',
    );
    expect(usersCreated).toBeTruthy();

    const user2Data = await getUserByUsername('test2');
    expect(user2Data).not.toBeNull();

    const token = await login(request, app, 'test1', 'qw12qw34');
    expect(token).not.toBeNull();

    const invalidStatus = await request(app)
        .patch(`/users/friendships/${user2Data?.userId}`)
        .set('Authorization', token)
        .send({
            status: 'invalidStatus',
        });

    expect(invalidStatus.status).toBe(400);
    expect(invalidStatus.body).toEqual({
        success: false,
        errors: [
            {
                type: 'field',
                value: 'invalidStatus',
                msg: 'Status invalid',
                path: 'status',
                location: 'body',
            },
        ],
    });

    const invalidUserIdFormat = await request(app)
        .patch('/users/friendships/test')
        .set('Authorization', token)
        .send({
            status: 'ACCEPTED',
        });

    expect(invalidUserIdFormat.status).toBe(400);
    expect(invalidUserIdFormat.body).toEqual({
        success: false,
        message: 'Invalid request URL!',
    });

    const noneExistentUser = await request(app)
        .patch('/users/friendships/123')
        .set('Authorization', token)
        .send({
            status: 'ACCEPTED',
        });

    expect(noneExistentUser.status).toBe(403);
    expect(noneExistentUser.body).toEqual({
        success: false,
        message: 'You are not allowed to perform this action',
    });

    const friendshipNoneExistent = await request(app)
        .patch(`/users/friendships/${user2Data?.userId}`)
        .set('Authorization', token)
        .send({
            status: 'ACCEPTED',
        });

    expect(friendshipNoneExistent.status).toBe(403);
    expect(friendshipNoneExistent.body).toEqual({
        success: false,
        message: 'You are not allowed to perform this action',
    });
});

test('Able to update friendship', async () => {
    const [[user1Data, token1], [user2Data, token2], [user3Data, token3]] =
        await getUsersAndTokens(
            request,
            app,
            ['test1', 'qw12qw34'],
            ['test2', 'qw12qw34'],
            ['test3', 'qw12qw34'],
        );

    // test1 -> test2
    const response1 = await request(app)
        .post(`/users/friendships/${user2Data?.userId}`)
        .set('Authorization', token1);

    expect(response1.status).toBe(200);

    const acceptFriendship = await request(app)
        .patch(`/users/friendships/${user1Data?.userId}`)
        .set('Authorization', token2)
        .send({
            status: 'ACCEPTED',
        });

    expect(acceptFriendship.status).toBe(200);
    expect(acceptFriendship.body).toEqual({
        success: true,
    });

    // test2 -> test3
    const response2 = await request(app)
        .post(`/users/friendships/${user3Data?.userId}`)
        .set('Authorization', token2);

    expect(response2.status).toBe(200);

    const denyFriendship = await request(app)
        .patch(`/users/friendships/${user2Data?.userId}`)
        .set('Authorization', token3)
        .send({
            status: 'DENIED',
        });

    expect(denyFriendship.status).toBe(200);
    expect(denyFriendship.body).toEqual({
        success: true,
    });
});

test('Not able to update friendship under certain conditions', async () => {
    const [[user1Data, token1], [user3Data, token3], [user4Data]] =
        await getUsersAndTokens(
            request,
            app,
            ['test1', 'qw12qw34'],
            ['test3', 'qw12qw34'],
            ['test4', 'qw12qw34'],
        );

    // test1 -> test3
    const response1 = await request(app)
        .post(`/users/friendships/${user3Data?.userId}`)
        .set('Authorization', token1);

    expect(response1.status).toBe(200);

    // test1 -> test4
    const response2 = await request(app)
        .post(`/users/friendships/${user4Data?.userId}`)
        .set('Authorization', token1);

    expect(response2.status).toBe(200);

    const denyFriendship = await request(app)
        .patch(`/users/friendships/${user1Data?.userId}`)
        .set('Authorization', token3)
        .send({
            status: 'DENIED',
        });

    expect(denyFriendship.status).toBe(200);

    const actionOnDenied = await request(app)
        .patch(`/users/friendships/${user3Data?.userId}`)
        .set('Authorization', token1)
        .send({
            status: 'ACCEPTED',
        });

    expect(actionOnDenied.status).toBe(403);

    const actionOnYourRequest = await request(app)
        .patch(`/users/friendships/${user4Data?.userId}`)
        .set('Authorization', token1)
        .send({
            status: 'ACCEPTED',
        });

    expect(actionOnYourRequest.status).toBe(403);

    const immediateAccept = await request(app)
        .patch(`/users/friendships/${user1Data?.userId}`)
        .set('Authorization', token3)
        .send({
            status: 'ACCEPTED',
        });

    expect(immediateAccept.status).toBe(403);
});

afterAll(async () => {
    console.log(
        '###################### TRUNCATE START ######################\n',
    );
    await truncateAllTables();
    await prisma.$disconnect();
    console.log('###################### TRUNCATE END ######################\n');
});
