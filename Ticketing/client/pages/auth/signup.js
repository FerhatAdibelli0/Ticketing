import axios from 'axios';
import { useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { doRequest, error } = useRequest({
    url: '/api/users/signup',
    method: 'post',
    body: {
      email,
      password,
    },
    onSuccess: (data) => {
      Router.push('/');
    },
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    await doRequest();
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>SignUp Form</h1>
      <div className='form-group'>
        <label>Email</label>
        <input
          className='form-control'
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className='form-group'>
        <label>Password</label>
        <input
          type='password'
          className='form-control'
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error}
      <button type='submit' className='btn btn-primary mt-2'>
        SignUp
      </button>
    </form>
  );
};

export default Signup;
