import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ExpandMoreRounded } from "@mui/icons-material";
import CircleIcon from "@mui/icons-material/Circle";
import type { Permission } from "../types/card";
import StyledButton from "./utils/StyledButton";

type Color = "primary" | "success" | "warning" | "error" | "info" | "inherit";

interface MenuOption {
  key: Permission;
  label: string;
  color: Color;
}

const options: MenuOption[] = [
  {
    key: "admin",
    label: "Admin",
    color: "primary",
  },
  {
    key: "write",
    label: "Write",
    color: "info",
  },
  {
    key: "read",
    label: "Read",
    color: "inherit",
  },
];

const ITEM_HEIGHT = 48;

export default function PermissionMenu({
  permission,
  selectPermission,
}: {
  permission: Permission | null;
  selectPermission: (permission: Permission) => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const option = options.find((p) => p.key === permission);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <StyledButton
        size="small"
        variant="contained"
        color={option?.color ?? "primary"}
        endIcon={<ExpandMoreRounded />}
        disabled={permission === null}
        sx={{ width: 100, borderRadius: 2 }}
        onClick={handleClick}
      >
        {option?.label ?? "Admin"}
      </StyledButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              maxWidth: "15ch",
              width: "20ch",
              background: "#fff",
              borderRadius: 10,
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.key}
            selected={option.key === permission}
            onClick={() => {
              selectPermission(option.key);
              handleClose();
            }}
            sx={{ fontSize: 15, py: 0.5, pl: 1 }}
          >
            <CircleIcon sx={{ fontSize: 13 }} color={option.color} /> &nbsp;{" "}
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
