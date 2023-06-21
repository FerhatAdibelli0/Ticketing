import { app } from '../../app';
import request from 'supertest';
import { Ticket } from '../../models/tickets';
import mongoose from 'mongoose';

it('return a 404 if ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});
it('returns the ticket if the ticket is found', async () => {
  const title = 'Ferhat';
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title,
      price: '10',
    })
    .expect(201);

  await request(app).get(`/api/tickets/${response.body.id}`).send().expect(200);
});
