import { Message } from 'node-nats-streaming';
import { Listener } from '@ferhatadibelli/ferhatadibelli/build/events/base-listener';
import { Subjects } from '@ferhatadibelli/ferhatadibelli/build/events/subjects';
import { TicketCreatedEvent } from '@ferhatadibelli/ferhatadibelli/build/events/ticket-created-event';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('Event data!', data);

    msg.ack();
  }
}
