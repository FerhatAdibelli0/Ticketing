import { Listener } from '@ferhatadibelli/ferhatadibelli/build/events/base-listener';
import { OrderCancelledEvent } from '@ferhatadibelli/ferhatadibelli/build/events/order-cancelled-event';
import { Subjects } from '@ferhatadibelli/ferhatadibelli/build/events/subjects';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/tickets';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { queueGroupName } from '../queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error('No ticket found');
    }

    ticket.set({
      orderId: undefined,
    });

    await ticket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: +ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}
