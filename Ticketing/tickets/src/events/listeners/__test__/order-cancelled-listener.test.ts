import { OrderCancelledEvent } from '@ferhatadibelli/ferhatadibelli/build/events/order-cancelled-event';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Ticket } from '../../../models/tickets';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setUp = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    price: '35',
    title: 'Concert',
    userId: '123456',
  });

  ticket.set({
    orderId,
  });

  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, msg, data, ticket, orderId };
};

it('updates the ticket,publish the event and acks the message', async () => {
  const { listener, msg, data, ticket } = await setUp();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
