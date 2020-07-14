import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Field from '../components/field';
import Layout from '../components/layout';
import { getErrorMessage } from '../lib/form';
import { fetcher } from '../utils/fetcher';

const createMapMutation = `
  mutation CreateMapMutation($name: String!) {
    createMap(name: $name)
  }
`;


function CreateMap() {
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

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

export default CreateMap;
