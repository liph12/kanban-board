import { useState } from "react";
import { Box, Grid, FormHelperText, Button } from "@mui/material";
import CustomTextField from "./utils/CustomTextField";
import { grey } from "@mui/material/colors";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { Switch } from "@mui/joy";
import type { Status, Item } from "../types/card";
import type { ColorGroup } from "./layouts/ProjectLayout";

export default function CreateItem({
  onChange,
  onSubmit,
  item,
  status,
  saving,
  color,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (status: Status) => void;
  item: Item;
  status: Status;
  saving: boolean;
  color: ColorGroup;
}) {
  const [showDateStart, setShowDateStart] = useState(false);
  const [showDateEnd, setShowDateEnd] = useState(false);

  return (
    <Box
      sx={{
        background: "#fff",
        borderRadius: 3,
      }}
    >
      <Box sx={{ mb: 1 }}>
        <CustomTextField
          fullWidth
          placeholder="Title"
          variant="outlined"
          size="small"
          name="title"
          value={item.title}
          onChange={onChange}
        />
      </Box>
      <Box sx={{ mb: 1 }}>
        <CustomTextField
          fullWidth
          placeholder="Description"
          variant="outlined"
          size="small"
          name="description"
          value={item.description}
          onChange={onChange}
          multiline
          minRows={1}
          maxRows={3}
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
              mb: 1,
            }}
          >
            Start date:{" "}
            <Switch
              size="sm"
              checked={showDateStart}
              onChange={(event) => setShowDateStart(event.target.checked)}
            />
          </FormHelperText>
          <CustomTextField
            disabled={!showDateStart}
            type="date"
            fullWidth
            value={item.startedAt ?? ""}
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
                mb: 1,
              }}
            >
              End date:{" "}
              <Switch
                size="sm"
                checked={showDateEnd}
                onChange={(event) => setShowDateEnd(event.target.checked)}
              />
            </FormHelperText>
            <CustomTextField
              disabled={!showDateEnd}
              type="date"
              fullWidth
              value={item.endedAt ?? ""}
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
          sx={{ borderRadius: 2, textTransform: "none", mt: 1 }}
          color={color}
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
