import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Circle, ArrowRightAlt, ChatRounded } from "@mui/icons-material";
import CardMenu from "./CardMenu";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Badge,
  Avatar,
  Tooltip,
} from "@mui/material";
import type { Status, Item } from "../types/card";
import { shortenText } from "../helpers";
import { getUserJson } from "../helpers";
import { Link } from "react-router-dom";

dayjs.extend(customParseFormat);

const getChipColorStatus = (status: Status) => {
  switch (status) {
    case "pending":
      return "#aaa";
    case "progress":
      return "info.main";
    case "done":
      return "success.main";
    case "archived":
      return "warning.main";
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
        backgroundColor: getChipColorStatus(status),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
        <Circle
          fontSize="small"
          sx={{
            fontSize: 11,
            color: "#fff",
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
  isAdmin,
}: {
  item: Item;
  updateStatus: (id: number, status: Status) => void;
  isAdmin: boolean;
}) {
  const user = getUserJson();

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid #ccc",
        padding: 1,
        background: "#fff",
      }}
    >
      <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
        <Typography
          variant="body1"
          fontWeight="bold"
          sx={{ mb: 0.5, fontSize: 15 }}
        >
          {shortenText(item.title, 20)}
        </Typography>
        <Box sx={{ position: "absolute", right: 0 }}>
          {(item.contributor?.email === user.email || isAdmin) && (
            <CardMenu
              id={item.id}
              status={item.status}
              updateStatus={updateStatus}
            />
          )}
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
        }}
      >
        <ChipStatus status={item.status} />
        <Divider sx={{ height: 15 }} orientation="vertical" />
        <Box
          title={item.contributor?.full_name}
          component={Tooltip}
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <Avatar
            src={item.contributor?.avatar}
            sx={{ height: 20, width: 20 }}
          />
          <Typography variant="caption" component="div">
            {shortenText(
              item.contributor?.name ?? "",
              item.status === "pending" ? 10 : 13
            )}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Typography variant="body2">
        {shortenText(item.description, 50)}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          {item.startedAt && (
            <Box sx={{ display: "flex", gap: 0.3, color: "#333" }}>
              <Typography variant="caption">
                {dayjs(item.startedAt).format("MMM DD, YYYY")}
              </Typography>
              {item.endedAt && (
                <>
                  <ArrowRightAlt fontSize="small" />
                  <Typography variant="caption">
                    {dayjs(item.endedAt).format("MMM DD, YYYY")}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Box>
        <Box component={Tooltip} title={`${item.unread_count} Messages`}>
          <Link to={`/activity/${item.activity_id}`}>
            <IconButton size="small">
              <Badge
                badgeContent={item.unread_count}
                color="error"
                variant="dot"
              >
                <ChatRounded fontSize="small" />
              </Badge>
            </IconButton>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
