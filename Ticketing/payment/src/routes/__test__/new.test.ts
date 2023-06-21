import { app } from '../../app';
import request from 'supertest';
import { Order } from '../../models/order';
import mongoose from 'mongoose';
import { OrderStatus } from '@ferhatadibelli/ferhatadibelli/build/events/types/orders-status';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

// jest.mock('../../stripe.ts');

it('returns 404 when purchesing a order that doesnt exist', async () => {
  await request(app).post('/api/payments').set('Cookie', signin()).send({
    token: 'wedwedwedwed',
    orderId: new mongoose.Types.ObjectId().toHexString(),
  });
  expect(404);
});

it('returns 401 when purchasing an order that doesnt belong to the user', async () => {
  const order = Order.build({
    price: 35,
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: '123456',
    status: OrderStatus.Created,
    version: 0,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      token: 'wedwedwedwed',
      orderId: order.id,
    })
    .expect(401);
});

it('returns 400 when purchasing cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    price: 35,
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    status: OrderStatus.Cancelled,
    version: 0,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({
      token: 'wedwedwedwed',
      orderId: order.id,
    })
    .expect(400);
});

it('returns 204 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  const order = Order.build({
    price,
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    status: OrderStatus.Created,
    version: 0,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const stripeChanges = await stripe.charges.list({ limit: 50 });

  const relevantCharge = stripeChanges.data.find(
    (charge) => charge.amount === price * 100
  );

  expect(relevantCharge).toBeDefined();
  expect(relevantCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: relevantCharge!.id,
  });

  expect(payment).not.toBeNull();
});
