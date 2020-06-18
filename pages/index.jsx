import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'next/router';
import Layout from '../components/layout';
import { fetcher } from '../utils/fetcher';

const viewerQuery = `{
    viewer {
      id
      email
    }
  }`;

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
    };
  }

  componentDidMount() {
    const { router } = this.props;
    fetcher(viewerQuery)
      .then(({ viewer: { email } }) => {
        this.setState({
          email,
        });
      })
      .catch(() => {
        router.push('/signin');
      });
  }

  render() {
    const { email } = this.state;

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
}

Index.propTypes = {
  router: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(Index);
