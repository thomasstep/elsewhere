import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import Header from './header';

function Layout(props) {
  const { children, session } = props;
  return (
    <Box>
      <Header session={session} />
      <Box
        sx={{
          mt: {
            xs: 5,
          },
          px: {
            xs: 1,
            md: 5,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  session: PropTypes.string,
};

Layout.defaultProps = {
  session: null,
};


export default Layout;
