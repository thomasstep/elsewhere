import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#2A9D8F',
    },
    secondary: {
      main: '#264653',
    },
    success: {
      main: '#2A9D8F',
    },
    error: {
      main: '#E76F51',
    },
    warning: {
      main: '#E9C46A',
    },
    background: {
      default: '#f4f4f4',
    },
    text: {
      primary: '#264653',
    },
  },
  typography: {
    fontFamily: ['Lato'],
    // fontWeightLight: 200,
    // fontWeightRegular: 300,
    // fontWeightMedium: 400,
  },
  shape: {
    borderRadius: 0,
  },
});

export default theme;
