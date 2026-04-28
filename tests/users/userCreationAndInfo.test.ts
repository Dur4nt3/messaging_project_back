import express from 'express';
import request from 'supertest';

import '../../auth/passportConfig';

import authRouter from '../../routes/authRouter';
import usersRouter from '../../routes/usersRouter';

import { test, expect, afterAll, beforeAll } from '@jest/globals';

import seedAll from '../utilities/seeds/seedAll';

import createUser from '../utilities/createUser';
import login from '../utilities/login';

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

test('Not able to create a user with invalid inputs', async () => {
    const response = await request(app).post('/users/').send({
        username: 'test',
        name: 'test',
        password: 'qw12qw34',
        cpassword: 'notMatching',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
        success: false,
        errors: [
            {
                type: 'field',
                value: 'notMatching',
                msg: 'Passwords do not match',
                path: 'cpassword',
                location: 'body',
            },
        ],
    });
});

test('Able to create a user', async () => {
    const result = await createUser(request, app, 'test');

    expect(result).toBeTruthy();
});

test('Not able to create 2 users with the same username', async () => {
    const response = await request(app).post('/users/').send({
        username: 'test',
        name: 'test',
        password: 'qw12qw34',
        cpassword: 'qw12qw34',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
        success: false,
        errors: [
            {
                type: 'field',
                value: 'test',
                msg: 'Username already taken',
                path: 'username',
                location: 'body',
            },
        ],
    });
});

test('Not able fetch user info without a token', async () => {
    const response = await request(app).get('/users/me');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
        success: false,
        message: 'Could not validate session!',
    });
});

test('Able fetch user info without a token', async () => {
    const token = await login(request, app, 'test', 'qw12qw34');
    expect(token).not.toBeNull();

    const response = await request(app)
        .get('/users/me')
        .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
        success: true,
        name: 'Placeholder',
        username: 'test',
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
