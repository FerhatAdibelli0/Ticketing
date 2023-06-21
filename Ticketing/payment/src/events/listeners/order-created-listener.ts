import { Listener } from '@ferhatadibelli/ferhatadibelli/build/events/base-listener';
import { OrderCreatedEvent } from '@ferhatadibelli/ferhatadibelli/build/events/order-created-event';
import { Subjects } from '@ferhatadibelli/ferhatadibelli/build/events/subjects';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from '../queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      status: data.status,
      price: data.ticket.price,
      userId: data.userId,
      version: data.version,
    });

    await order.save();

    msg.ack();
  }
}
