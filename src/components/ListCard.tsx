import dayjs from "dayjs";
import { Circle, ArrowRightAlt } from "@mui/icons-material";
import { grey, green, blue, yellow } from "@mui/material/colors";
import CardMenu from "./CardMenu";
import { Box, Typography, Divider } from "@mui/material";
import type { Status, Item } from "../types/card";

type Color = {
  50: "#fafafa";
  100: "#f5f5f5";
  200: "#eeeeee";
  300: "#e0e0e0";
  400: "#bdbdbd";
  500: "#9e9e9e";
  600: "#757575";
  700: "#616161";
  800: "#424242";
  900: "#212121";
  A100: "#f5f5f5";
  A200: "#eeeeee";
  A400: "#bdbdbd";
  A700: "#616161";
};

const getChipColorStatus = (
  status: Status,
  colorKey: keyof Color,
  hasIcon: boolean = false
) => {
  switch (status) {
    case "pending":
      return hasIcon ? grey[colorKey] : grey[700];
    case "progress":
      return blue[colorKey];
    case "done":
      return green[colorKey];
    case "archived":
      return yellow[colorKey];
  }
};

const ChipStatus = ({ status }: { status: Status }) => {
  return (
    <Box
      sx={{
        my: 0.5,
        display: "inline-block",
        borderRadius: 3,
        width: "auto",
        gap: 0.5,
        px: 0.8,
        pt: 0.2,
        pb: 0.1,
        background: getChipColorStatus(status, 900),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
        <Circle
          fontSize="small"
          sx={{
            fontSize: 11,
            color: getChipColorStatus(status, 300, true),
          }}
        />
        {status === "done" ? (
          <Typography
            variant="body2"
            component="div"
            fontSize={13}
            color="#fff"
          >
            Done
          </Typography>
        ) : (
          <Typography
            variant="body2"
            component="div"
            fontSize={13}
            color="#fff"
          >
            {status === "progress"
              ? "In Progress"
              : status === "archived"
              ? "Archived"
              : "Not started"}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default function ListCard({
  item,
  updateStatus,
}: {
  item: Item;
  updateStatus: (id: number, status: Status) => void;
}) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: 1,
        borderWidth: 1,
        borderColor: "#383838",
        padding: 1,
        color: "#fff",
        background: item.color,
      }}
    >
      <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
        <Typography
          variant="body1"
          fontWeight="bold"
          sx={{ mb: 0.5, fontSize: 15 }}
        >
          {item.title}
        </Typography>
        <Box sx={{ position: "absolute", right: 0 }}>
          <CardMenu
            id={item.id}
            status={item.status}
            updateStatus={updateStatus}
          />
        </Box>
      </Box>
      <ChipStatus status={item.status} />
      <Divider sx={{ my: 1 }} />
      <Typography variant="body2">{item.description}</Typography>
      {item.startedAt && (
        <Box sx={{ display: "flex", gap: 0.3, color: "#ccc" }}>
          <Typography variant="caption">
            {dayjs(item.startedAt).format("MMMM DD, YYYY")}
          </Typography>
          {item.endedAt && (
            <>
              <ArrowRightAlt fontSize="small" />
              <Typography variant="caption">
                {dayjs(item.endedAt).format("MMMM DD, YYYY")}
              </Typography>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
