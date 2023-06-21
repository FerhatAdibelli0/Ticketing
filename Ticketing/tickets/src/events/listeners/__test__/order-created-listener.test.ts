import { OrderCreatedEvent } from '@ferhatadibelli/ferhatadibelli/build/events/order-created-event';
import { OrderCreatedListener } from '../order-created-listener';
import { Ticket } from '../../../models/tickets';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { OrderStatus } from '@ferhatadibelli/ferhatadibelli/build/events/types/orders-status';
import { Message } from 'node-nats-streaming';

const setUp = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    price: '35',
    title: 'Concert',
    userId: '123456',
  });

  await ticket.save();

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: ticket.userId,
    status: OrderStatus.Created,
    expiresAt: new Date().toString(),
    version: 0,
    ticket: {
      id: ticket.id,
      price: +ticket.price,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, msg, data, ticket };
};

it('sets the orderId of ticket', async () => {
  const { listener, msg, data, ticket } = await setUp();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, msg, data, ticket } = await setUp();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publist updated ticket event', async () => {
  const { listener, msg, data } = await setUp();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const updatedTicket = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(updatedTicket.orderId).toEqual(data.id);
});
