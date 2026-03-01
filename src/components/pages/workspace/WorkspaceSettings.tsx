import { Box, Typography, Grid } from "@mui/material";
import WorkspaceSettingsGeneralCard from "../../utils/WorkspaceSettingsGeneralCard";
import WorkspaceSettingsPermissionsCard from "../../utils/WorkspaceSettingsPermissionsCard";

export default function WorkspaceSettings() {
  return (
    <Box>
      <Typography variant="h6" fontWeight={700}>
        Workspace Settings
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ lg: 4, md: 6, xs: 12 }}>
            <WorkspaceSettingsGeneralCard />
          </Grid>
          <Grid size={{ lg: 4, md: 6, xs: 12 }}>
            <WorkspaceSettingsPermissionsCard />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
