import React from 'react';
import PropTypes from 'prop-types';

import Header from './header';

const layoutStyle = {
  width: '100%',
  height: '100%',
};

const Layout = (props) => {
  const { children, floating } = props;
  return (
    <div style={layoutStyle}>
      <Header floating={floating} />
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
  floating: PropTypes.bool,
};

Layout.defaultProps = {
  floating: false,
};


export default Layout;
