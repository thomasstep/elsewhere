import React from 'react';
import PropTypes from 'prop-types';
import { InfoWindow } from 'google-maps-react';
import ReactDOM from 'react-dom';

class ElsewhereInfoWindow extends React.Component {
  constructor(props) {
    super(props);
    this.infoWindowRef = React.createRef();
    this.contentElement = document.createElement('div');
  }

  componentDidUpdate(prevProps) {
    const { children } = this.props;
    if (children !== prevProps.children) {
      ReactDOM.render(
        React.Children.only(children),
        this.contentElement,
      );
      this.infoWindowRef.current.infowindow.setContent(this.contentElement);
    }
  }

  render() {
    return <InfoWindow ref={this.infoWindowRef} {...this.props} />;
  }
}

ElsewhereInfoWindow.propTypes = {
  children: PropTypes.element.isRequired,
};

export default ElsewhereInfoWindow;
