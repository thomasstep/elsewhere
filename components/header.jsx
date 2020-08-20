import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { makeStyles } from '@material-ui/core/styles';

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

const useStyles = makeStyles((theme) => ({
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
    marginLeft: theme.spacing(2),
  },
}));

function Header(props) {
  const [open, setOpen] = useState(false);
  const { mapPage, session } = props;
  const classes = useStyles(props);

  function toggleDrawer(event) {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setOpen(!open);
  }

  const navigationDrawer = (
    <Drawer anchor="top" open={open} onClose={(e) => toggleDrawer(e)}>
      <div
        role="presentation"
        onClick={(e) => toggleDrawer(e)}
        onKeyDown={(e) => toggleDrawer(e)}
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
          {
            session
              ? (
                <Link href="/signout">
                  <ListItem button key="Sign Out">
                    <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                    <ListItemText primary="Sign Out" />
                  </ListItem>
                </Link>
              ) : (
                <Link href="/signin">
                  <ListItem button key="Sign In">
                    <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                    <ListItemText primary="Sign In" />
                  </ListItem>
                </Link>
              )
          }
        </List>
      </div>
    </Drawer>
  );

  return mapPage ? (
    <React.Fragment key="top">
      <Fab onClick={(e) => toggleDrawer(e)} className={classes.fab}>
        <MenuIcon className={classes.menuIcon} />
      </Fab>
      {navigationDrawer}
    </React.Fragment>
  )
    : (
      <>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton onClick={(e) => toggleDrawer(e)} className={classes.iconButton} edge="start" aria-label="menu">
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

Header.propTypes = {
  mapPage: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  session: PropTypes.object,
};

Header.defaultProps = {
  mapPage: false,
  session: null,
};

export default Header;
