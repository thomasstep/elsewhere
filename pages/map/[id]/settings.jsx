import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';

import { fetcher } from '../../../utils/fetcher';
import Layout from '../../../components/layout';

const styles = (theme) => ({
  deleteButton: {
    backgroundColor: theme.palette.error.main,
  },
});

const deleteMapMutation = `mutation deleteMap (
  $mapId: ID!
){
  deleteMap(mapId: $mapId)
}`;

class ElsewhereMapSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mapId: props.router.query.id,
    };

    this.deleteMap = this.deleteMap.bind(this);
  }

  // componentDidMount() {
  //   const { router } = this.props;
  //   fetcher(getMarkers(router.query.id)).then(({ getMarkers: markers }) => {
  //     this.setState({
  //       markers,
  //     });
  //   });
  // }

  async deleteMap(event) {
    event.preventDefault();
    const { mapId } = this.state;

    const { deleteMap: success } = await fetcher(deleteMapMutation, { mapId });
    if (!success) return;

    const { router } = this.props;
    router.push('/profile');
  }


  render() {
    const { router, classes } = this.props;

    return (
      <Layout>
        <p>Settings Page</p>
        <p>{router.query.id}</p>
        <Button
          variant="contained"
          className={classes.deleteButton}
          startIcon={<DeleteIcon />}
          onClick={(e) => this.deleteMap(e)}
        >
          Delete
        </Button>
      </Layout>
    );
  }
}

ElsewhereMapSettings.propTypes = {
  router: PropTypes.shape({
    push: PropTypes.func.isRequired,
    query: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  classes: PropTypes.shape(
    PropTypes.object,
  ).isRequired,
};

export default withRouter(withStyles(styles, { withTheme: true })(ElsewhereMapSettings));
