import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CircleIcon from "@mui/icons-material/Circle";
import type { Status } from "../types/card";

type Color = "disabled" | "primary" | "success" | "warning" | "error";

interface MenuOption {
  key: Status;
  label: string;
  color: Color;
}

const options: MenuOption[] = [
  {
    key: "pending",
    label: "Not started",
    color: "disabled",
  },
  {
    key: "progress",
    label: "In progress",
    color: "primary",
  },
  {
    key: "done",
    label: "Done",
    color: "success",
  },
  {
    key: "archived",
    label: "Archived",
    color: "warning",
  },
  {
    key: "delete",
    label: "Delete",
    color: "error",
  },
];

const ITEM_HEIGHT = 48;

export default function CardMenu({
  id,
  status,
  updateStatus,
}: {
  id: number;
  status: Status;
  updateStatus: (id: number, status: Status) => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        <MoreVertIcon fontSize="small" />
      </IconButton>
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
              background: "#ccc",
              borderRadius: 10,
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.key}
            selected={option.key === status}
            onClick={() => {
              updateStatus(id, option.key);
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
