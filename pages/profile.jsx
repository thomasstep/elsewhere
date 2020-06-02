import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'next/router';
import Layout from '../components/layout';
import MapList from '../components/mapList';
import { fetcher } from '../utils/fetcher';

const viewerQuery = `{
    viewer {
      id
      email
      ownedMaps
      readableMaps
      writableMaps
    }
  }`;

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {
        id: '',
        email: '',
        ownedMaps: [],
        readableMaps: [],
        writableMaps: [],
      },
    };
  }

  componentDidMount() {
    const { router } = this.props;
    fetcher(viewerQuery)
      .then(({ viewer }) => {
        this.setState({
          userInfo: viewer,
        });
      })
      .catch(() => {
        router.push('/signin');
      });
  }

  render() {
    const {
      userInfo: {
        id,
        email,
        ownedMaps,
        readableMaps,
        writableMaps,
      },
    } = this.state;

    if (id) {
      const sharedMaps = [...writableMaps, ...readableMaps];
      return (
        <Layout>
          <h1>Profile</h1>
          <h3>{email}</h3>

          {
          ownedMaps.length ? (
            <>
              <h1>Your maps</h1>
              <MapList mapList={ownedMaps} />
            </>
          )
            : null
          }

          {
          sharedMaps.length ? (
            <>
              <h1>Maps shared with you</h1>
              <MapList mapList={sharedMaps} />
            </>
          )
            : null
          }
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
