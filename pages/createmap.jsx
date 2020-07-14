import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/client';
import Field from '../components/field';
import Layout from '../components/layout';
import { getErrorMessage } from '../lib/form';
import { fetcher } from '../utils/fetcher';

const createMapMutation = `
  mutation CreateMapMutation($name: String!) {
    createMap(name: $name)
  }
`;

function CreateMap({ session }) {
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!session) router.push('/api/auth/signin');
  });

  async function handleSubmit(event) {
    event.preventDefault();

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
        setErrorMsg(getErrorMessage(error));
      });
  }

  return (
    <Layout>
      <h1>Create a new map</h1>
      <form onSubmit={handleSubmit}>
        {errorMsg && <p>{errorMsg}</p>}
        <Field
          name="mapName"
          type="text"
          required
          label="Map Name"
          autoComplete="false"
        />
        <button type="submit">Create Map</button>
      </form>
    </Layout>
  );
}

CreateMap.getInitialProps = async (context) => ({
  session: await getSession(context),
});

CreateMap.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  session: PropTypes.object.isRequired,
};

export default CreateMap;
