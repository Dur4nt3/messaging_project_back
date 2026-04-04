import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import './auth/passportConfig';

import usersRouter from './routes/usersRouter';
import authRouter from './routes/authRouter';
import chatsRouter from './routes/chatsRouter';

const app = express();

if (process.env.APP_CLIENT === undefined) {
    throw new Error('App client is not set!');
}

app.use(
    cors({
        origin: [process.env.APP_CLIENT],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        optionsSuccessStatus: 200,
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/chats', chatsRouter);

// eslint-disable-next-line no-unused-vars
app.use((err: any, req: any, res: any, next: any) => {
    res.status(500).json({
        message: `An unexpected error occurred: ${err}`,
    });
});

const appPort = process.env.PORT || 8080;

app.listen(appPort, (error) => {
    if (error) {
        throw error;
    }
    console.log('App running and listening on port: ', appPort);
});
