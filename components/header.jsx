import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
// import { makeStyles } from '@mui/styles';

// Menu bar
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

// Floating menu
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

// const useStyles = makeStyles((theme) => ({
//   fab: {
//     left: 'calc(50% - 28px)',
//     top: theme.spacing(1),
//     position: 'fixed',
//     zIndex: theme.zIndex.appBar,
//     backgroundColor: theme.palette.primary.main,
//     '&:hover': {
//       backgroundColor: theme.palette.primary.dark,
//     },
//   },
//   appBar: {
//     position: 'static',
//   },
//   iconButton: {
//     '&:hover': {
//       backgroundColor: theme.palette.primary.dark,
//     },
//   },
//   menuIcon: {
//     color: 'white',
//   },
//   typography: {
//     flexGrow: 1,
//     align: 'center',
//     marginLeft: theme.spacing(2),
//   },
// }));

function Header(props) {
  const [open, setOpen] = useState(false);
  const { mapPage, session } = props;
  // const classes = useStyles(props);

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
                <>
                  <Link href="/signin">
                    <ListItem button key="Sign In">
                      <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                      <ListItemText primary="Sign In" />
                    </ListItem>
                  </Link>
                  <Link href="/signup">
                    <ListItem button key="Sign Up">
                      <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                      <ListItemText primary="Sign Up" />
                    </ListItem>
                  </Link>
                </>
              )
          }
        </List>
      </div>
    </Drawer>
  );

  return mapPage ? (
    <>
      <Fab
        onClick={(e) => toggleDrawer(e)}
        // className={classes.fab}
      >
        <MenuIcon
          // className={classes.menuIcon}
        />
      </Fab>
      {navigationDrawer}
    </>
  )
    : (
      <>
        <AppBar
          // className={classes.appBar}
        >
          <Toolbar>
            <IconButton
              onClick={(e) => toggleDrawer(e)}
              // className={classes.iconButton}
              edge="start"
              aria-label="menu"
            >
              <MenuIcon
                // className={classes.menuIcon}
              />
            </IconButton>
            <Typography
              variant="h5"
              // className={classes.typography}
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
  session: PropTypes.string,
};

Header.defaultProps = {
  mapPage: false,
  session: null,
};

export default Header;
