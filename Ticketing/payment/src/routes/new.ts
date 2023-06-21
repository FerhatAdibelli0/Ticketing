import { NotFoundError } from '@ferhatadibelli/ferhatadibelli/build/errors/not-found-error';
import { NotAuthorizedError } from '@ferhatadibelli/ferhatadibelli/build/errors/not-authorized-error';
import { BadRequestError } from '@ferhatadibelli/ferhatadibelli/build/errors/bad-request-error';

import { requireAuth } from '@ferhatadibelli/ferhatadibelli/build/middlewares/require-auth';
import { validateRequest } from '@ferhatadibelli/ferhatadibelli/build/middlewares/validate-request';

import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { OrderStatus } from '@ferhatadibelli/ferhatadibelli/build/events/types/orders-status';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').not().isEmpty().withMessage('Token must be exist'),
    body('orderId').not().isEmpty().withMessage('OrderId must be exist'),
  ],
  validateRequest,
  async (req: Request, res: Response, next: Function) => {
    const { orderId, token } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return next(new NotFoundError());
    }

    if (order.userId !== req.currentUser!.id) {
      return next(new NotAuthorizedError());
    }

    if (order.status === OrderStatus.Cancelled) {
      return next(new BadRequestError('Cannot pay a cancelled order'));
    }

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });

    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
