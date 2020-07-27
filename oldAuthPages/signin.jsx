import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { fetcher } from '../utils/fetcher';
import Field from '../components/field';
import { getErrorMessage } from '../lib/form';

const signInMutation = `
  mutation SignInMutation($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      user {
        id
        email
      }
    }
  }
`;


function SignIn() {
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();

    const emailElement = event.currentTarget.elements.email;
    const passwordElement = event.currentTarget.elements.password;

    const vars = {
      email: emailElement.value,
      password: passwordElement.value,
    };

    fetcher(signInMutation, vars)
      .then(({ signIn: { user } }) => {
        if (user) {
          router.push('/');
        }
      })
      .catch((error) => {
        setErrorMsg(getErrorMessage(error));
      });
  }

  return (
    <>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        {errorMsg && <p>{errorMsg}</p>}
        <Field
          name="email"
          type="email"
          autoComplete="email"
          required
          label="Email"
        />
        <Field
          name="password"
          type="password"
          autoComplete="password"
          required
          label="Password"
        />
        <button type="submit">Sign in</button>
        {' '}
        or
        {' '}
        <Link href="signup" passHref>
          <a>Sign up</a>
        </Link>
      </form>
    </>
  );
}

export default SignIn;
