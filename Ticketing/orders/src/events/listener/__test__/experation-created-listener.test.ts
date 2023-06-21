import { ExperationCreatedEvent } from '@ferhatadibelli/ferhatadibelli/build/events/experation-created-event';
import { OrderStatus } from '@ferhatadibelli/ferhatadibelli/build/events/types/orders-status';
import mongoose from 'mongoose';
import { Order } from '../../../models/orders';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { ExperitionCreatedListener } from '../experition-created-listener';

const setUp = async () => {
  const listener = new ExperitionCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 23,
  });

  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: '2e2e23e23e',
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  const data: ExperationCreatedEvent['data'] = {
    orderId: order.id,
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, order, ticket };
};

it('updates the order status to cancelled', async () => {
  const { listener, data, msg, order, ticket } = await setUp();
  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an orderCancelled event', async () => {
  const { listener, data, msg, order, ticket } = await setUp();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[1][1]
  );
  console.log('EventData', eventData);
  expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => {
  const { listener, data, msg, order, ticket } = await setUp();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
