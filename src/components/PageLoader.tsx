import { Box, CircularProgress, Typography } from "@mui/material";

export default function () {
  return (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box>
        <CircularProgress size={50} sx={{ mb: 3 }} />
        <Typography>Loading...</Typography>
      </Box>
    </Box>
  );
}
