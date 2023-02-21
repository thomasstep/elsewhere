import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      // main: '#72a87a',
      main: '#94d2a5',
    },
    secondary: {
      // main: '#72a0a8', // triadic
      main: '#94c1d2', // triadic
    },
    success: {
      // main: '#7a72a8', // triadic
      main: '#94c1d2', // triadic
    },
    error: {
      // main: '#a872a0', // complementary
      main: '#d294c1', // complementary
    },
    warning: {
      // main: '#a872a0', // complementary
      main: '#d294c1', // complementary
    },
    background: {
      default: '#f4f4f4',
    },
    text: {
      // primary: '#2b3f33', // 900 weight of analogous
      primary: '#295846', // 900 weight of analogous
    },
  },
  typography: {
    fontFamily: ['Lato'],
    // fontWeightLight: 200,
    // fontWeightRegular: 300,
    // fontWeightMedium: 400,
  },
  components: {
    MuiDivider: {
      styleOverrides: {
        textAlignLeft: {
          '&::before': {
            width: '0%',
          },
          '&::after': {
            width: '100%',
          },
        },
      },
    },
  },
});

export default theme;
