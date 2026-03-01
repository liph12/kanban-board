import type { Workspace } from "../../types/workspace";
import { Box, Typography } from "@mui/material";
import { ChevronRight, ExpandMore } from "@mui/icons-material";
import { useState } from "react";

export default function SidebarWorkspaceToggler({ ...props }: Workspace) {
  const [toggle, setToggle] = useState<boolean>(false);
  const handleToggle = () => setToggle((prev) => !prev);

  return (
    <>
      <Box sx={{ mb: 0.3 }}>
        <Typography
          variant="body2"
          color={toggle ? "info" : "#bbb"}
          component="div"
          onClick={handleToggle}
          sx={{
            borderRadius: 2,
            paddingY: 0.8,
            paddingX: 1.5,
            cursor: "pointer",
            display: "flex",
            gap: 3,
            ":hover": {
              backgroundColor: "rgb(55, 55, 55)",
              transition: "0.2s",
            },
          }}
        >
          {toggle ? (
            <ExpandMore fontSize="small" />
          ) : (
            <ChevronRight fontSize="small" />
          )}{" "}
          {props.title}
        </Typography>
      </Box>
    </>
  );
}
