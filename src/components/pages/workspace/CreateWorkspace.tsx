import { Box } from "@mui/material";
import CreateWorkspaceLayout from "../../layouts/CreateWorkspaceLayout";

export default function CreateWorkspace() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
      }}
    >
      <CreateWorkspaceLayout />
    </Box>
  );
}
