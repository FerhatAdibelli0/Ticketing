import { NotFoundError } from '@ferhatadibelli/ferhatadibelli/build/errors/not-found-error';

import express, { NextFunction, Request, Response } from 'express';
import { Ticket } from '../models/tickets';
const router = express.Router();

router.get(
  '/api/tickets/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return next(new NotFoundError());
      }
      res.status(200).send({ ticket });
    } catch (error) {
      console.log(error);
    }
  }
);

export { router as showTicketsRouter };
