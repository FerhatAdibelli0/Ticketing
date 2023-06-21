import { NotAuthorizedError } from '@ferhatadibelli/ferhatadibelli/build/errors/not-authorized-error';
import { NotFoundError } from '@ferhatadibelli/ferhatadibelli/build/errors/not-found-error';
import { OrderStatus } from '@ferhatadibelli/ferhatadibelli/build/events/types/orders-status';
import { requireAuth } from '@ferhatadibelli/ferhatadibelli/build/middlewares/require-auth';
import express, { NextFunction, Request, Response } from 'express';
import { OrderCancelledPublisher } from '../events/publisher/order-cancelled-publisher';
import { Order } from '../models/orders';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');

    if (!order) {
      return next(new NotFoundError());
    }

    if (order.userId !== req.currentUser!.id) {
      return next(new NotAuthorizedError());
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    //Publish an event
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
