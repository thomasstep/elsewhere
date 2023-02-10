import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      // main: '#2A9D8F',
      main: '#72a87a',
    },
    secondary: {
      // main: '#264653',
      main: '#72a0a8', // triadic
    },
    success: {
      // main: '#2A9D8F',
      main: '#7a72a8', // triadic
    },
    error: {
      // main: '#E76F51',
      main: '#a872a0', // complementary
    },
    warning: {
      // main: '#E9C46A',
      main: '#a872a0', // complementary
    },
    background: {
      default: '#f4f4f4',
    },
    text: {
      // primary: '#264653',
      // primary: '#49554A', // 900 weight of primary
      primary: '#2b3f33', // 900 weight of analogous
    },
  },
  typography: {
    fontFamily: ['Lato'],
    // fontWeightLight: 200,
    // fontWeightRegular: 300,
    // fontWeightMedium: 400,
  },
  // shape: {
  //   borderRadius: 0,
  // },
});

export default theme;
