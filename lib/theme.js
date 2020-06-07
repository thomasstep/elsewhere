import { createMuiTheme } from '@material-ui/core/styles';

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#80cbc4',
    },
    secondary: {
      main: '#cb8087',
    },
    background: {
      default: '#e1e2e1',
    },
  },
  typography: {
    fontFamily: ['"Josefin Sans"'],
  },
});

export default theme;
