import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'next/router';
import { fetcher } from '../utils/fetcher';
import Field from '../components/field';
import { getErrorMessage } from '../lib/form';

const createMapMutation = `
  mutation CreateMapMutation($name: String!) {
    createMap(name: $name)
  }
`;


class CreateMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMsg: '',
    };
  }

  async handleSubmit(event) {
    event.preventDefault();
    const { router } = this.props;

    const mapNameElement = event.currentTarget.elements.mapName;

    const vars = {
      name: mapNameElement.value,
    };

    fetcher(createMapMutation, vars)
      .then(({ createMap }) => {
        if (createMap !== '-1') {
          router.push('/profile');
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
            name="mapName"
            type="text"
            required
            label="Map Name"
          />
          <button type="submit">Create Map</button>
        </form>
      </>
    );
  }
}

CreateMap.propTypes = {
  router: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(CreateMap);
