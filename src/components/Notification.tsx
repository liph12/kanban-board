import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import type { Notification } from "../types/notification";

interface NotificationProps {
  config: Notification;
  handleClose: () => void;
}

export default function Notification({
  config,
  handleClose,
}: NotificationProps) {
  const { message, type, open } = config;

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}
