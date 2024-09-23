import { createTheme, Theme } from "@mui/material";

const theme : Theme = createTheme({
    palette: {
        primary: {
            main: "#832756"
        },
        secondary: {
            main: "#ffffff"
        }
    },
    typography: {
        "fontFamily": `"Roboto", sans-serif`
    }
})

export default theme