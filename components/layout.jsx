import React from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';

import Header from './header';

function Layout(props) {
  const { children, mapPage, session } = props;
  return (
    <Box>
      <Header mapPage={mapPage} session={session} />
      {
        mapPage ? (
          <Box>
            {children}
          </Box>
        )
          : (
            <Box mt={3} px={5}>
              {children}
            </Box>
          )
      }
    </Box>
  );
}

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  mapPage: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  session: PropTypes.string,
};

Layout.defaultProps = {
  mapPage: false,
  session: null,
};


export default Layout;
