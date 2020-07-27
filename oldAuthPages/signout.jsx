import React from 'react';
import { useRouter } from 'next/router';
import { fetcher } from '../utils/fetcher';

const signOutMutation = `
  mutation SignOutMutation {
    signOut
  }
`;

function SignOut() {
  const router = useRouter();

  React.useEffect(() => {
    fetcher(signOutMutation)
      .then(() => {
        router.push('/signin');
      });
  }, [router]);

  return <p>Signing out...</p>;
}

export default SignOut;
