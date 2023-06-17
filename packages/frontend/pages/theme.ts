import { createTheme } from '@mui/material/styles'

const font =  "'Lato', sans-serif";
export const theme = createTheme({
  typography: {
    fontFamily: font,
  },
  palette: {
    success: {
      main: '#17B890',
    },
    primary: {
      main: '#1B2F33',
    },
    secondary: {
      main: '#565656',
    },
    info: {
      main: '#858587'
    },
    warning: {
      main: '#ffd166'
    },
    error: {
      main: '#ef476f'
    }
  },
});