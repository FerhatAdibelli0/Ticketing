import Router from 'next/router';
import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState('');

  const { doRequest, error } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: { orderId: order.id },
    onSuccess: () => Router.push('/orders'),
  });
  useEffect(() => {
    const findElapseTime = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findElapseTime();
    const timerId = setInterval(findElapseTime, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft < 0) {
    return <div>Order is expired</div>;
  }
  return (
    <div>
      Time left to pay : {timeLeft}
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        email={currentUser.email}
        amount={order.ticket.price * 100}
        stripeKey='pk_test_51KsTFdDUYVdahe16bV1JY3QF2ZNtMBhKm1wOLN0b8iabwcl2hzcA2bZFY4PGNeZmTY13jsfz1EX9TSlRAtK87VnQ00NqdRXCdE'
      />
      {error}
    </div>
  );
};
OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
