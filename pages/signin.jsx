import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { withRouter } from 'next/router';
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


class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMsg: '',
    };
  }

  async handleSubmit(event) {
    event.preventDefault();
    const { router } = this.props;

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
        this.setState({ errorMsg: getErrorMessage(error) });
      });
  }

  render() {
    const { errorMsg } = this.state;
    return (
      <>
        <h1>Sign In</h1>
        <form onSubmit={this.handleSubmit.bind(this)}>
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
}

SignIn.propTypes = {
  router: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(SignIn);
