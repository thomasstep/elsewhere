import React from 'react';
import PropTypes from 'prop-types';
// Menu bar
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
// Floating menu
import Drawer from '@material-ui/core/Drawer';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HomeIcon from '@material-ui/icons/Home';
import AccountBoxIcon from '@material-ui/icons/AccountBox';

import Link from 'next/link';

const style = {
  margin: 0,
  top: 10,
  left: '50%',
  position: 'fixed',
  zIndex: 100,
};

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.toggleDrawer = this.toggleDrawer.bind(this);
  }

  toggleDrawer(event) {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    const { open } = this.state;

    this.setState({ open: !open });
  }

  render() {
    const { open } = this.state;
    const { floating } = this.props;

    return floating ? (
      <React.Fragment key="top">
        <Fab onClick={this.toggleDrawer} style={style}><ExpandMoreIcon /></Fab>
        <Drawer anchor="top" open={open} onClose={this.toggleDrawer}>
          <div
            role="presentation"
            onClick={this.toggleDrawer}
            onKeyDown={this.toggleDrawer}
          >
            <List>
              <Link href="/">
                <ListItem button key="Home">
                  <ListItemIcon><HomeIcon /></ListItemIcon>
                  <ListItemText primary="Home" />
                </ListItem>
              </Link>
              <Link href="/profile">
                <ListItem button key="Profile">
                  <ListItemIcon><AccountBoxIcon /></ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItem>
              </Link>
            </List>
          </div>
        </Drawer>
      </React.Fragment>
    )
      : (
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">
              Elsewhere
            </Typography>
            <Button color="inherit">Login</Button>
          </Toolbar>
        </AppBar>
      );
  }
}

Header.propTypes = {
  floating: PropTypes.bool,
};

Header.defaultProps = {
  floating: false,
};

export default Header;
