import {
  Box,
  Container,
  TextField,
  Typography,
  Avatar,
  Stack,
  Button,
} from "@mui/material";
import axios from "axios";
import type { AxiosError } from "axios";
import { useState } from "react";
import Notification from "../Notification";
import type { Notification as NotificationType } from "../../types/notification";
import type { SnackbarCloseReason } from "@mui/material";

export default function LoginLayout() {
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
        "https://api.taskmastersystem.ph/api/v1/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const { user, message } = response.data;

        setNotification((prev) => ({
          ...prev,
          open: true,
          message: `${user.name} ${message}`,
          type: "success",
        }));

        localStorage.setItem("user", JSON.stringify(user));
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
              backgroundColor: "#14293aff",
              borderRadius: 2,
              padding: 5,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <Avatar
                src="./task-master-logo.png"
                sx={{ height: 80, width: 80, backgroundColor: "#fff" }}
                variant="circular"
              />
            </Box>
            <Typography variant="h5" sx={{ color: "#fff" }}>
              Task Master Login
            </Typography>
            <Stack
              sx={{ mt: 3 }}
              gap={2}
              component="form"
              onSubmit={handleSubmitForm}
            >
              <Box sx={{ textAlign: "left" }}>
                <Typography color="#fff" variant="body2">
                  Email address
                </Typography>
                <TextField
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{
                    mt: 0.5,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#999",
                      },
                      "&:hover fieldset": {
                        borderColor: "#999",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: "#999",
                      opacity: 1,
                    },

                    "& .MuiInputBase-input": {
                      color: "white",
                    },
                  }}
                />
              </Box>
              <Box sx={{ textAlign: "left" }}>
                <Typography color="#fff" variant="body2">
                  Password
                </Typography>
                <TextField
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  type="password"
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{
                    mt: 0.5,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#999",
                      },
                      "&:hover fieldset": {
                        borderColor: "#999",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: "#999",
                      opacity: 1,
                    },

                    "& .MuiInputBase-input": {
                      color: "white",
                    },
                  }}
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                size="medium"
                color="success"
                disableElevation
                loading={loading}
              >
                Login
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>
    </>
  );
}
