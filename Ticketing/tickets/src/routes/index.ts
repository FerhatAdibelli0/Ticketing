import express, { NextFunction, Request, Response } from 'express';
import { Ticket } from '../models/tickets';

const router = express.Router();

router.get(
  '/api/tickets',
  async (req: Request, res: Response, next: NextFunction) => {
    const ticket = await Ticket.find({
      orderId: undefined,
    });
    res.status(200).send(ticket);
  }
);

export { router as indexTicketsRouter };
