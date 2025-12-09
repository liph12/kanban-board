import { Box, Typography, Grid, Divider, Button } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { getColorStatus } from "../../helpers";
import type { Item, Status } from "../../types/card";
import type { Notification } from "../../types/notification";
import type { Dispatch } from "react";
import ListCard from "../ListCard";
import CreateItem from "../CreateItem";
import { useState } from "react";
import { getUserJson } from "../../helpers";
import axios from "axios";

interface TaskLayoutProps {
  label: string;
  currStatus: Status;
  status: Status;
  color: string;
  bgColor: string;
  taskList: Item[];
  handleSelectStatus: (status: Status) => void;
  handleUpdateItemStatus: (id: number, status: Status) => void;
  setNotification: Dispatch<React.SetStateAction<Notification>>;
  setTaskList: Dispatch<React.SetStateAction<Item[]>>;
}

export default function TaskLayout({
  label,
  taskList,
  currStatus,
  status,
  color,
  bgColor,
  handleSelectStatus,
  handleUpdateItemStatus,
  setNotification,
  setTaskList,
}: TaskLayoutProps) {
  const user = getUserJson();
  const [formItem, setFormItem] = useState<Item>({
    id: 0,
    title: "",
    description: "",
    status: "pending",
    color: "#4a4a4a",
    startedAt: null,
    endedAt: null,
    updatedAt: null,
  });
  const [saveProgress, setSaveProgress] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.name;
    const value = e.target.value;

    setFormItem((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const storeTodoList = async (item: Item) => {
    const itemData = {
      ...item,
      date_start: item.startedAt,
      date_end: item.endedAt,
    };

    const response = await axios.post(
      "http://127.0.0.1:8000/api/v1/tasks",
      itemData,
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

    const newItem = await storeTodoList(item);
    const updatedList: Item[] = [...taskList, newItem];

    updatedList.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    setSaveProgress(false);

    setNotification((prev) => ({
      ...prev,
      open: true,
      message: "Task successfully created.",
      type: "success",
    }));
    setTaskList(updatedList);
    setFormItem({
      id: 0,
      title: "",
      description: "",
      status: "pending",
      color: "#4a4a4a",
      startedAt: null,
      endedAt: null,
      updatedAt: null,
    });
  };

  return (
    <Box
      sx={{
        px: 1,
        py: 1.5,
        borderRadius: 2,
        background: bgColor,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          width: 250,
        }}
      >
        <Typography color="#fff">
          {label} ({taskList.filter((task) => task.status === status).length})
        </Typography>
        <Button
          size="small"
          variant={currStatus === status ? "contained" : "outlined"}
          disableElevation
          color="inherit"
          onClick={() => handleSelectStatus(status)}
          startIcon={<AddRoundedIcon />}
          sx={{
            borderRadius: 5,
            textTransform: "none",
            backgroundColor: currStatus === status ? color : "none",
            color: "#fff",
            transition: "0.3s",
            position: "absolute",
            right: 0,
          }}
        >
          Add
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
        />
      )}
      <Box sx={{ height: "80vh", overflow: "auto" }}>
        <Grid container spacing={2}>
          {taskList
            .filter((item) => item.status === status)
            .map((item, idx) => (
              <Grid size={{ lg: 12, md: 12, xs: 12 }} key={idx}>
                <ListCard item={item} updateStatus={handleUpdateItemStatus} />
              </Grid>
            ))}
        </Grid>
      </Box>
    </Box>
  );
}
