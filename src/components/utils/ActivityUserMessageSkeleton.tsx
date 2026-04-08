import { Skeleton, Box } from "@mui/material";

export default function ActivityUserMessageSkeleton() {
  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center", my: 4 }}>
      <Skeleton height={30} width={30} variant="circular" />
      <Box>
        <Skeleton width={300} />
        <Skeleton width={200} />
      </Box>
    </Box>
  );
}
