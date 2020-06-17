import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import React from 'react';

import { fetcher } from '../../../utils/fetcher';
import Layout from '../../../components/layout';

class ElsewhereMapSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  // componentDidMount() {
  //   const { router } = this.props;
  //   fetcher(getMarkers(router.query.id)).then(({ getMarkers: markers }) => {
  //     this.setState({
  //       markers,
  //     });
  //   });
  // }


  render() {
    const { router } = this.props;

    return (
      <Layout>
        <p>Settings Page</p>
        <p>{router.query.id}</p>
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
};

export default withRouter(ElsewhereMapSettings);
