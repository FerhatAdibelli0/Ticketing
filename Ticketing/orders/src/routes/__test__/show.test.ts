import { app } from '../../app';
import request from 'supertest';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('fetches orders related to user', async () => {
  const ticket = Ticket.build({
    title: 'Concert',
    price: 35,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const User = signin();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', User)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', User)
    .expect(200);

  expect(order.id).toEqual(fetchedOrder.id);
});

it('throw an error when user trying to fetch an order is not authenticated', async () => {
  const ticket = Ticket.build({
    title: 'Concert',
    price: 35,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const User = signin();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', User)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', signin())
    .expect(401);
});
