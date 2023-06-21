import { Publisher } from '@ferhatadibelli/ferhatadibelli/build/events/base-publisher';
import { Subjects } from '@ferhatadibelli/ferhatadibelli/build/events/subjects';
import { OrderCreatedEvent } from '@ferhatadibelli/ferhatadibelli/build/events/order-created-event';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
