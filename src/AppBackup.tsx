import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Button,
  Container,
  Typography,
  Divider,
} from "@mui/material";
import { blue, grey, green, yellow } from "@mui/material/colors";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CreateItem from "./components/CreateItem";
import ListCard from "./components/ListCard";
import type { Status, Item } from "./types/card";
import { getColorStatus } from "./helpers";
import axios from "axios";
import Notification from "./components/Notification";
import type { Notification as NotificationType } from "./types/notification";
import type { SnackbarCloseReason } from "@mui/material";

function AppBackup() {
  const [formItem, setFormItem] = useState<Item>({
    id: 0,
    title: "",
    description: "",
    status: "pending",
    color: "#4a4a4a",
    startedAt: null,
    endedAt: null,
  });
  const [todoList, setTodoList] = useState<Item[]>([]);
  const [currStatus, setCurrStatus] = useState<Status>("pending");
  const [notification, setNotification] = useState<NotificationType>({
    open: false,
    message: "",
    type: "success",
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
      "https://api.taskmastersystem.ph/api/v1/tasks",
      itemData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = response.data;

    return data;
  };

  const updateItem = async (id: number, status: Status) => {
    const response = await axios.put(
      `https://api.taskmastersystem.ph/api/v1/tasks/${id}`,
      { status: status },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const { data } = response.data;

    console.log(data);
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
    const updatedList: Item[] = [...todoList, newItem];

    setSaveProgress(false);

    setNotification((prev) => ({
      ...prev,
      open: true,
      message: "Task successfully created.",
      type: "success",
    }));
    setTodoList(updatedList);
    setFormItem({
      id: 0,
      title: "",
      description: "",
      status: "pending",
      color: "#4a4a4a",
      startedAt: null,
      endedAt: null,
    });
  };

  const handleSelectStatus = (status: Status) => setCurrStatus(status);

  const handleUpdateItemStatus = (id: number, status: Status) => {
    let currList: Item[] = [...todoList]; // 0 - N
    let currItem = currList.find((item) => item.id === id);

    if (currItem) {
      if (status === "delete") {
        currList = currList.filter((item) => item.id !== id);
      } else {
        currItem.status = status;
      }

      setTodoList(currList);
      updateItem(id, status);
    }
  };

  const updateList = async () => {
    const response = await axios.get(
      "https://api.taskmastersystem.ph/api/v1/tasks"
    );
    const jsonList = response.data?.data;

    setFormItem((prev) => ({
      ...prev,
      id: todoList.length + 1,
    }));

    if (!jsonList) return;

    const list: Item[] = jsonList;

    list.reverse();

    setTodoList(list);
  };

  const handleCloseNotification = (
    event?: React.SyntheticEvent | Event,
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
          display: "fex",
          gap: 3,
        }}
      >
        {/* <Box sx={{ height: "100vh", width: "16vw", background: grey[700] }}></Box> */}
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
            <Box
              sx={{
                px: 1,
                py: 1.5,
                borderRadius: 2,
                background: "rgba(60,60,60,0.5)",
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
                  Not started (
                  {todoList.filter((item) => item.status === "pending").length})
                </Typography>
                <Button
                  size="small"
                  variant={currStatus === "pending" ? "contained" : "outlined"}
                  disableElevation
                  color="inherit"
                  onClick={() => handleSelectStatus("pending")}
                  startIcon={<AddRoundedIcon />}
                  sx={{
                    borderRadius: 5,
                    textTransform: "none",
                    backgroundColor:
                      currStatus === "pending" ? grey[700] : "none",
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
              {currStatus === "pending" && (
                <CreateItem
                  saving={saveProgress}
                  onChange={handleChange}
                  onSubmit={handleSubmitList}
                  item={formItem}
                  status="pending"
                />
              )}
              <Box sx={{ height: "80vh", overflow: "auto" }}>
                <Grid container spacing={2}>
                  {todoList
                    .filter((item) => item.status === "pending")
                    .map((item, idx) => (
                      <Grid size={{ lg: 12, md: 12, xs: 12 }} key={idx}>
                        <ListCard
                          item={item}
                          updateStatus={handleUpdateItemStatus}
                        />
                      </Grid>
                    ))}
                </Grid>
              </Box>
            </Box>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                background: "#101d24",
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
                  In progress (
                  {todoList.filter((item) => item.status === "progress").length}
                  )
                </Typography>
                <Button
                  size="small"
                  variant={currStatus === "progress" ? "contained" : "outlined"}
                  disableElevation
                  color="primary"
                  onClick={() => handleSelectStatus("progress")}
                  startIcon={<AddRoundedIcon />}
                  sx={{
                    borderRadius: 5,
                    textTransform: "none",
                    backgroundColor:
                      currStatus === "progress" ? blue[700] : "none",
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
              {currStatus === "progress" && (
                <CreateItem
                  saving={saveProgress}
                  onChange={handleChange}
                  onSubmit={handleSubmitList}
                  item={formItem}
                  status="progress"
                />
              )}
              <Box sx={{ height: "80vh", overflow: "auto" }}>
                <Grid container spacing={2}>
                  {todoList
                    .filter((item) => item.status === "progress")
                    .map((item, idx) => (
                      <Grid size={{ lg: 12, md: 12, xs: 12 }} key={idx}>
                        <ListCard
                          item={item}
                          updateStatus={handleUpdateItemStatus}
                        />
                      </Grid>
                    ))}
                </Grid>
              </Box>
            </Box>
            <Box
              sx={{
                px: 1,
                py: 1.5,
                borderRadius: 2,
                background: "#102415",
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
                  Done (
                  {todoList.filter((item) => item.status === "done").length})
                </Typography>
                <Button
                  size="small"
                  variant={currStatus === "done" ? "contained" : "outlined"}
                  disableElevation
                  color="success"
                  onClick={() => handleSelectStatus("done")}
                  startIcon={<AddRoundedIcon />}
                  sx={{
                    borderRadius: 5,
                    textTransform: "none",
                    backgroundColor:
                      currStatus === "done" ? green[700] : "none",
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
              {currStatus === "done" && (
                <CreateItem
                  saving={saveProgress}
                  onChange={handleChange}
                  onSubmit={handleSubmitList}
                  item={formItem}
                  status="done"
                />
              )}
              <Box sx={{ height: "80vh", overflow: "auto" }}>
                <Grid container spacing={2}>
                  {todoList
                    .filter((item) => item.status === "done")
                    .map((item, idx) => (
                      <Grid size={{ lg: 12, md: 12, xs: 12 }} key={idx}>
                        <ListCard
                          item={item}
                          updateStatus={handleUpdateItemStatus}
                        />
                      </Grid>
                    ))}
                </Grid>
              </Box>
            </Box>
            <Box
              sx={{
                px: 1,
                py: 1.5,
                borderRadius: 2,
                background: "#242110",
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
                  Archived (
                  {todoList.filter((item) => item.status === "archived").length}
                  )
                </Typography>
                <Button
                  size="small"
                  variant={currStatus === "archived" ? "contained" : "outlined"}
                  disableElevation
                  color="warning"
                  onClick={() => handleSelectStatus("archived")}
                  startIcon={<AddRoundedIcon />}
                  sx={{
                    borderRadius: 5,
                    textTransform: "none",
                    backgroundColor:
                      currStatus === "archived" ? yellow[900] : "none",
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
              {currStatus === "archived" && (
                <CreateItem
                  saving={saveProgress}
                  onChange={handleChange}
                  onSubmit={handleSubmitList}
                  item={formItem}
                  status="archived"
                />
              )}
              <Box sx={{ height: "80vh", overflow: "auto" }}>
                <Grid container spacing={2}>
                  {todoList
                    .filter((item) => item.status === "archived")
                    .map((item, idx) => (
                      <Grid size={{ lg: 12, md: 12, xs: 12 }} key={idx}>
                        <ListCard
                          item={item}
                          updateStatus={handleUpdateItemStatus}
                        />
                      </Grid>
                    ))}
                </Grid>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}

export default AppBackup;
