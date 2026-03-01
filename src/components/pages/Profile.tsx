import {
  Box,
  Avatar,
  Typography,
  Divider,
  Grid,
  Container,
  Stack,
  FormHelperText,
  FormControl,
} from "@mui/material";
import { PanoramaRounded, SaveRounded } from "@mui/icons-material";
import { getUserJson } from "../../helpers";
import StyledButton from "../utils/StyledButton";
import CustomTextField from "../utils/CustomTextField";
import { useState, useEffect, useRef } from "react";
import useAxios from "../../hooks/useAxios";
import imageCompression from "browser-image-compression";
import { useAuth } from "../../providers/AuthProvider";
import Notification from "../Notification";
import type { Notification as NotificationType } from "../../types/notification";
import type { SnackbarCloseReason } from "@mui/material";

type UserData = {
  avatarUrl: string;
  avatar: File | null;
  coverPhotoUrl: string;
  coverPhoto: File | null;
  name: string;
  displayName: string;
  email: string;
  mobile: string;
  password: string;
  newPassword: string;
};

export default function Profile() {
  const storedUser = getUserJson();
  const { setUserAuth, user } = useAuth();
  const axios = useAxios();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const [userData, setUserData] = useState<UserData>({
    avatarUrl: user?.avatar ?? "",
    avatar: null,
    coverPhotoUrl: user?.cover_photo ?? "",
    coverPhoto: null,
    name: user?.full_name ?? "",
    displayName: user?.name ?? "",
    email: user?.email ?? "",
    mobile: user?.mobile_number ?? "",
    password: "",
    newPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<NotificationType>({
    open: false,
    message: "",
    type: "success",
  });

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 1, // max size in MB
        maxWidthOrHeight: type === "avatar" ? 600 : 1600,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const previewUrl = URL.createObjectURL(compressedFile);

      setUserData((prev) => ({
        ...prev,
        ...(type === "avatar"
          ? { avatarUrl: previewUrl, avatar: compressedFile }
          : { coverPhotoUrl: previewUrl, coverPhoto: compressedFile }),
      }));
    } catch (err) {
      console.error("Image compression error:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpload = async () => {
    try {
      setSaving(true);

      const formData = new FormData();

      if (userData.avatar) {
        formData.append("avatar", userData.avatar);
      }

      if (userData.coverPhoto) {
        formData.append("cover_photo", userData.coverPhoto);
      }

      formData.append("name", userData.name);
      formData.append("display_name", userData.displayName);
      formData.append("mobile", userData.mobile);
      if (userData.password) {
        formData.append("password", userData.password);
      }
      if (userData.newPassword) {
        formData.append("new_password", userData.newPassword);
      }

      const response = await axios.post("/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${storedUser.auth_token}`,
        },
      });

      const { data } = response.data;
      const updatedUser = { ...data, auth_token: storedUser.auth_token };

      setUserAuth(updatedUser);
      setNotification((prev) => ({
        ...prev,
        open: true,
        message: "Account updated successfully",
        type: "success",
      }));
    } catch (e) {
      setNotification((prev) => ({
        ...prev,
        open: true,
        message: "Oops! Something went wrong",
        type: "warning",
      }));
    } finally {
      setSaving(false);
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

  useEffect(() => {
    return () => {
      if (userData.avatarUrl) URL.revokeObjectURL(userData.avatarUrl);
      if (userData.coverPhotoUrl) URL.revokeObjectURL(userData.coverPhotoUrl);
    };
  }, [userData.avatarUrl, userData.coverPhotoUrl]);

  return (
    <>
      <Notification
        config={notification}
        handleClose={handleCloseNotification}
      />
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            mt: 2,
            width: "50vw",
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                height: "20vh",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                overflow: "hidden",
              }}
              onClick={handleCoverClick}
            >
              {/* Cover Image */}
              {userData.coverPhotoUrl && (
                <img
                  src={userData.coverPhotoUrl}
                  alt="Cover Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}

              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  bgcolor: "rgba(0, 0, 0, 0.4)",
                }}
              />

              {!userData.coverPhotoUrl && (
                <Box
                  sx={{
                    position: "absolute",
                    textAlign: "center",
                    color: "#fff",
                  }}
                >
                  <PanoramaRounded sx={{ color: "#fff" }} fontSize="medium" />
                  <Typography variant="caption" component="div">
                    Upload cover photo
                  </Typography>
                </Box>
              )}
            </Box>

            <input
              type="file"
              accept="image/*"
              ref={coverInputRef}
              style={{ display: "none" }}
              name="coverPhoto"
              onChange={(e) => handleImageChange(e, "cover")}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                position: "absolute",
                top: 90,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  ml: 5,
                }}
              >
                <>
                  <Avatar
                    src={userData.avatarUrl}
                    alt="Administrator"
                    onClick={handleAvatarClick}
                    sx={{
                      height: 80,
                      width: 80,
                      border: "3px solid #eee",
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={avatarInputRef}
                    style={{ display: "none" }}
                    name="avatar"
                    onChange={(e) => handleImageChange(e, "avatar")}
                  />
                </>
                <Box>
                  <Typography variant="h5" color="#fff">
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="#fff">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ backgroundColor: "#fff", height: "auto" }}>
              <Container sx={{ py: 5 }}>
                <Grid container spacing={2}>
                  <Grid size={{ lg: 6, md: 12, xs: 12 }}>
                    <Stack spacing={1}>
                      <Typography variant="body2">Appearance</Typography>
                      <FormControl fullWidth>
                        <FormHelperText>Full name</FormHelperText>
                        <CustomTextField
                          placeholder="Full name"
                          value={userData.name}
                          name="name"
                          onChange={handleChange}
                        />
                      </FormControl>
                      <FormControl fullWidth>
                        <FormHelperText>Display name</FormHelperText>
                        <CustomTextField
                          placeholder="Display name"
                          value={userData.displayName}
                          name="displayName"
                          onChange={handleChange}
                        />
                      </FormControl>
                    </Stack>
                  </Grid>
                  <Grid size={{ lg: 6, md: 12, xs: 12 }}>
                    <Stack spacing={1}>
                      <Typography variant="body2">Contact</Typography>
                      <FormControl fullWidth>
                        <FormHelperText>Email address</FormHelperText>
                        <CustomTextField
                          placeholder="Email address"
                          value={userData.email}
                          disabled
                        />
                      </FormControl>
                      <FormControl fullWidth>
                        <FormHelperText>Mobile number</FormHelperText>
                        <CustomTextField
                          placeholder="Mobile number"
                          value={userData.mobile}
                          name="mobile"
                          onChange={handleChange}
                        />
                      </FormControl>
                    </Stack>
                  </Grid>
                  <Grid size={{ lg: 6, md: 12, xs: 12 }}>
                    <Stack spacing={1}>
                      <Typography variant="body2">Password</Typography>
                      <FormControl fullWidth>
                        <FormHelperText>Current password</FormHelperText>
                        <CustomTextField
                          placeholder="Current password"
                          value={userData.password}
                          name="password"
                          onChange={handleChange}
                        />
                      </FormControl>
                      <FormControl fullWidth>
                        <FormHelperText>New password</FormHelperText>
                        <CustomTextField
                          placeholder="New password"
                          value={userData.newPassword}
                          name="newPassword"
                          onChange={handleChange}
                        />
                      </FormControl>
                    </Stack>
                  </Grid>
                </Grid>
              </Container>
              <Divider />
              <Box
                sx={{
                  py: 1,
                  px: 2,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Box />
                <StyledButton
                  variant="contained"
                  size="small"
                  startIcon={<SaveRounded />}
                  loading={saving}
                  onClick={handleUpload}
                >
                  Save
                </StyledButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
