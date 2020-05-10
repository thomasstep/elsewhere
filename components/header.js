import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import Link from 'next/link';


const useStyles = makeStyles({
  list: {
    width: 250,
  }
});

const style = {
  margin: 0,
  top: 10,
  left: '50%',
  position: 'fixed',
  zIndex: 100,
};

export default function Header() {
  const classes = useStyles();
  const [state, setState] = React.useState({
    open: false,
  });

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, open });
  };

  const list = () => (
    <div
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <Link href='/'>
          <ListItem button key={'Home'}>
            <ListItemIcon>{<HomeIcon/>}</ListItemIcon>
            <ListItemText primary={'Home'} />
          </ListItem>
        </Link>
        <Link href='/'>
          <ListItem button key={'Profile'}>
            <ListItemIcon>{<AccountBoxIcon/>}</ListItemIcon>
            <ListItemText primary={'Profile'} />
          </ListItem>
        </Link>
      </List>
    </div>
  );

  return (
    <React.Fragment key='top'>
      <Fab onClick={toggleDrawer(true)} style={style}>Nav</Fab>
      <Drawer anchor='top' open={state.open} onClose={toggleDrawer(false)}>
        {list()}
      </Drawer>
    </React.Fragment>
  );
}
