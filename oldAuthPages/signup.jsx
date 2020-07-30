import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { fetcher } from '../utils/fetcher';
import Field from '../components/field';
import { getErrorMessage } from '../lib/form';

const signUpMutation = `
  mutation SignUpMutation($email: String!, $password: String!) {
    signUp(input: { email: $email, password: $password }) {
      user {
        id
        email
      }
    }
  }
`;


function SignUp() {
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

    fetcher(signUpMutation, vars)
      .then(() => {
        router.push('/signin');
      })
      .catch((error) => {
        setErrorMsg(getErrorMessage(error));
      });
  }

  return (
    <>
      <h1>Sign Up</h1>
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
        <button type="submit">Sign up</button>
        {' '}
        or
        {' '}
        <Link href="signin" passHref>
          <a>Sign in</a>
        </Link>
      </form>
    </>
  );
}

SignUp.propTypes = {
  router: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default SignUp;
