import { Publisher } from '@ferhatadibelli/ferhatadibelli/build/events/base-publisher';
import { Subjects } from '@ferhatadibelli/ferhatadibelli/build/events/subjects';
import { TicketCreatedEvent } from '@ferhatadibelli/ferhatadibelli/build/events/ticket-created-event';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
