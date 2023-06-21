import { OrderCreatedEvent } from '@ferhatadibelli/ferhatadibelli/build/events/order-created-event';
import { OrderCreatedListener } from '../order-created-listener';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { OrderStatus } from '@ferhatadibelli/ferhatadibelli/build/events/types/orders-status';
import { Message } from 'node-nats-streaming';

const setUp = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: '123456',
    status: OrderStatus.Created,
    expiresAt: new Date().toString(),
    version: 0,
    ticket: {
      id: 'wedwedwed',
      price: 10,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, msg, data };
};

it('sets the orderId of ticket', async () => {
  const { listener, msg, data } = await setUp();
  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);
  expect(order!.price.toString()).toEqual(data.ticket.price.toString());
});

it('acks the message', async () => {
  const { listener, msg, data } = await setUp();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
