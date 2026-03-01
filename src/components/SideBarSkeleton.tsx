import { Skeleton, Stack } from "@mui/material";

export default function SideBarSkeleton() {
  return (
    <>
      <Stack spacing={1}>
        {/* <Skeleton width={130} sx={{ backgroundColor: "#333" }} /> */}
        <Skeleton width={150} sx={{ backgroundColor: "#333" }} />
        <Skeleton width={110} sx={{ backgroundColor: "#333" }} />
      </Stack>
      <Skeleton width={70} sx={{ backgroundColor: "#333", my: 3 }} />
      <Stack spacing={1}>
        {/* <Skeleton width={160} sx={{ backgroundColor: "#333" }} /> */}
        <Skeleton width={130} sx={{ backgroundColor: "#333" }} />
        <Skeleton width={150} sx={{ backgroundColor: "#333" }} />
      </Stack>
    </>
  );
}
