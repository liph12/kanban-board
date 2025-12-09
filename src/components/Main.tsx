import { Box, Container, Typography } from "@mui/material";
import type { Status, Item } from "../types/card";
import { grey, blue, green, yellow } from "@mui/material/colors";
import TaskLayout from "./layouts/TaskLayout";
import Notification from "./Notification";
import type { Notification as NotificationType } from "../types/notification";
import type { SnackbarCloseReason } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { getUserJson } from "../helpers";

interface TaskStatus {
  label: string;
  status: Status;
  bgColor: string;
  color: string;
}

const taskStatusArray: TaskStatus[] = [
  {
    label: "Not started",
    status: "pending",
    bgColor: "rgba(60,60,60,0.5)",
    color: grey[700],
  },
  {
    label: "In Progress",
    status: "progress",
    bgColor: "#101d24",
    color: blue[700],
  },
  {
    label: "Done",
    status: "done",
    bgColor: "#102415",
    color: green[700],
  },
  {
    label: "Archived",
    status: "archived",
    bgColor: "#242110",
    color: yellow[900],
  },
];

export default function Main() {
  const user = getUserJson();
  const [notification, setNotification] = useState<NotificationType>({
    open: false,
    message: "",
    type: "success",
  });
  const [currStatus, setCurrStatus] = useState<Status>("pending");
  const [taskList, setTaskList] = useState<Item[]>([]);

  const handleSelectStatus = (status: Status) => setCurrStatus(status);

  const updateItem = async (id: number, status: Status): Promise<Item> => {
    const response = await axios.put(
      `http://127.0.0.1:8000/api/v1/tasks/${id}`,
      { status: status },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.auth_token}`,
        },
      }
    );
    const { data } = response.data;

    return data;
  };

  const handleUpdateItemStatus = async (id: number, status: Status) => {
    const currItem = await updateItem(id, status);
    const currItemIndex = taskList.findIndex((item) => item.id === currItem.id);
    let currList: Item[] = [...taskList];

    if (currItemIndex > -1) {
      currList[currItemIndex] = currItem;
    }

    currList.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    if (status === "delete") {
      setNotification((prev) => ({
        ...prev,
        open: true,
        message: "Task successfully deleted.",
        type: "error",
      }));
    }

    setTaskList(currList);
  };

  const updateList = async () => {
    const response = await axios.get("http://127.0.0.1:8000/api/v1/tasks", {
      headers: {
        Authorization: `Bearer ${user.auth_token}`,
      },
    });
    const jsonList = response.data?.data;

    if (!jsonList) return;

    const list: Item[] = jsonList;

    list.reverse();

    setTaskList(list);
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
    updateList();
  }, []);

  return (
    <>
      <Notification
        config={notification}
        handleClose={handleCloseNotification}
      />
      <Box
        sx={{
          height: "auto",
          display: "flex",
          gap: 3,
        }}
      >
        <Container>
          <Typography
            sx={{ color: "#fff", my: 3 }}
            variant="h4"
            fontWeight="bold"
          >
            TASK MASTER
          </Typography>
          <Box
            sx={{
              overflowX: "auto",
              display: "flex",
              gap: 3,
            }}
          >
            {taskStatusArray.map((task, key) => {
              const { label, bgColor, color, status } = task;

              return (
                <TaskLayout
                  key={key}
                  label={label}
                  bgColor={bgColor}
                  color={color}
                  currStatus={currStatus}
                  taskList={taskList}
                  status={status}
                  handleSelectStatus={handleSelectStatus}
                  handleUpdateItemStatus={handleUpdateItemStatus}
                  setNotification={setNotification}
                  setTaskList={setTaskList}
                />
              );
            })}
          </Box>
        </Container>
      </Box>
    </>
  );
}
