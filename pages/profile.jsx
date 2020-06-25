import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'next/router';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
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

const styles = {
  gridItem: {
    textAlign: 'center',
  },
};

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
    const { classes } = this.props;

    if (id) {
      const sharedMaps = [...writableMaps, ...readableMaps];
      return (
        <Layout>
          <Grid container>
            <Grid item xs={12} />
            <Grid item xs={12} className={classes.gridItem}>
              <Typography variant="h3">Profile</Typography>
            </Grid>
            <Grid item xs={12} className={classes.gridItem}>
              <Typography variant="h5">{email}</Typography>
            </Grid>

            <Grid item xs={12}>
              {
              ownedMaps.length ? (
                <>
                  <Typography variant="h5">Your maps</Typography>
                  <MapList mapList={ownedMaps} />
                </>
              )
                : null
              }

              {
              sharedMaps.length ? (
                <>
                  <Typography variant="h5">Maps shared with you</Typography>
                  <MapList mapList={sharedMaps} />
                </>
              )
                : null
              }
            </Grid>
          </Grid>
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
  classes: PropTypes.shape(
    PropTypes.object,
  ).isRequired,
};

export default withRouter(withStyles(styles, { withTheme: true })(Profile));
