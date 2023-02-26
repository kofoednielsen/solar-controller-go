import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const themeLight = createTheme({
  typography: {
    fontFamily: "Roboto"
  }
});


root.render(
  <React.StrictMode>
    <ThemeProvider  theme={themeLight}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
