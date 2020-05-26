import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { withRouter } from 'next/router';
import Layout from '../components/layout';
import { fetcher } from '../utils/fetcher';

const viewerQuery = `{
    viewer {
      id
      email
    }
  }`;

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
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
    const { userInfo } = this.state;

    if (userInfo) {
      return (
        <Layout>
          <main className="center">
            <Link href="/map/[id]" as="/map/1">
              <a>Go to a map</a>
            </Link>
          </main>
        </Layout>
      );
    }

    return <p>Loading...</p>;
  }
}

Profile.propTypes = {
  router: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(Profile);
