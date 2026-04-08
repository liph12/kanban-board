import { Box, Grid, Typography } from "@mui/material";
import { useWorkspaceContext } from "../../../providers/WorkspaceProvider";
import { AddRounded, CreateNewFolderOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";
import ProjectCard from "../../utils/ProjectCard";
import { useParams } from "react-router-dom";
import StyledButton from "../../utils/StyledButton";

export default function WorkspaceProjects() {
  const { workspaces } = useWorkspaceContext();
  const { workspace_id } = useParams();
  const workspace = workspaces?.find((w) => w.id === workspace_id);
  const projects = workspace?.projects ?? [];

  return (
    <Box>
      {workspace_id && (
        <>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Typography variant="h6" fontWeight={700}>
              {workspace?.title}
            </Typography>
            {projects && projects?.length > 0 && (
              <Box
                component={Link}
                to={`/workspace/${workspace_id}/create-project`}
                sx={{ color: "#333" }}
              >
                <StyledButton
                  color="primary"
                  variant="contained"
                  sx={{ borderRadius: 2 }}
                  size="small"
                  startIcon={<AddRounded />}
                >
                  Create project
                </StyledButton>
              </Box>
            )}
          </Box>
          <Box sx={{ mt: 2 }}>
            {projects.length ? (
              <>
                <Grid container spacing={2}>
                  {projects?.map((p) => (
                    <Grid size={{ lg: 3, md: 6, xs: 12 }} key={p.id}>
                      <ProjectCard project={p} workspaceId={workspace_id} />
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <Box
                sx={{
                  height: "70vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CreateNewFolderOutlined
                    sx={{ fontSize: 80 }}
                    color="disabled"
                  />
                  <Box
                    component={Link}
                    to={`/workspace/${workspace_id}/create-project`}
                    sx={{ color: "#333" }}
                  >
                    <StyledButton
                      color="primary"
                      variant="contained"
                      sx={{ borderRadius: 2 }}
                      size="small"
                      startIcon={<AddRounded />}
                    >
                      Create Project
                    </StyledButton>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
