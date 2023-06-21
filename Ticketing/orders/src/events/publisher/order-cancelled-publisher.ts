import { Publisher } from '@ferhatadibelli/ferhatadibelli/build/events/base-publisher';
import { Subjects } from '@ferhatadibelli/ferhatadibelli/build/events/subjects';
import { OrderCancelledEvent } from '@ferhatadibelli/ferhatadibelli/build/events/order-cancelled-event';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
