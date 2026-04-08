import { Box, Divider, Typography, AvatarGroup, Avatar } from "@mui/material";
import { MessageRounded, RestoreRounded } from "@mui/icons-material";
import ActivityTabs from "../utils/ActivityTabs";
import ActivityUser from "../utils/ActivityUser";
import useAxios from "../../hooks/useAxios";
import { getUserJson } from "../../helpers";
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import type { Item } from "../../types/card";
import { useParams } from "react-router-dom";
import { useWorkspaceContext } from "../../providers/WorkspaceProvider";
import type { MessagePayload } from "../../providers/WorkspaceProvider";
import ActivityUserSkeleton from "../utils/ActivityUserSkeleton";

export type MessageType = "text" | "file" | "image" | "create" | "progress";

export interface ActivityContributor {
  id: number;
  email: string;
  name: string;
  full_name: string;
  avatar: string;
}

export interface Message {
  id: number | string;
  body: string;
  type: MessageType;
  contributor?: ActivityContributor;
  created_at_timestamp: string;
  time: string;
  timestamp: string;
  sent: boolean;
}

export interface ActivityType {
  id: string;
  item: Item;
  message: Message;
  last_read_at: string;
  unread_count: number;
}

type FilterValue = "create" | "progress" | "all";

const SIDEBAR_WIDTH = 300;

