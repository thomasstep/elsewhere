import React from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';

import Header from './header';

const Layout = (props) => {
  const { children, mapPage } = props;
  return (
    <Box>
      <Header mapPage={mapPage} />
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
};

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  mapPage: PropTypes.bool,
};

Layout.defaultProps = {
  mapPage: false,
};


export default Layout;
