import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';

declare global {
  function signin(id?: string): string[];
}

//Redirect from real file
jest.mock('../nats-wrapper.ts');

process.env.STRIPE_KEY =
  'sk_test_51KsTFdDUYVdahe16knLkU0tJ7k7tR8Nwmgw1bAlqyY762cZ5g4GY5e72JLTehNl483oK1QytJ4Qa2Y9cbX5MwYcw00IdP47Bbb';

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'secret-key';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'ferhat@gmail.com',
  };
  const jwtToken = jwt.sign(payload, process.env.JWT_KEY!);
  const session = { jwt: jwtToken };
  const sessionJSON = JSON.stringify(session);
  const base64 = Buffer.from(sessionJSON).toString('base64');
  return [`session=${base64}`];
};
