import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";

export default function CustomTextFieldSecondary(
  props: TextFieldProps & { params?: any }
) {
  const { params, ...rest } = props;

  return (
    <TextField
      {...params}
      {...rest}
      fullWidth
      variant="outlined"
      size="small"
      sx={{
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "#555",
          },
          "&:hover fieldset": {
            borderColor: "#555",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#1976d2",
          },
        },
        "& .MuiInputBase-input::placeholder": {
          color: "#999",
          opacity: 1,
        },
      }}
    />
  );
}