export default function Activity() {
  const {
    workspaces,
    setSelectedActivity,
    selectedActivity,
    setActivityCount,
    activityCount,
    socket,
  } = useWorkspaceContext();
  const { activity_id } = useParams();
  const user = getUserJson();
  const axios = useAxios();
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [activityTabValue, setActivityTabValue] = useState(0);
  const [filterValue, setFilterValue] = useState<FilterValue>("all");
  const [loading, setLoading] = useState(false);

  const getTabFilterValue = (value: number): FilterValue => {
    switch (value) {
      case 1:
        return "create";
      case 2:
        return "progress";
      default:
        return "all";
    }
  };

  const handleChangeActivityTab = (_: React.SyntheticEvent, value: number) => {
    const filter = getTabFilterValue(value);

    setActivityTabValue(value);
    setFilterValue(filter);
  };

  const markActivityAsReadAsync = async () => {
    try {
      const payLoad = {
        activity_id: activity_id,
      };
      await axios.post(`/task-activity/mark-as-read`, payLoad, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.auth_token}`,
        },
      });
    } catch (e) {
      // to do
    }
  };

  useEffect(() => {
    if (socket === null) return;

    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/task-activities`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.auth_token}`,
          },
        });
        const { data } = response.data;
        const formattedActivities = data.map((a: any) => {
          const activity = a.messages[0];
          const message: Message = {
            ...activity,
            time: activity?.created_at,
          };

          return {
            id: a.id,
            item: a.item,
            message: message,
            unread_count: a.unread_count,
          };
        });
        const sortedActivities = formattedActivities.sort(
          (a: ActivityType, b: ActivityType) =>
            new Date(b.last_read_at).getTime() -
            new Date(a.last_read_at).getTime()
        );

        setActivities(sortedActivities);
      } catch (e) {
        // to do
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    const handleReceiveUpdateAsync = async (data: any) => {
      fetchActivities();
      console.log(data);
    };

    socket.on("receive_user_update", handleReceiveUpdateAsync);

    return () => {
      socket.off("receive_user_update", handleReceiveUpdateAsync);
    };
  }, [socket]);

  useEffect(() => {
    if (socket === null) return;

    const handleReceiveMessage = (payload: MessagePayload) => {
      const { activity } = payload;
      const isCurrentActivity = activity.id === selectedActivity?.id;

      if (isCurrentActivity) {
        if (activityCount > 0) {
          setActivityCount((prev) => prev - activity.unread_count);
        }

        setActivities((prev) => {
          const updated = prev.map((a) =>
            a.id === activity.id ? { ...activity, unread_count: 0 } : a
          );

          return [...updated].sort((a, b) =>
            (b.last_read_at ?? "").localeCompare(a.last_read_at ?? "")
          );
        });
      } else {
        setActivities((prev) => {
          let found = false;

          const updated = prev.map((a) => {
            if (a.id === activity.id) {
              found = true;
              return activity;
            }
            return a;
          });

          const finalList = found ? updated : [activity, ...updated];

          return [...finalList].sort((a, b) =>
            (b.last_read_at ?? "").localeCompare(a.last_read_at ?? "")
          );
        });
      }

      markActivityAsReadAsync();
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, selectedActivity]);

  useEffect(() => {
    if (activity_id) {
      const currActivity = activities.find((a: any) => a.id === activity_id);

      if (!currActivity) return;

      if (activityCount > 0) {
        setActivityCount((prev) => prev - currActivity.unread_count);
      }

      if (currActivity.unread_count > 0) {
        setActivities((prev) =>
          prev.map((a) =>
            a.id === currActivity.id ? { ...a, unread_count: 0 } : a
          )
        );
      }

      markActivityAsReadAsync();
      setSelectedActivity(currActivity);
    } else {
      setSelectedActivity(null);
    }
  }, [activity_id, activities]);

  useEffect(() => {
    const totalUnread = activities.reduce(
      (total, a) => total + (a.unread_count || 0),
      0
    );
    setActivityCount(totalUnread);
  }, [activities]);

  return (
    <Box
      sx={{
        borderRadius: 2,
        backgroundColor: "#fff",
        border: "1px solid #fff",
        height: "82vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ width: SIDEBAR_WIDTH, boxSizing: "border-box" }}>
            <ActivityTabs
              value={activityTabValue}
              handleChange={handleChangeActivityTab}
            />
          </Box>
          <Divider orientation="vertical" sx={{ height: 20 }} />
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mx: 1 }}>
            <MessageRounded fontSize="small" color="action" />
            <Typography variant="body2" fontWeight="bold" color="textSecondary">
              Messages
            </Typography>
          </Box>
          <Divider orientation="vertical" sx={{ height: 20 }} />
          <Typography variant="body2" color="textSecondary" sx={{ mx: 1 }}>
            {selectedActivity?.item?.title ?? ""}
          </Typography>
        </Box>
        <Box sx={{ mx: 1 }}>
          {selectedActivity && (
            <AvatarGroup
              max={4}
              sx={{
                "& .MuiAvatar-root": {
                  width: 20,
                  height: 20,
                  fontSize: 12,
                },
              }}
            >
              {workspaces
                ?.find(
                  (w) => w.id === selectedActivity?.item.project?.workspace_id
                )
                ?.contributors.map((c, k) => (
                  <Avatar key={k} src={c.avatar} alt={c.name} />
                ))}
            </AvatarGroup>
          )}
        </Box>
      </Box>
      <Divider />
      <Box sx={{ display: "flex" }}>
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
          }}
        >
          <Box sx={{ height: "75vh", overflow: "auto" }}>
            {!loading ? (
              <>
                {activities
                  .filter(
                    (a) =>
                      a.message.type === filterValue || filterValue === "all"
                  )
                  .map((a, k) => (
                    <Box
                      key={k}
                      component={Link}
                      to={`/activity/${a.id}`}
                      sx={{ textDecoration: "none", color: "inherit" }}
                    >
                      <ActivityUser
                        activity={a}
                        selected={activity_id === a.id}
                      />
                    </Box>
                  ))}
              </>
            ) : (
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <ActivityUserSkeleton key={n} />
                ))}
              </>
            )}
          </Box>
        </Box>
        <Box sx={{ flex: 1 }}>
          {activity_id ? (
            <Outlet />
          ) : (
            <Box
              sx={{
                height: "70vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#eee",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <RestoreRounded sx={{ fontSize: 40 }} color="action" />
                <Typography variant="body2" color="textSecondary">
                  Cannot load messages.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
