import { app } from '../../app';
import request from 'supertest';
import { Ticket } from '../../models/tickets';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('return a 404 if provided id is not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', signin())
    .send({
      title: 'test',
      price: '772',
    })
    .expect(404);
});
it('returns 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'test',
      price: '772',
    })
    .expect(401);
});
it('returns 401 if the user doesnt own ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: 'wedwed',
      price: '23',
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', signin())
    .send({
      title: 'test',
      price: '772',
    })
    .expect(401);
});
it('returns 400 if the user provides an invalid title and price', async () => {
  const cookie = signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'wedwed',
      price: '23',
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: '772',
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'wedwedwed',
      price: '',
    })
    .expect(400);
});
it('returns updateds data successfully', async () => {
  const cookie = signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'eski',
      price: '23',
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'ferhatadibelli',
      price: '1000',
    })
    .expect(200);

  const updatedData = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(updatedData.body.ticket.title).toEqual('ferhatadibelli');
  expect(updatedData.body.ticket.price).toEqual('1000');
});

it('publish event successfully', async () => {
  const cookie = signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'eski',
      price: '23',
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'ferhatadibelli',
      price: '1000',
    })
    .expect(200);

  await request(app).get(`/api/tickets/${response.body.id}`).send().expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('publish event successfully', async () => {
  const cookie = signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'eski',
      price: '23',
    })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'eski',
      price: '1000',
    })
    .expect(400);
});
