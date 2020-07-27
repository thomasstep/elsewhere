import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/client';
import LoadingPage from '../components/loadingPage';

function SignOut() {
  const router = useRouter();

  useEffect(() => {
    signOut()
      .then(() => {
        router.push('/');
      });
  }, []);

  return <LoadingPage />;
}

export default SignOut;
