import { Listener } from '@ferhatadibelli/ferhatadibelli/build/events/base-listener';
import { Subjects } from '@ferhatadibelli/ferhatadibelli/build/events/subjects';
import { ExperationCreatedEvent } from '@ferhatadibelli/ferhatadibelli/build/events/experation-created-event';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queue-group-name';
import { Order } from '../../models/orders';
import { OrderStatus } from '@ferhatadibelli/ferhatadibelli/build/events/types/orders-status';
import { OrderCancelledPublisher } from '../publisher/order-cancelled-publisher';

export class ExperitionCreatedListener extends Listener<ExperationCreatedEvent> {
  readonly subject = Subjects.ExperationCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: ExperationCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}
