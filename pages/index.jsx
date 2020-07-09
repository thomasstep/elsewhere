import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout';
import { fetcher } from '../utils/fetcher';

const viewerQuery = `{
    viewer {
      id
      email
    }
  }`;

function Index() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetcher(viewerQuery)
      .then(({ viewer: { email: userEmail } }) => {
        setEmail(userEmail);
      })
      .catch(() => {
        router.push('/signin');
      });
  });

  if (email) {
    return (
      <Layout>
        <main className="center">
          Let&apos;s go Elsewhere.
        </main>
      </Layout>
    );
  }

  return <p>Loading...</p>;
}

export default Index;
