import { app } from '../../app';
import request from 'supertest';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '@ferhatadibelli/ferhatadibelli/build/events/types/orders-status';
import { Order } from '../../models/orders';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('delete order ', async () => {
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
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', User)
    .expect(204);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('publish deleted order', async () => {
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
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', User)
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
