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
      default: '#eceff1',
    },
  },
  typography: {
    fontFamily: ['Oswald'],
    fontWeightLight: 200,
    fontWeightRegular: 200,
    fontWeightMedium: 300,
  },
});

export default theme;
