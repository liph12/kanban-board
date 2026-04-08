import {
  Box,
  Container,
  Typography,
  Stack,
  Divider,
  Avatar,
} from "@mui/material";
import type { AxiosError } from "axios";
import useAxios from "../../hooks/useAxios";
import { useState } from "react";
import Notification from "../Notification";
import type { Notification as NotificationType } from "../../types/notification";
import type { SnackbarCloseReason } from "@mui/material";
import { useAuth } from "../../providers/AuthProvider";
import CustomTextFieldSecondary from "../utils/CustomTextFieldSecondary";
import StyledButton from "../utils/StyledButton";
import { ArrowBack } from "@mui/icons-material";
import { Link } from "react-router-dom";

export default function RegistrationLayout() {
  const axios = useAxios();
  const { setUserAuth } = useAuth();
  const [notification, setNotification] = useState<NotificationType>({
    open: false,
    message: "",
    type: "success",
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await axios.post(
        "/users",
        { name, email, password, passwordRepeat },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const { user, message, auth_token } = response.data;

        const newUser = { ...user, auth_token: auth_token };

        setUserAuth(newUser);
        setNotification((prev) => ({
          ...prev,
          open: true,
          message: `${user.name} ${message}`,
          type: "success",
        }));

        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }

      console.log(response.data);
    } catch (e) {
      const error = e as AxiosError;

      if (error.response?.status === 403) {
        const { message } = error.response?.data as any;

        setNotification((prev) => ({
          ...prev,
          open: true,
          message: `${message}`,
          type: "error",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = (
    _?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Notification
        config={notification}
        handleClose={handleCloseNotification}
      />
      <Container>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Box
            sx={{
              width: 350,
              height: "auto",
              backgroundColor: "#fff",
              borderRadius: 2,
              padding: 5,
              textAlign: "center",
            }}
          >
            <Box sx={{ mb: 2, py: 1.5, backgroundColor: "#fff" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Avatar
                  src="/trackmeio_dark.png"
                  variant="square"
                  sx={{ width: 150, height: "auto" }}
                />
              </Box>
              <Box>
                <Typography variant="h6">Account Sign Up</Typography>
              </Box>
            </Box>
            <Stack
              sx={{ mt: 3 }}
              gap={2}
              component="form"
              onSubmit={handleSubmitForm}
            >
              <Box sx={{ textAlign: "left" }}>
                <Box sx={{ textAlign: "left" }}>
                  <CustomTextFieldSecondary
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setName(e.target.value)
                    }
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Display Name"
                  />
                </Box>
              </Box>
              <Box sx={{ textAlign: "left" }}>
                <CustomTextFieldSecondary
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Email address"
                />
              </Box>
              <Box sx={{ textAlign: "left" }}>
                <CustomTextFieldSecondary
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Password"
                  type="password"
                />
              </Box>
              <Box sx={{ textAlign: "left" }}>
                <CustomTextFieldSecondary
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPasswordRepeat(e.target.value)
                  }
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Password"
                  type="password"
                />
              </Box>
              <Box>
                <StyledButton
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="medium"
                  color="primary"
                  disableElevation
                  loading={loading}
                >
                  Submit
                </StyledButton>
              </Box>
            </Stack>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Divider sx={{ width: "40%", backgroundColor: "gray" }} />
                <Typography
                  sx={{
                    position: "relative",
                    margin: "15px 0",
                  }}
                  component="div"
                >
                  OR
                </Typography>
                <Divider sx={{ width: "40%", backgroundColor: "gray" }} />
              </Box>
              <Box
                component={Link}
                to="/login"
                sx={{ textDecoration: "none", color: "inherit" }}
              >
                <StyledButton
                  type="button"
                  variant="outlined"
                  color="inherit"
                  disableElevation
                  fullWidth
                  startIcon={<ArrowBack />}
                >
                  Back to Sign In
                </StyledButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
