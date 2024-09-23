import * as React from "react";
import * as ReactDOM from "react-dom/client";
import Layout from "./components/Layout/Layout";
import { ThemeProvider } from "@mui/material";
import theme from "./shared/Theme";
import { BrowserRouter } from "react-router-dom";
import { SnackBarProvider } from "./shared/components/SnackBarContext";
import SpinnerHandler, { SpinnerContext } from "./shared/components/SpinnerHandlerContext";
import { CookiesProvider } from "react-cookie";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CookiesProvider>
        <BrowserRouter>
          <SpinnerHandler children={ <SnackBarProvider children={<Layout />} /> } />
        </BrowserRouter>
      </CookiesProvider>
    </ThemeProvider>
  // </React.StrictMode>
);
