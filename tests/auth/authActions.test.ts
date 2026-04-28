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

test('Not able to login with incorrect credentials', async () => {
    const result = await createUser(request, app, 'test');
    expect(result).toBeTruthy();

    // Incorrect username
    const attempt1 = await login(request, app, 'test0', 'qw12qw34');
    // Incorrect password
    const attempt2 = await login(request, app, 'test', 'qw12qw344');

    expect(attempt1).toBeNull();
    expect(attempt2).toBeNull();
});

test('Able to login', async () => {
    const token = await login(request, app, 'test', 'qw12qw34');
    expect(token).not.toBeNull();
});

test('Not able to check authentication without a token', async () => {
    const response = await request(app).get('/auth/token');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
        success: false,
        message: 'Could not validate session!',
    });
});

test('Able to check authentication', async () => {
    const token = await login(request, app, 'test', 'qw12qw34');
    expect(token).not.toBeNull();

    const response = await request(app)
        .get('/auth/token')
        .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
        success: true,
        message: 'Successful authentication!',
    });
});

test('Not able to logout without a token', async () => {
    const response = await request(app).delete('/auth/token');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
        success: false,
        message: 'Could not validate session!',
    });
});

test('Able to logout', async () => {
    const token = await login(request, app, 'test', 'qw12qw34');
    expect(token).not.toBeNull();

    const response = await request(app)
        .delete('/auth/token')
        .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
        success: true,
    });
});

test('Not able to use the same token you logged out with', async () => {
    const token = await login(request, app, 'test', 'qw12qw34');
    expect(token).not.toBeNull();

    const response1 = await request(app)
        .get('/auth/token')
        .set('Authorization', token);

    expect(response1.status).toBe(200);

    const response2 = await request(app)
        .delete('/auth/token')
        .set('Authorization', token);

    expect(response2.status).toBe(200);

    const response3 = await request(app)
        .get('/auth/token')
        .set('Authorization', token);

    expect(response3.status).toBe(401);
    expect(response3.body).toEqual({
        success: false,
        message: 'Could not validate session!',
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
