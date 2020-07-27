import React from 'react';
import PropTypes from 'prop-types';
import { getSession } from 'next-auth/client';
import Layout from '../components/layout';

function Index({ session }) {
  return (
    <Layout session={session}>
      <main className="center">
        Let&apos;s go Elsewhere.
      </main>
    </Layout>
  );
}

Index.getInitialProps = async (context) => ({
  session: await getSession(context),
});

Index.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  session: PropTypes.object.isRequired,
};

export default Index;
