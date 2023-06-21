import { Listener } from '@ferhatadibelli/ferhatadibelli/build/events/base-listener';
import { Subjects } from '@ferhatadibelli/ferhatadibelli/build/events/subjects';
import { PaymentCreatedEvent } from '@ferhatadibelli/ferhatadibelli/build/events/payment-created-event';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queue-group-name';
import { Order } from '../../models/orders';
import { OrderStatus } from '@ferhatadibelli/ferhatadibelli/build/events/types/orders-status';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const { orderId } = data;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found!');
    }

    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }

    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();

    msg.ack();
  }
}
