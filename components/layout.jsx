import React from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';

import Header from './header';

const Layout = (props) => {
  const { children, floating } = props;
  return (
    <Box>
      <Header floating={floating} />
      <Box mt={3} px={5}>
        {children}
      </Box>
      {/* <style jsx global>
        {`
        body {
          margin: 0;
      `}
      </style> */}
    </Box>
  );
};

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  floating: PropTypes.bool,
};

Layout.defaultProps = {
  floating: false,
};


export default Layout;
