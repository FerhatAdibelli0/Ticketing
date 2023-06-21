import axios from 'axios';
import { useState } from 'react';

const useRequest = ({ url, method, body, onSuccess }) => {
  const [error, setError] = useState(null);

  async function doRequest(props = {}) {
    try {
      setError(null);
      const response = await axios[method](url, { ...body, ...props });
      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;
    } catch (error) {
      setError(
        <div className='alert alert-danger my-3'>
          <h4>Oooops..</h4>
          {error?.response?.data?.errors?.map((error) => (
            <li key={error.message}>{error.message}</li>
          ))}
        </div>
      );
    }
  }

  return { doRequest, error };
};

export default useRequest;
