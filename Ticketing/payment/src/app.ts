import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { createChargeRouter } from './routes/new';

import { errorHandler } from '@ferhatadibelli/ferhatadibelli/build/middlewares/error-handler';
import { currentUser } from '@ferhatadibelli/ferhatadibelli/build/middlewares/current-user';
import { NotFoundError } from '@ferhatadibelli/ferhatadibelli/build/errors/not-found-error';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);

app.use(createChargeRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
