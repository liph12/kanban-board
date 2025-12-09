import { useState } from "react";
import { Box, TextField, Grid, FormHelperText, Button } from "@mui/material";
import { grey } from "@mui/material/colors";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { Switch } from "@mui/joy";
import type { Status, Item } from "../types/card";
import { getColorStatus } from "../helpers";

const inputSx = {
  "& .MuiOutlinedInput-input": {
    color: "#fff",
    px: 0,
    "&::placeholder": {
      color: grey[600],
      opacity: 1,
    },
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderRadius: 2,
      border: "none",
    },
  },
};

export default function CreateItem({
  onChange,
  onSubmit,
  item,
  status,
  saving,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (status: Status) => void;
  item: Item;
  status: Status;
  saving: boolean;
}) {
  const [showDateStart, setShowDateStart] = useState(false);
  const [showDateEnd, setShowDateEnd] = useState(false);

  return (
    <Box
      sx={{
        border: 1,
        borderWidth: 1,
        borderColor: "#383838",
        background: getColorStatus(status),
        borderRadius: 3,
        px: 1,
        mb: 2,
      }}
    >
      <Box>
        <TextField
          fullWidth
          sx={inputSx}
          placeholder="Title"
          variant="outlined"
          size="small"
          name="title"
          value={item.title}
          onChange={onChange}
        />
      </Box>
      <Box>
        <TextField
          fullWidth
          sx={inputSx}
          placeholder="Description"
          variant="outlined"
          size="small"
          name="description"
          value={item.description}
          onChange={onChange}
        />
      </Box>
      <Grid container spacing={1}>
        <Grid size={{ lg: 6, md: 12, xs: 12 }}>
          <FormHelperText
            component="div"
            sx={{
              color: grey[600],
              mx: 0,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            Start date:{" "}
            <Switch
              size="sm"
              checked={showDateStart}
              onChange={(event) => setShowDateStart(event.target.checked)}
            />
          </FormHelperText>
          <TextField
            disabled={!showDateStart}
            type="date"
            fullWidth
            value={item.startedAt ?? ""}
            sx={{
              ...inputSx,
              "& input::-webkit-calendar-picker-indicator": {
                filter: "invert(1)",
              },
            }}
            variant="outlined"
            size="small"
            name="startedAt"
            onChange={onChange}
          />
        </Grid>
        {showDateStart && (
          <Grid size={{ lg: 6, md: 12, xs: 12 }}>
            <FormHelperText
              component="div"
              sx={{
                color: grey[600],
                mx: 0,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              End date:{" "}
              <Switch
                size="sm"
                checked={showDateEnd}
                onChange={(event) => setShowDateEnd(event.target.checked)}
              />
            </FormHelperText>
            <TextField
              disabled={!showDateEnd}
              type="date"
              fullWidth
              value={item.endedAt ?? ""}
              sx={{
                ...inputSx,
                "& input::-webkit-calendar-picker-indicator": {
                  filter: "invert(1)",
                },
              }}
              variant="outlined"
              size="small"
              name="endedAt"
              onChange={onChange}
            />
          </Grid>
        )}
      </Grid>
      {item.title !== "" && (
        <Button
          onClick={() => onSubmit(status)}
          sx={{ borderRadius: 5, textTransform: "none", my: 1 }}
          color="inherit"
          variant="contained"
          disableElevation
          size="small"
          startIcon={<SaveRoundedIcon />}
          loading={saving}
        >
          Save
        </Button>
      )}
    </Box>
  );
}
