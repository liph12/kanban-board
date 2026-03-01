import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";

export default function CustomTextFieldPrimary(
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
          padding: 0,
          "& fieldset": {
            borderColor: "#999",
          },
          "&:hover fieldset": {
            borderColor: "#999",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#1976d2",
          },
          "& .MuiInputBase-input": {
            paddingY: 0,
            paddingX: 1.5,
            fontSize: 13,
          },
        },
        "& .MuiInputBase-input::placeholder": {
          color: "#999",
          opacity: 1,
          fontSize: 13,
        },
      }}
    />
  );
}
