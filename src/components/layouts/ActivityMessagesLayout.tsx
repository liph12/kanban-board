import {
  Box,
  Typography,
  CircularProgress,
  Avatar,
  TextField,
  IconButton,
  Divider,
} from "@mui/material";
import { useParams } from "react-router-dom";
import {
  RestoreRounded,
  SendRounded,
  AddPhotoAlternate,
  AttachmentRounded,
} from "@mui/icons-material";
import useAxios from "../../hooks/useAxios";
import { useState, useEffect } from "react";
import type { Message } from "../pages/Activity";
import { getUserJson } from "../../helpers";
import type { MessageType } from "../pages/Activity";
import { useWorkspaceContext } from "../../providers/WorkspaceProvider";
import { getStatusActivityValue } from "../../helpers";
import { getColorStatus } from "../../helpers";
import type { MessagePayload } from "../../providers/WorkspaceProvider";

export default function ActivityMessagesLayout() {
  const { selectedActivity, socket } = useWorkspaceContext();
  const axios = useAxios();
  const user = getUserJson();
  const { activity_id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState<string>("");
  const [onProgress, setOnProgress] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);

  const sendMessageAsync = async (type: MessageType) => {
    try {
      const payLoad = {
        user_id: selectedActivity?.item?.contributor?.id,
        task_activity_id: activity_id,
        body: body,
        type: type,
      };

      const response = await axios.post(
        `/task-activity-messages/send`,
        payLoad,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.auth_token}`,
          },
        }
      );

      const { data } = response.data;
      const message = data.messages[0];
      const activity = {
        ...data,
        message: { ...message, time: message.created_at },
      };
      const messagePayload = {
        activity: activity,
        room: selectedActivity?.item.project?.workspace_id,
      };

      socket?.emit("send_message", messagePayload);
    } catch (e) {
      // to do
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (body.trim() === "") return;

    setSending(true);
    setBody("");
    await sendMessageAsync("text");
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (!isMobile) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // prevent new line
        await handleSendMessage();
      }
    }
  };

  const fetchMessages = async (id: string) => {
    try {
      setOnProgress(true);
      const response = await axios.get(`/task-activity-messages/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.auth_token}`,
        },
      });
      const { data } = response.data;
      const formattedMessages = data.map((m: any) => ({
        ...m,
        time: m.created_at,
      }));

      setMessages(formattedMessages);
    } catch (e) {
      // to do
    } finally {
      setOnProgress(false);
    }
  };

  useEffect(() => {
    if (activity_id) {
      fetchMessages(activity_id);
    }
  }, [activity_id]);

  useEffect(() => {
    if (socket === null) return;

    const handleReceiveMessage = async (payload: MessagePayload) => {
      const { activity } = payload;

      setMessages((prev) => [activity.message, ...prev]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, selectedActivity, activity_id]);

  return (
    <Box
      sx={{
        display: "flex",
        backgroundColor: "#eee",
        justifyContent: "center",
        height: "75vh",
        alignItems: "flex-end",
        position: "relative",
        px: 2,
      }}
    >
      {messages.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column-reverse",
            gap: 1,
            width: "100%",
            overflowY: "auto",
            maxHeight: "88%",
            pb: 8,
          }}
        >
          {messages.map((m, k) => (
            <Box key={k} sx={{ my: 1.5 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Avatar
                  src={m.contributor?.avatar}
                  alt={m.contributor?.name}
                  sx={{ height: 30, width: 30 }}
                />
                <Box>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography variant="body2" fontWeight="bold">
                      {m?.contributor?.name}
                    </Typography>
                    <Typography variant="caption">{m.time}</Typography>
                  </Box>
                  {m.type === "create" && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="pre"
                    >
                      Created a new item{" "}
                      <Typography
                        component="span"
                        color={getColorStatus(m.body)}
                        variant="body2"
                      >
                        ●
                      </Typography>{" "}
                      <b>{getStatusActivityValue(m.body)}</b>
                    </Typography>
                  )}
                  {m.type === "progress" && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="pre"
                    >
                      Updated an item{" "}
                      <Typography
                        component="span"
                        color={getColorStatus(m.body)}
                        variant="body2"
                      >
                        ●
                      </Typography>{" "}
                      <b>{getStatusActivityValue(m.body)}</b>
                    </Typography>
                  )}
                  {m.type === "text" && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="pre"
                    >
                      {m.body}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            height: "70vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
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
            {onProgress ? (
              <CircularProgress sx={{ fontSize: 30 }} />
            ) : (
              <>
                <RestoreRounded sx={{ fontSize: 40 }} color="action" />
                <Typography variant="body2" color="textSecondary">
                  Something went wrong.
                </Typography>
              </>
            )}
          </Box>
        </Box>
      )}

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#eee",
          alignItems: "flex-end",
          py: 1,
        }}
      >
        {selectedActivity?.item.status !== "delete" ? (
          <Box
            sx={{
              width: "95%",
              backgroundColor: "#fff",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <IconButton sx={{ ml: 0.5 }}>
              {sending ? (
                <CircularProgress size={20} />
              ) : (
                <AddPhotoAlternate color="action" />
              )}
            </IconButton>
            <IconButton sx={{ ml: 0.5 }}>
              {sending ? (
                <CircularProgress size={20} />
              ) : (
                <AttachmentRounded color="action" />
              )}
            </IconButton>
            <Divider sx={{ height: 20 }} orientation="vertical" />
            <TextField
              fullWidth
              multiline
              minRows={1}
              maxRows={8}
              placeholder="Type message here..."
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleKeyDown}
              value={body}
              sx={{
                "& .MuiOutlinedInput-root": {
                  padding: 1,
                  borderRadius: 8,
                  "& fieldset": {
                    borderColor: "#fff",
                  },
                  "&:hover fieldset": {
                    borderColor: "#fff",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#fff",
                  },
                  "& .MuiInputBase-input": {
                    paddingY: 0.5,
                    paddingX: 0,
                    fontSize: 15,
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#999",
                  opacity: 1,
                  fontSize: 15,
                },
              }}
            />
            <IconButton sx={{ mr: 0.5 }} onClick={handleSendMessage}>
              {sending ? (
                <CircularProgress size={20} />
              ) : (
                <SendRounded color="info" />
              )}
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ py: 1 }}>
            <Typography color="textDisabled" variant="body2">
              Action blocked — this item was just deleted and is no longer
              available for send or update operations.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
