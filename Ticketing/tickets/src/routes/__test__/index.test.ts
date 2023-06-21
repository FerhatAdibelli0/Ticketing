import { app } from '../../app';
import request from 'supertest';

const createTicket = () => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: 'Test',
      price: '10',
    })
    .expect(201);
};

it('can fetch all tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get('/api/tickets').send({});
  expect(response.body.length).toEqual(3);
});
