import useRequest from '../../hooks/use-request';
import { useEffect } from 'react';
import Router from 'next/router';
import buildClient from '../../api/build-client';
const Singout = () => {
  const { doRequest } = useRequest({
    url: '/api/users/signout',
    method: 'post',
    body: {},
    onSuccess: () => Router.push('/'),
  });

  useEffect(() => {
    doRequest();
  }, []);
  return <div>{'You are signedOut successfully'}</div>;
};

export default Singout;
