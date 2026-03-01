import { Avatar, Box, Typography, Badge } from "@mui/material";
import type { ActivityType } from "../pages/Activity";
import { shortenText } from "../../helpers";
import { getUserJson } from "../../helpers";
import { getStatusActivityValue } from "../../helpers";
import { getColorStatus } from "../../helpers";

export default function ActivityUser({
  activity,
  selected,
}: {
  activity: ActivityType;
  selected: boolean;
}) {
  const user = getUserJson();
  const { item, message, unread_count } = activity;

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        borderBottom: "1px solid #ccc",
        borderLeft: selected
          ? "5px solid rgb(75, 139, 202)"
          : "5px solid transparent",
        cursor: "pointer",
        backgroundColor: selected ? "rgb(245, 248, 251)" : "transparent",
        ":hover": {
          backgroundColor: "rgb(245, 248, 251)",
          transition: "0.2s",
        },
      }}
    >
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            fontWeight={unread_count > 0 ? "bold" : 500}
            variant="body2"
          >
            {shortenText(item.title, 15)}
          </Typography>
          <Typography variant="caption">
            {shortenText(item.project?.title ?? "", 15)}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {message.type === "create" && (
            <Typography
              variant="caption"
              fontWeight={unread_count > 0 ? "bold" : 500}
            >
              Created a new item{" "}
              <Typography
                component="span"
                color={getColorStatus(message.body)}
                variant="caption"
              >
                ●
              </Typography>{" "}
              <b>{getStatusActivityValue(message.body)}</b>
            </Typography>
          )}
          {message.type === "progress" && (
            <Typography
              variant="caption"
              fontWeight={unread_count > 0 ? "bold" : 500}
            >
              Updated an item{" "}
              <Typography
                component="span"
                color={getColorStatus(message.body)}
                variant="caption"
              >
                ●
              </Typography>{" "}
              <b>{getStatusActivityValue(message.body)}</b>
            </Typography>
          )}
          {message.type === "text" && (
            <Typography
              variant="caption"
              fontWeight={unread_count > 0 ? "bold" : 500}
            >
              {shortenText(message.body, 35)}
            </Typography>
          )}
          {unread_count > 0 && (
            <Badge badgeContent={unread_count} color="info" />
          )}
        </Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Avatar
            src={item.contributor?.avatar}
            alt={item.contributor?.name}
            sx={{ height: 20, width: 20 }}
          />
          <Typography
            variant="caption"
            fontWeight={unread_count > 0 ? "bold" : 500}
          >
            {user.email === message.contributor?.email
              ? "You"
              : shortenText(message.contributor?.name ?? "", 20)}
          </Typography>
        </Box>
        <Typography variant="caption" color="textSecondary">
          {message.time}
        </Typography>
      </Box>
    </Box>
  );
}
