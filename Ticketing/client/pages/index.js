import Link from 'next/link';

const HomePage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((item) => (
    <tr key={item.id}>
      <td>{item.title}</td>
      <td>{item.price}</td>
      <td>
        <Link href={`/tickets/${item.id}`}>View</Link>
      </td>
    </tr>
  ));

  return (
    <div>
      <table className='table'>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

HomePage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');
  return { tickets: data };
};

export default HomePage;
