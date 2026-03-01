import { Box, Typography, Grid } from "@mui/material";
import { useWorkspaceContext } from "../../providers/WorkspaceProvider";
import { AddRounded, CreateNewFolderOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";
import WorkspaceCard from "../utils/WorkspaceCard";
import StyledButton from "../utils/StyledButton";

export default function Main() {
  const { workspaces } = useWorkspaceContext();

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Typography variant="h6" fontWeight={700}>
          Workspaces
        </Typography>
        {workspaces && workspaces?.length > 0 && (
          <Box component={Link} to={`/create-workspace`} sx={{ color: "#333" }}>
            <StyledButton
              color="primary"
              variant="contained"
              sx={{ borderRadius: 2 }}
              size="small"
              startIcon={<AddRounded />}
            >
              Create workspace
            </StyledButton>
          </Box>
        )}
      </Box>
      {workspaces && (
        <Box sx={{ mt: 2 }}>
          {workspaces.length > 0 ? (
            <>
              <Grid container spacing={2}>
                {workspaces?.map((w) => (
                  <Grid size={{ lg: 3, md: 6, xs: 12 }} key={w.id}>
                    <WorkspaceCard {...w} />
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
                  to={`/create-workspace`}
                  sx={{ color: "#333" }}
                >
                  <StyledButton
                    color="primary"
                    variant="contained"
                    sx={{ borderRadius: 2 }}
                    size="small"
                    startIcon={<AddRounded />}
                  >
                    Create Workspace
                  </StyledButton>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
