import { Box } from "@mui/material";
import CreateProjectLayout from "../layouts/CreateProjectLayout";
import { useParams } from "react-router-dom";

export default function CreateProject() {
  const { workspace_id } = useParams();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
      }}
    >
      {workspace_id && <CreateProjectLayout workspace_id={workspace_id} />}
    </Box>
  );
}
