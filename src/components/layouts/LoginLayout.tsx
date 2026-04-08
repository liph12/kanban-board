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
import { useGoogleLogin } from "@react-oauth/google";
import { PersonAddRounded } from "@mui/icons-material";
import { Link } from "react-router-dom";

export default function LoginLayout() {
  const { setUserAuth } = useAuth();
  const axios = useAxios();
  const [notification, setNotification] = useState<NotificationType>({
    open: false,
    message: "",
    type: "success",
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authGoogleLoading, setAuthGoogleLoading] = useState(false);

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await axios.post(
        "/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const { user, message, auth_token } = response.data;
        const authUser = { ...user, auth_token: auth_token };

        setUserAuth(authUser);
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

  const authGoogleSignIn = () => signInWithGoogle();
  const authGoogleSignInAsync = async (data: any) => {
    try {
      const response = await axios.post(`/google-auth`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { user, message, auth_token } = response.data;
      const authUser = { ...user, auth_token: auth_token };

      setUserAuth(authUser);
      setNotification((prev) => ({
        ...prev,
        open: true,
        message: `${user.name} ${message}`,
        type: "success",
      }));

      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (e) {
      // to do
    } finally {
      setAuthGoogleLoading(false);
    }
  };

  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setAuthGoogleLoading(true);
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const data = userInfo.data;
        const time = new Date().getTime();
        const userData = {
          email: data.email,
          name: data.name,
          avatar: data.picture,
          password: `${time}_${data.email}`,
          passwordRepeat: `${time}_${data.email}`,
        };

        await authGoogleSignInAsync(userData);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },
  });

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
                <Typography variant="h6">Account Sign In</Typography>
              </Box>
            </Box>
            <Stack
              sx={{ mt: 3 }}
              gap={2}
              component="form"
              onSubmit={handleSubmitForm}
            >
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
                  type="password"
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Password"
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
                  Sign In
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
                to="/register"
                sx={{ textDecoration: "none", color: "inherit" }}
              >
                <StyledButton
                  type="button"
                  variant="outlined"
                  color="inherit"
                  disableElevation
                  fullWidth
                  startIcon={<PersonAddRounded />}
                >
                  Register Here
                </StyledButton>
              </Box>
              <StyledButton
                loading={authGoogleLoading}
                type="button"
                variant="outlined"
                color="inherit"
                startIcon={
                  <Avatar src="/google.png" sx={{ height: 25, width: 25 }} />
                }
                onClick={authGoogleSignIn}
                disableElevation
                fullWidth
                sx={{ mt: 1 }}
              >
                Continue with Google
              </StyledButton>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
