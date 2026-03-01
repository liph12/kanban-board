import { Box, Typography, Grid, Divider, Button } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { getColorStatus } from "../../helpers";
import type { Item, Status, Contributor } from "../../types/card";
import type { Notification } from "../../types/notification";
import type { Dispatch } from "react";
import ListCard from "../ListCard";
import CreateItem from "../CreateItem";
import { useState } from "react";
import { getUserJson } from "../../helpers";
import useAxios from "../../hooks/useAxios";
import type { ColorGroup } from "./ProjectLayout";
import { useWorkspaceContext } from "../../providers/WorkspaceProvider";

interface TaskLayoutProps {
  label: string;
  currStatus: Status;
  status: Status;
  color: ColorGroup;
  bgColor: string;
  projectId: string;
  taskList: Item[];
  handleSelectStatus: (status: Status) => void;
  handleUpdateItemStatus: (id: number, status: Status) => void;
  setNotification: Dispatch<React.SetStateAction<Notification>>;
  setTaskList: Dispatch<React.SetStateAction<Item[]>>;
  isAdmin: boolean;
}

export default function TaskLayout({
  label,
  taskList,
  currStatus,
  status,
  color,
  projectId,
  handleSelectStatus,
  handleUpdateItemStatus,
  setNotification,
  isAdmin,
}: TaskLayoutProps) {
  const { socket } = useWorkspaceContext();
  const axios = useAxios();
  const user = getUserJson();
  const contributor: Contributor = {
    id: user?.id,
    email: user?.email,
    name: user?.name,
    avatar: user?.avatar,
    full_name: user?.full_name,
    permission: user?.permission,
  };
  const [formItem, setFormItem] = useState<Item>({
    id: 0,
    title: "",
    description: "",
    status: "pending",
    color: "#4a4a4a",
    projectId: projectId,
    contributor: contributor,
    startedAt: null,
    endedAt: null,
    updatedAt: null,
  });
  const [saveProgress, setSaveProgress] = useState(false);
  const tasks = taskList.filter((item) => item.status === status);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.name;
    const value = e.target.value;

    setFormItem((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const storeItem = async (item: Item) => {
    const itemData = {
      ...item,
      project_id: projectId,
      date_start: item.startedAt,
      date_end: item.endedAt,
    };

    const response = await axios.post("/tasks", itemData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.auth_token}`,
      },
    });

    const { data } = response.data;
    const newItem = data.item;
    const message = data.messages[0];
    const updatedItem = { ...newItem, unread_count: data.unread_count };

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

  const handleSubmitList = async (status: Status) => {
    if (formItem.title === "" || formItem.description === "") {
      return;
    }
    const item: Item = {
      ...formItem,
      status: status,
      color: getColorStatus(status),
    };

    setSaveProgress(true);

    const newItem = await storeItem(item);
    socket?.emit("store_item", newItem);

    setSaveProgress(false);
    setNotification((prev) => ({
      ...prev,
      open: true,
      message: "Item successfully added.",
      type: "info",
    }));
    setFormItem({
      id: 0,
      title: "",
      description: "",
      status: "pending",
      color: "#4a4a4a",
      projectId: projectId,
      contributor: contributor,
      startedAt: null,
      endedAt: null,
      updatedAt: null,
    });
  };

  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 3,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        height: currStatus === status || tasks.length > 0 ? "auto" : 70,
        transition: "0.5s",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: 250,
        }}
      >
        <Typography color="#555">
          {label} ({tasks.length})
        </Typography>
        <Button
          // fullWidth
          size="small"
          variant={currStatus === status ? "contained" : "outlined"}
          disableElevation
          color={color}
          onClick={() => handleSelectStatus(status)}
          startIcon={<AddRoundedIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Add item
        </Button>
      </Box>
      <Divider sx={{ my: 1 }} />
      {currStatus === status && (
        <CreateItem
          saving={saveProgress}
          onChange={handleChange}
          onSubmit={handleSubmitList}
          item={formItem}
          status={status}
          color={color}
        />
      )}
      <Box sx={{ height: "auto", overflow: "auto", mt: 1.5 }}>
        <Grid container spacing={2}>
          {tasks.map((item, idx) => (
            <Grid size={{ lg: 12, md: 12, xs: 12 }} key={idx}>
              <ListCard
                isAdmin={isAdmin}
                item={item}
                updateStatus={handleUpdateItemStatus}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
