import { Box } from "@mui/material";
import type { Status, Item } from "../../types/card";
import TaskLayout from "../layouts/TaskLayout";
import Notification from "../Notification";
import type { Notification as NotificationType } from "../../types/notification";
import type { SnackbarCloseReason } from "@mui/material";
import { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";
import { getUserJson } from "../../helpers";
import { useParams } from "react-router-dom";
import { useWorkspaceContext } from "../../providers/WorkspaceProvider";
import type { ActivityType } from "../pages/Activity";
import type { MessagePayload } from "../../providers/WorkspaceProvider";

export type ColorGroup = "inherit" | "info" | "success" | "warning";

interface TaskGroup {
  label: string;
  status: Status;
  bgColor: string;
  color: ColorGroup;
  colorName: string;
}

const taskGroups: TaskGroup[] = [
  {
    label: "Not started",
    status: "pending",
    bgColor: "#212121",
    color: "inherit",
    colorName: "Default",
  },
  {
    label: "In Progress",
    status: "progress",
    bgColor: "#101d24",
    color: "info",
    colorName: "Default",
  },
  {
    label: "Done",
    status: "done",
    bgColor: "#102415",
    color: "success",
    colorName: "Default",
  },
  {
    label: "Archived",
    status: "archived",
    bgColor: "#242110",
    color: "warning",
    colorName: "Default",
  },
];

export default function ProjectLayout() {
  const { socket, workspaces } = useWorkspaceContext();
  const { workspace_id, project_id } = useParams();
  const axios = useAxios();
  const user = getUserJson();
  const [notification, setNotification] = useState<NotificationType>({
    open: false,
    message: "",
    type: "success",
  });
  const [currStatus, setCurrStatus] = useState<Status>("pending");
  const [taskList, setTaskList] = useState<Item[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const handleSelectStatus = (status: Status) => setCurrStatus(status);

  const updateItem = async (id: number, status: Status): Promise<Item> => {
    const response = await axios.put(
      `/tasks/${id}`,
      { status: status },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.auth_token}`,
        },
      }
    );
    const { data } = response.data;
    const updatedItem = {
      ...data.item,
      unread_count: data.unread_count,
    };
    const message = data.messages[0];

    const activity = {
      ...data,
      message: { ...message, time: message.created_at },
    };

    const messagePayload = {
      activity: activity,
      room: updatedItem.project?.workspace_id,
    };

    socket?.emit("send_message", messagePayload);

    return updatedItem;
  };

  const handleUpdateItemStatus = async (id: number, status: Status) => {
    const currItem = await updateItem(id, status);
    socket?.emit("update_item", currItem);
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
    if (socket === null) return;

    const handleReceiveMessage = (payload: MessagePayload) => {
      const { activity } = payload;
      let item = activity.item;
      const owner = activity.message.contributor?.email === user.email;

      if (owner) {
        item = {
          ...item,
          unread_count: 0,
        };
      }

      setTaskList((prev) => {
        let updated;

        const found = prev.find((t) => t.id === item.id);

        if (found) {
          updated = prev.map((t) => (t.id === item.id ? item : t));
        } else {
          updated = [...prev, item];
        }

        updated.sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });

        return updated;
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket]);

  useEffect(() => {
    const fetchTasksAcitivty = async () => {
      const response = await axios.get(`/task-activities/${project_id}`, {
        headers: {
          Authorization: `Bearer ${user.auth_token}`,
        },
      });
      const activity = response.data?.data;

      if (!activity) return;

      const items: Item[] = activity.map((a: ActivityType) => ({
        ...a.item,
        unread_count: a.unread_count,
      }));

      setTaskList(items);
    };

    fetchTasksAcitivty();
  }, [project_id]);

  useEffect(() => {
    if (workspace_id) {
      const workspace = workspaces?.find((w) => w.id === workspace_id);
      if (workspace) {
        const contributor = workspace.contributors.find(
          (c) => c.email === user.email
        );
        const owner = workspace.owner.email === user.email;
        const _isAdmin = contributor?.permission === "admin" || owner;

        setIsAdmin(_isAdmin);
      }
    }
  }, [workspace_id, workspaces]);

  return (
    <>
      <Notification
        config={notification}
        handleClose={handleCloseNotification}
      />
      <Box>
        <Box sx={{ overflowX: "auto" }}>
          <Box
            sx={{
              display: "flex",
              gap: 3,
              alignItems: "flex-start",
            }}
          >
            {project_id && (
              <>
                {taskGroups.map((task, key) => {
                  const { label, bgColor, color, status } = task;

                  return (
                    <TaskLayout
                      key={key}
                      isAdmin={isAdmin}
                      label={label}
                      bgColor={bgColor}
                      color={color}
                      currStatus={currStatus}
                      taskList={taskList}
                      status={status}
                      projectId={project_id}
                      handleSelectStatus={handleSelectStatus}
                      handleUpdateItemStatus={handleUpdateItemStatus}
                      setNotification={setNotification}
                      setTaskList={setTaskList}
                    />
                  );
                })}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
