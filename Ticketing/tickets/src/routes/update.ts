import { NotFoundError } from '@ferhatadibelli/ferhatadibelli/build/errors/not-found-error';
import { NotAuthorizedError } from '@ferhatadibelli/ferhatadibelli/build/errors/not-authorized-error';
import { BadRequestError } from '@ferhatadibelli/ferhatadibelli/build/errors/bad-request-error';

import { requireAuth } from '@ferhatadibelli/ferhatadibelli/build/middlewares/require-auth';
import { validateRequest } from '@ferhatadibelli/ferhatadibelli/build/middlewares/validate-request';
import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/tickets';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title must be valid'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be valid'),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return next(new NotFoundError());
    }

    if (ticket.orderId) {
      return next(new BadRequestError('Cannot edit reserved ticket'));
    }

    if (ticket.userId !== req.currentUser!.id) {
      return next(new NotAuthorizedError());
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });

    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      price: +ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send({ ticket });
  }
);

export { router as updateTicketsRouter };
