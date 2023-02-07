import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
// import { makeStyles } from '@mui/styles';

// Menu bar
import AppBar from '@mui/material/AppBar';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
// Icons
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

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
  const { session } = props;
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
          <ListItem key="Home">
            <ListItemButton component={Link} href="/">
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          {
            session
              ? (
                <>
                  <ListItem key="Profile">
                    <ListItemButton component={Link} href="/profile">
                      <ListItemIcon>
                        <AccountBoxIcon />
                      </ListItemIcon>
                      <ListItemText primary="Profile" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem key="Sign Out">
                    <ListItemButton component={Link} href="/signout">
                      <ListItemIcon>
                        <LogoutIcon />
                      </ListItemIcon>
                      <ListItemText primary="Sign Out" />
                    </ListItemButton>
                  </ListItem>
                </>
              ) : (
                <>
                  <ListItem key="Sign In">
                    <ListItemButton component={Link} href="/signin">
                      <ListItemIcon>
                        <LoginIcon />
                      </ListItemIcon>
                      <ListItemText primary="Sign In" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem key="Sign Up">
                    <ListItemButton component={Link} href="/signup">
                      <ListItemIcon>
                        <AddIcon />
                      </ListItemIcon>
                      <ListItemText primary="Sign Up" />
                    </ListItemButton>
                  </ListItem>
                </>
              )
          }
        </List>
      </div>
    </Drawer>
  );

  return (
    <>
      <AppBar>
        <Toolbar>
          <IconButton
            onClick={(e) => toggleDrawer(e)}
            // className={classes.iconButton}
            edge="start"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h5"
            // className={classes.typography}
          >
            Elsewhere
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar />
      {navigationDrawer}
    </>
  );
}

Header.propTypes = {
  session: PropTypes.string,
};

Header.defaultProps = {
  session: null,
};

export default Header;
