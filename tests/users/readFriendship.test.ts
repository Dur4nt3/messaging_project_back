import express from 'express';
import request from 'supertest';

import '../../auth/passportConfig';

import authRouter from '../../routes/authRouter';
import usersRouter from '../../routes/usersRouter';

import { test, expect, afterAll, beforeAll } from '@jest/globals';

import seedAll from '../utilities/seeds/seedAll';

import createMultipleUsers from '../utilities/createMultipleUsers';
import getUsersAndTokens from '../utilities/getUsersAndTokens';

import truncateAllTables from '../utilities/truncateAll';

import { prisma } from '../../lib/prisma';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/users', usersRouter);
app.use('/auth', authRouter);

beforeAll(async () => {
    console.log('###################### TEST SETUP START ######################\n');
    await seedAll();

    const usersCreated = await createMultipleUsers(
        request,
        app,
        'test1',
        'test2',
        'test3',
        'test4',
    );
    expect(usersCreated).toBeTruthy();
    console.log('Test users created');
    
    console.log('###################### TEST SETUP END ######################\n');
});

// Note (28/04/2026): It is currently impossible
// for the route to return an error outside auth
// Therefore, this will be the only test case
test('Able to fetch friendships', async () => {
    const [
        [user1Data, token1],
        [user2Data],
        [user3Data, token3],
        [user4Data, token4],
    ] = await getUsersAndTokens(
        request,
        app,
        ['test1', 'qw12qw34'],
        ['test2', 'qw12qw34'],
        ['test3', 'qw12qw34'],
        ['test4', 'qw12qw34'],
    );

    // All accepted friends
    const acceptedFriends = await request(app)
        .get('/users/friendships')
        .set('Authorization', token1);

    expect(acceptedFriends.status).toBe(200);
    expect(acceptedFriends.body).toEqual({
        success: true,
        friendships: [
            {
                friendshipId: 1,
                senderId: 1,
                receiverId: 2,
                friendshipStatus: 'ACCEPTED',
                username: 'quicktalk',
                name: 'Quick Talk',
                sent: false,
            },
        ],
    });

    const invalidStatus = await request(app)
        .get('/users/friendships?status=invalid')
        .set('Authorization', token1);

    expect(invalidStatus.status).toBe(200);
    expect(invalidStatus.body).toEqual({
        success: true,
        friendships: [],
    });

    const emptyFilter = await request(app)
        .get('/users/friendships?startsWith=')
        .set('Authorization', token1);

    expect(emptyFilter.status).toBe(200);
    expect(emptyFilter.body).toEqual({
        success: true,
        friendships: [],
    });

    const friendRequest12 = await request(app)
        .post(`/users/friendships/${user2Data?.userId}`)
        .set('Authorization', token1);

    expect(friendRequest12.status).toBe(200);

    const friendRequest13 = await request(app)
        .post(`/users/friendships/${user3Data?.userId}`)
        .set('Authorization', token1);

    expect(friendRequest13.status).toBe(200);

    const friendRequest14 = await request(app)
        .post(`/users/friendships/${user4Data?.userId}`)
        .set('Authorization', token1);

    expect(friendRequest14.status).toBe(200);

    const acceptFriendship = await request(app)
        .patch(`/users/friendships/${user1Data?.userId}`)
        .set('Authorization', token3)
        .send({
            status: 'ACCEPTED',
        });

    expect(acceptFriendship.status).toBe(200);

    const denyFriendship = await request(app)
        .patch(`/users/friendships/${user1Data?.userId}`)
        .set('Authorization', token4)
        .send({
            status: 'DENIED',
        });

    expect(denyFriendship.status).toBe(200);

    const pendingStatus = await request(app)
        .get('/users/friendships?status=pending')
        .set('Authorization', token1);

    expect(pendingStatus.status).toBe(200);
    expect(pendingStatus.body).toMatchObject({
        success: true,
        friendships: [
            {
                friendshipId: expect.any(Number),
                senderId: expect.any(Number),
                receiverId: expect.any(Number),
                friendshipStatus: 'PENDING',
                username: 'test2',
                name: 'Placeholder',
                sent: true,
            },
        ],
    });

    const acceptedStatus = await request(app)
        .get('/users/friendships?status=accepted')
        .set('Authorization', token1);

    expect(acceptedStatus.status).toBe(200);
    expect(acceptedStatus.body).toMatchObject({
        success: true,
        friendships: [
            {
                friendshipId: expect.any(Number),
                senderId: expect.any(Number),
                receiverId: expect.any(Number),
                friendshipStatus: 'ACCEPTED',
                username: 'quicktalk',
                name: 'Quick Talk',
                sent: false,
            },
            {
                friendshipId: expect.any(Number),
                senderId: expect.any(Number),
                receiverId: expect.any(Number),
                friendshipStatus: 'ACCEPTED',
                username: 'test3',
                name: 'Placeholder',
                sent: true,
            },
        ],
    });

    const deniedStatus1 = await request(app)
        .get('/users/friendships?status=denied')
        .set('Authorization', token4);

    expect(deniedStatus1.status).toBe(200);
    expect(deniedStatus1.body).toMatchObject({
        success: true,
        friendships: [
            {
                friendshipId: expect.any(Number),
                senderId: expect.any(Number),
                receiverId: expect.any(Number),
                friendshipStatus: 'DENIED',
                username: 'test1',
                name: 'Placeholder',
                sent: false,
            },
        ],
    });

    const deniedStatus2 = await request(app)
        .get('/users/friendships?status=denied')
        .set('Authorization', token1);

    // A user isn't supposed to see users who've blocked them
    expect(deniedStatus2.status).toBe(200);
    expect(deniedStatus2.body).toMatchObject({
        success: true,
        friendships: [],
    });

    const startsWith = await request(app)
        .get('/users/friendships?startsWith=test3')
        .set('Authorization', token1);

    expect(startsWith.status).toBe(200);
    expect(startsWith.body).toMatchObject({
        success: true,
        friendships: [
            {
                userId: expect.any(Number),
                username: 'test3',
                name: 'Placeholder',
                type: 'HUMAN',
                status: 'ACCEPTED',
                searchTerm: 'test3',
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
