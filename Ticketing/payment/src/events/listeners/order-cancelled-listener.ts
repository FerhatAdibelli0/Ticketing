import { OrderCancelledEvent } from '@ferhatadibelli/ferhatadibelli/build/events/order-cancelled-event';
import { OrderStatus } from '@ferhatadibelli/ferhatadibelli/build/events/types/orders-status';
import { Listener } from '@ferhatadibelli/ferhatadibelli/build/events/base-listener';
import { Subjects } from '@ferhatadibelli/ferhatadibelli/build/events/subjects';
import { queueGroupName } from '../queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findById({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error('No order found');
    }

    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();
    msg.ack();
  }
}
