import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/client';
import Layout from '../components/layout';
import { fetcher } from '../utils/fetcher';

const viewerQuery = `{
    viewer {
      id
      email
    }
  }`;

function Index() {
  // const [email, setEmail] = useState('');
  // const router = useRouter();
  const [ session, loading ] = useSession()

  // useEffect(() => {
  //   fetcher(viewerQuery)
  //     .then(({ viewer: { email: userEmail } }) => {
  //       setEmail(userEmail);
  //     })
  //     .catch(() => {
  //       router.push('/signin');
  //     });
  // });

  // if (email) {
  //   return (
  //     <Layout>
  //       <main className="center">
  //         Let&apos;s go Elsewhere.
  //       </main>
  //     </Layout>
  //   );
  // }

  // return <p>Loading...</p>;

  return (
    <p>
      {!session && (
        <>
          Not signed in
          <br />
          <a href="/api/auth/signin">Sign in</a>
        </>
      )}
      {session && (
        <>
          Signed in as
          {session.user.email}
          <br />
          <a href="/api/auth/signout">Sign out</a>
        </>
      )}
    </p>
  );
}

export default Index;
