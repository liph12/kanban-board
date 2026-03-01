import SideBar from "../SideBar";
import { Box, Container } from "@mui/material";
import AppBar from "../AppBar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      <SideBar />
      <Box sx={{ width: "100%" }}>
        <AppBar />
        <Container
          maxWidth="lg"
          sx={{
            overflow: "auto",
            scrollBehavior: "smooth",
            height: "88vh",
            py: 2,
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
