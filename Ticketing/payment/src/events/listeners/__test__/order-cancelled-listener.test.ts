import { OrderCancelledEvent } from '@ferhatadibelli/ferhatadibelli/build/events/order-cancelled-event';
import { OrderStatus } from '@ferhatadibelli/ferhatadibelli/build/events/types/orders-status';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';

const setUp = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    price: 35,
    id: orderId,
    userId: '123456',
    status: OrderStatus.Created,
    version: 0,
  });

  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 1,
    ticket: {
      id: 'as234de',
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, msg, data, order, orderId };
};

it('updates the status', async () => {
  const { listener, msg, data } = await setUp();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(data.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, msg, data } = await setUp();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
