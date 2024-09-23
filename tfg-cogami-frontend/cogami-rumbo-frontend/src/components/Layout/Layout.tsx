import { Box } from "@mui/material";
import React from "react";
import Header from "../Header/Header";
import Body from "../Body/Body";

const Layout : React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Header />
      <Body />
    </Box>
  );
}

export default Layout
