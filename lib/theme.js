import { createMuiTheme } from '@material-ui/core/styles';

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#002f37',
    },
    secondary: {
      main: '#640055',
    },
    success: {
      main: '#236100',
    },
    error: {
      main: '#b91b00',
    },
    warning: {
      main: '#6c7e00',
    },
    background: {
      default: '#f4f4f4',
    },
  },
  typography: {
    fontFamily: ['Lato'],
    // fontWeightLight: 200,
    // fontWeightRegular: 300,
    // fontWeightMedium: 400,
  },
});

export default theme;
