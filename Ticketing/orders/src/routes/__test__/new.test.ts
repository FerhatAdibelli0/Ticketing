import { app } from '../../app';
import request from 'supertest';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/orders';
import { OrderStatus } from '@ferhatadibelli/ferhatadibelli/build/events/types/orders-status';

it('returns an error if the ticket doesnt exist', async () => {
  const ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({
      ticketId,
    })
    .expect(404);
});
it('returns an error if the ticket is already reserved', async () => {
  //create ticket and save
  const ticket = Ticket.build({
    title: 'ferhat',
    price: 25,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  //create order and save
  const order = Order.build({
    userId: 'wefwewedwedwde',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();
  //create api with signedin user and send ticketId created
  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(400);
});
it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    title: 'ferhat',
    price: 25,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
});

it('publish created order', async () => {
  const ticket = Ticket.build({
    title: 'ferhat',
    price: 25,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
