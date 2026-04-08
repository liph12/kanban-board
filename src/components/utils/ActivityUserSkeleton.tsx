import { Box, Skeleton, Divider } from "@mui/material";

export default function ActivityUserSkeleton() {
  return (
    <>
      <Box sx={{ mx: 1, mb: 1, py: 1 }}>
        <Skeleton height={15} width={50} />
        <Skeleton height={20} width={200} />
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 0.5 }}>
          <Skeleton height={25} width={25} variant="circular" />
          <Skeleton height={15} width={50} variant="rounded" />
        </Box>
      </Box>
      <Divider />
    </>
  );
}
