import { app } from '../../app';
import request from 'supertest';
import { Ticket } from '../../models/tickets';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to api/tickets for post request', async () => {
  const response = await request(app).post('/api/tickets').send({});
  expect(response.status).not.toEqual(404);
});
it('can only be accessed if the user is signed in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});
it('returns a status other than 401', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({});
  expect(response.status).not.toEqual(401);
});
it('returns an error if invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: '',
      price: 10,
    })
    .expect(400);
});
it('returns an error if invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      price: 10,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: 'title',
      price: -10,
    })
    .expect(400);
});
it('creates ticket with valid values', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  const title = 'Ferhat';
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title,
      price: '10',
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(title);
  expect(tickets[0].price).toEqual('10');
});

it('publish event successfully', async () => {
  const title = 'Ferhat';
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title,
      price: '10',
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
