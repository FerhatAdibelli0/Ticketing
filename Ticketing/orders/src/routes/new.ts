import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '@ferhatadibelli/ferhatadibelli/build/middlewares/require-auth';
import { validateRequest } from '@ferhatadibelli/ferhatadibelli/build/middlewares/validate-request';

import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { NotFoundError } from '@ferhatadibelli/ferhatadibelli/build/errors/not-found-error';
import { BadRequestError } from '@ferhatadibelli/ferhatadibelli/build/errors/bad-request-error';

import { Order } from '../models/orders';
import { OrderStatus } from '@ferhatadibelli/ferhatadibelli/build/events/types/orders-status';
import { OrderCreatedPublisher } from '../events/publisher/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const EXPARATION_SECONDS = 1 * 60;
const router = express.Router();

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('ticketId must be valid'),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const { ticketId } = req.body;
    //find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return next(new NotFoundError());
    }

    //Make sure the ticket is not already reserved
    const isReserved = await ticket.isReserved();

    if (isReserved) {
      return next(new BadRequestError('Ticket is already reserved'));
    }

    //calculate exparation date for this ticket
    const exparation = new Date();
    exparation.setSeconds(exparation.getSeconds() + EXPARATION_SECONDS);

    //build an order and save it

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: exparation,
      ticket: ticket,
    });

    await order.save();

    //Publish this created order
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
