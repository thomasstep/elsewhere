import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { withStyles } from '@material-ui/core/styles';

// Menu bar
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

// Floating menu
import Drawer from '@material-ui/core/Drawer';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import MapIcon from '@material-ui/icons/Map';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import { signout } from 'next-auth/client';

const styles = (theme) => ({
  fab: {
    margin: 0,
    top: 10,
    left: '50%',
    position: 'fixed',
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    position: 'static',
  },
  iconButton: {
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  menuIcon: {
    color: 'white',
  },
  typography: {
    flexGrow: 1,
    align: 'center',
    // marginTop: '6px',
    marginLeft: theme.spacing(2),
  },
});

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
    const { mapPage, classes, session } = this.props;
    const navigationDrawer = (
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
            <Link href="/createmap">
              <ListItem button key="Create Map">
                <ListItemIcon><MapIcon /></ListItemIcon>
                <ListItemText primary="Create Map" />
              </ListItem>
            </Link>
            {
              session
                ? (
                  <ListItem button key="Sign Out" onClick={signout}>
                    <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                    <ListItemText primary="Sign Out" />
                  </ListItem>
                ) : null
            }
          </List>
        </div>
      </Drawer>
    );

    return mapPage ? (
      <React.Fragment key="top">
        <Fab onClick={this.toggleDrawer} className={classes.fab}>
          <MenuIcon className={classes.menuIcon} />
        </Fab>
        {navigationDrawer}
      </React.Fragment>
    )
      : (
        <>
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton onClick={this.toggleDrawer} className={classes.iconButton} edge="start" aria-label="menu">
                <MenuIcon className={classes.menuIcon} />
              </IconButton>
              <Typography
                variant="h5"
                className={classes.typography}
              >
                Elsewhere
              </Typography>
            </Toolbar>
          </AppBar>
          {navigationDrawer}
        </>
      );
  }
}

Header.propTypes = {
  mapPage: PropTypes.bool,
  classes: PropTypes.shape(
    PropTypes.object,
  ).isRequired,
};

Header.defaultProps = {
  mapPage: false,
  // classes: {},
};

export default withStyles(styles, { withTheme: true })(Header);
