import React, { useState } from "react";
import {
  IconButton,
  Menu,
  Avatar,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { PowerSettingsNewRounded, AccountCircle } from "@mui/icons-material";
import StyledButton from "./utils/StyledButton";
import { useAuth } from "../providers/AuthProvider";
import { shortenText } from "../helpers";
import { Link } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { getUserJson } from "../helpers";

const ITEM_HEIGHT = 48;

export default function AccountMenu() {
  const storedUser = getUserJson();
  const { user, logout } = useAuth();
  const axios = useAxios();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutAsync = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "/sign-out",
        { email: user?.email },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.auth_token}`,
          },
        }
      );

      if (response.status === 200) {
        logout();
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
      }
    } catch (e) {
      // to do
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <Avatar
          src={user?.avatar}
          alt={user?.name}
          sx={{ height: 25, width: 25 }}
        />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              maxWidth: "25ch",
              width: "25ch",
              background: "#fff",
              borderRadius: 10,
            },
          },
        }}
      >
        <Box sx={{ px: 1, py: 0.2 }}>
          <Box
            onClick={handleClose}
            to="/settings/account"
            component={Link}
            sx={{
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              gap: 1,
              alignItems: "center",
              cursor: "pointer",
              borderRadius: 2,
              px: 1,
              py: 0.2,
              ":hover": {
                backgroundColor: "#eee",
                transition: "0.2s",
              },
            }}
          >
            <AccountCircle fontSize="medium" color="action" />
            <Box>
              <Typography variant="body2">
                {shortenText(user?.full_name ?? "", 25)}
              </Typography>
              <Typography variant="caption">
                @{shortenText(user?.name ?? "", 30)}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          <StyledButton
            startIcon={<PowerSettingsNewRounded />}
            size="small"
            color="error"
            variant="contained"
            fullWidth
            loading={loading}
            onClick={handleLogoutAsync}
          >
            Sign out
          </StyledButton>
        </Box>
      </Menu>
    </>
  );
}
