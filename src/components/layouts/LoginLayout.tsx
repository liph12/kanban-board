import { Box, Container, Typography, Stack, Divider } from "@mui/material";
import type { AxiosError } from "axios";
import useAxios from "../../hooks/useAxios";
import { useState } from "react";
import Notification from "../Notification";
import type { Notification as NotificationType } from "../../types/notification";
import type { SnackbarCloseReason } from "@mui/material";
import { useAuth } from "../../providers/AuthProvider";
import CustomTextFieldSecondary from "../utils/CustomTextFieldSecondary";
import StyledButton from "../utils/StyledButton";
import { Google } from "@mui/icons-material";

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
            <Typography variant="h5">Account Sign In</Typography>
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
            </Stack>
            <Box sx={{ mt: 3 }}>
              <StyledButton
                fullWidth
                type="submit"
                variant="contained"
                size="medium"
                color="primary"
                disableElevation
                loading={loading}
              >
                Login
              </StyledButton>
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
              <StyledButton
                // loading={authGoogleLoading}
                type="button"
                variant="outlined"
                color="inherit"
                startIcon={<Google color="info" />}
                // onClick={signInWithGoogle}
                disableElevation
                fullWidth
              >
                Sign In with Google
              </StyledButton>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
