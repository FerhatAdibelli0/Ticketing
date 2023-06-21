import { Listener } from '@ferhatadibelli/ferhatadibelli/build/events/base-listener';
import { Subjects } from '@ferhatadibelli/ferhatadibelli/build/events/subjects';
import { TicketCreatedEvent } from '@ferhatadibelli/ferhatadibelli/build/events/ticket-created-event';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from '../queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, price, title } = data;
    const ticket = Ticket.build({ id, title, price });

    await ticket.save();

    msg.ack();
  }
}
