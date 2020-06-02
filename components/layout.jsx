import React from 'react';
import PropTypes from 'prop-types';

import Header from './header';

const layoutStyle = {
  width: '100%',
  height: '100%',
};

const Layout = (props) => {
  const { children } = props;
  return (
    <div style={layoutStyle}>
      <Header />
      {children}
      <style jsx global>
        {`
        body {
          margin: 0;
      `}
      </style>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

export default Layout;
