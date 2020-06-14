import { createMuiTheme } from '@material-ui/core/styles';

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#546e7a',
    },
    secondary: {
      main: '#4db6ac',
    },
    background: {
      // default: '#e1e2e1',
      default: '#eceff1',
    },
  },
  typography: {
    // fontFamily: ['"Josefin Sans"'],
    fontFamily: ['Oswald'],
    fontWeightLight: 200,
    fontWeightRegular: 200,
    fontWeightMedium: 300,
  },
});

export default theme;
