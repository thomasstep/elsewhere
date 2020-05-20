import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
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

    return (
      <React.Fragment key="top">
        <Fab onClick={this.toggleDrawer} style={style}>Nav</Fab>
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
              <Link href="/">
                <ListItem button key="Profile">
                  <ListItemIcon><AccountBoxIcon /></ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItem>
              </Link>
            </List>
          </div>
        </Drawer>
      </React.Fragment>
    );
  }
}

export default Header;
