import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingPage from '../components/loadingPage';
import { fetcher } from '../utils/fetcher';

const signOutMutation = `
  mutation SignOutMutation {
    signOut
  }
`;

function SignOut() {
  const router = useRouter();

  useEffect(() => {
    fetcher(signOutMutation)
      .then(() => {
        router.push('/signin');
      });
  }, [router]);

  return <LoadingPage />;
}

export default SignOut;
