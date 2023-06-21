import { NotFoundError } from '@ferhatadibelli/ferhatadibelli/build/errors/not-found-error';
import { NotAuthorizedError } from '@ferhatadibelli/ferhatadibelli/build/errors/not-authorized-error';

import { requireAuth } from '@ferhatadibelli/ferhatadibelli/build/middlewares/require-auth';
import express, { NextFunction, Request, Response } from 'express';
import { Order } from '../models/orders';
const router = express.Router();

router.get(
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

    res.status(200).send(order);
  }
);

export { router as showOrderRouter };
