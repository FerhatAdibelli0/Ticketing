import { Publisher } from '@ferhatadibelli/ferhatadibelli/build/events/base-publisher';
import { Subjects } from '@ferhatadibelli/ferhatadibelli/build/events/subjects';
import { TicketUpdatedEvent } from '@ferhatadibelli/ferhatadibelli/build/events/ticket-updated-event';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
