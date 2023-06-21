import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publish';

console.clear();

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

stan.on('connect', async () => {
  console.log('Publisher connected to NATS');

  const publish = new TicketCreatedPublisher(stan);
  await publish.publish({
    id: '772',
    title: 'new-title',
    number: 35,
  });
});
