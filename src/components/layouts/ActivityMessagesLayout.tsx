import {
  Box,
  Typography,
  CircularProgress,
  Avatar,
  TextField,
  IconButton,
  Divider,
  LinearProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import {
  RestoreRounded,
  SendRounded,
  AddPhotoAlternate,
  AttachmentRounded,
  DoDisturbOn,
  ArrowUpward,
  TextSnippetRounded,
  JavascriptRounded,
  PhpRounded,
  HtmlRounded,
  CssRounded,
  StorageRounded,
  MoreVertRounded,
} from "@mui/icons-material";
import useAxios from "../../hooks/useAxios";
import { useState, useEffect, useRef, useMemo } from "react";
import type { ActivityContributor, Message } from "../pages/Activity";
import { getUserJson, shortenText } from "../../helpers";
import type { MessageType } from "../pages/Activity";
import { useWorkspaceContext } from "../../providers/WorkspaceProvider";
import { getStatusActivityValue } from "../../helpers";
import { getColorStatus } from "../../helpers";
import type { MessagePayload } from "../../providers/WorkspaceProvider";
import imageCompression from "browser-image-compression";
import { useAuth } from "../../providers/AuthProvider";
import { v4 as uuidv4 } from "uuid";
import StyledButton from "../utils/StyledButton";
import ActivityUserMessageSkeleton from "../utils/ActivityUserMessageSkeleton";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

type Attachment = {
  url: string;
  data: File | null;
  progress: number;
  uploaded: boolean;
};

export default function ActivityMessagesLayout() {
  const { selectedActivity, socket } = useWorkspaceContext();
  const { user } = useAuth();
  const axios = useAxios();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("lg"));
  const storedUser = getUserJson();
  const { activity_id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState<string>("");
  const [onProgress, setOnProgress] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [photos, setPhotos] = useState<Attachment[]>([]);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [hasFiles, setHasFiles] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    last: 1,
  });
  const photosInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const bottomMessagesRef = useRef<HTMLDivElement | null>(null);
  const messagesContainer = useRef<HTMLDivElement | null>(null);
  const isPaginatingRef = useRef(false);

  const groupMessages = (messages: Message[]) => {
    if (messages.length === 0) return [];

    const sorted = [...messages].sort(
      (a, b) =>
        new Date(a.created_at_timestamp).getTime() -
        new Date(b.created_at_timestamp).getTime()
    );

    let unsentMessage: Message | null = null;

    const lastMessage = sorted[sorted.length - 1];
    if (!lastMessage.sent) {
      unsentMessage = lastMessage;
      sorted.pop();
    }

    const groups: Message[][] = [];
    if (sorted.length === 0) return unsentMessage ? [[unsentMessage]] : [];

    let currentGroup: Message[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const current = sorted[i];

      const prevTime = new Date(prev.created_at_timestamp).getTime();
      const currentTime = new Date(current.created_at_timestamp).getTime();

      const diffInSeconds = (currentTime - prevTime) / 1000;

      if (
        diffInSeconds <= 10 &&
        prev.contributor?.id === current.contributor?.id
      ) {
        currentGroup.push(current);
      } else {
        groups.push(currentGroup);
        currentGroup = [current];
      }
    }

    groups.push(currentGroup);

    if (unsentMessage) {
      groups.push([unsentMessage]);
    }

    return groups;
  };

  const sendMessageAsync = async (type: MessageType, body: string) => {
    const client_id = uuidv4();

    try {
      const payLoad = {
        user_id: selectedActivity?.item?.contributor?.id,
        task_activity_id: activity_id,
        body,
        type,
      };

      if (user) {
        const now = new Date().toISOString();
        const sender: ActivityContributor = {
          id: user?.id,
          email: user?.email,
          name: user?.name,
          full_name: user?.full_name,
          avatar: user?.avatar,
        };

        const newMessage: Message = {
          id: client_id,
          body,
          type,
          contributor: sender,
          created_at_timestamp: now,
          time: "",
          timestamp: now,
          sent: false,
        };

        setMessages((prev) => [...prev, newMessage]);
      }

      const response = await axios.post(
        `/task-activity-messages/send`,
        payLoad,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.auth_token}`,
          },
        }
      );

      const { data } = response.data;
      const message = data.messages[0];
      const activity = {
        ...data,
        message: {
          ...message,
          time: message.created_at,
          sent: true,
          id: client_id,
        },
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
    if (photos.length > 0) {
      setSending(true);

      for (const p of photos) {
        await sendMessageAsync("image", p.url);
      }

      if (photosInputRef.current) {
        photosInputRef.current.value = "";
      }

      setPhotos([]);
      setSending(false);
    }

    if (files.length > 0) {
      setSending(true);

      for (const f of files) {
        await sendMessageAsync("file", f.url);
      }

      if (filesInputRef.current) {
        filesInputRef.current.value = "";
      }

      setFiles([]);
      setSending(false);
    }

    if (body.trim() === "") return;
    isPaginatingRef.current = false;

    setSending(true);
    setBody("");

    await sendMessageAsync("text", body);
    setSending(false);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (!desktop) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        await handleSendMessage();
      }
    }
  };

  const handlePaginate = () => {
    if (activity_id) {
      paginateMessages(activity_id, pagination.current + 1);

      setPagination((prev) => {
        const newPage = prev.current + 1;
        const updated = { ...prev, current: newPage };

        return updated;
      });
    }
  };

  const fetchMessages = async (id: string, page: number = 1): Promise<any> => {
    try {
      setOnProgress(true);
      const response = await axios.get(
        `/task-activity-messages/${id}?page=${page}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.auth_token}`,
          },
        }
      );
      const { data, meta } = response.data;
      const formattedMessages = data.map((m: any) => ({
        ...m,
        time: m.created_at,
      }));

      setPagination({
        current: meta.current_page,
        last: meta.last_page,
      });

      if (meta.current_page === 1) {
        setMessages(formattedMessages);
      }

      return { formattedMessages, meta };
    } catch (e) {
      // to do
    } finally {
      setOnProgress(false);
    }

    return null;
  };

  const paginateMessages = async (id: string, page: number = 1) => {
    isPaginatingRef.current = true;

    const { formattedMessages, meta } = await fetchMessages(id, page);

    setPagination({
      current: meta.current_page,
      last: meta.last_page,
    });

    setMessages((prev) => [...prev, ...formattedMessages]);
  };

  const handleImagePicker = () => {
    photosInputRef.current?.click();
  };

  const handleFilePicker = () => {
    filesInputRef.current?.click();
  };

  const handleRemovePhoto = (id: number) => {
    setPhotos((prev) => prev.filter((_, k) => k !== id));
    setHasFiles(false);
  };

  const handleRemoveFile = (id: number) => {
    setFiles((prev) => prev.filter((_, k) => k !== id));
    setHasFiles(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const _files = e.target.files;
    if (!_files) return;

    try {
      const mappedFiles = await Promise.all(
        Array.from(_files).map(async (file) => {
          return {
            url: URL.createObjectURL(file),
            data: file,
            progress: 0,
            uploaded: false,
          };
        })
      );

      setFiles((prev) => [...prev, ...mappedFiles]);
      setHasFiles(true);
      if (filesInputRef.current) {
        filesInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Image compression error:", err);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
    };

    try {
      const compressedPhotos = await Promise.all(
        Array.from(files).map(async (file) => {
          const compressedFile = await imageCompression(file, options);
          return {
            url: URL.createObjectURL(compressedFile),
            data: compressedFile,
            progress: 0,
            uploaded: false,
          };
        })
      );

      if (photosInputRef.current) {
        photosInputRef.current.value = "";
      }
      setPhotos((prev) => [...prev, ...compressedPhotos]);
      setHasFiles(true);
    } catch (err) {
      console.error("Image compression error:", err);
    }
  };

  const uploadPhotos = async (photo: Attachment, index: number) => {
    if (!photo.data) return;

    const formData = new FormData();
    formData.append("file", photo.data);

    try {
      const response = await axios.post("/upload-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${storedUser.auth_token}`,
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );

          setPhotos((prev) => {
            const newPhotos = [...prev];
            newPhotos[index].progress = progress;
            return newPhotos;
          });
        },
      });
      const { url } = response.data;

      setHasFiles(false);
      setPhotos((prev) => {
        const newPhotos = [...prev];
        newPhotos[index].uploaded = true;
        newPhotos[index].url = url;

        return newPhotos;
      });
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const uploadFiles = async (photo: Attachment, index: number) => {
    if (!photo.data) return;

    const formData = new FormData();
    formData.append("file", photo.data);

    try {
      const response = await axios.post("/upload-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${storedUser.auth_token}`,
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );

          setFiles((prev) => {
            const newFIles = [...prev];
            newFIles[index].progress = progress;
            return newFIles;
          });
        },
      });
      const { url } = response.data;

      setHasFiles(false);
      setFiles((prev) => {
        const newFIles = [...prev];
        newFIles[index].uploaded = true;
        newFIles[index].url = url;

        return newFIles;
      });
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const checkedFileExtension = (fileName: string) => {
    const isJs = /\.(js|ts|jsx|tsx|json)$/i.test(fileName);
    const isHtml = /\.(html?|xml)$/i.test(fileName);
    const isPhp = /\.(php)$/i.test(fileName);
    const isCss = /\.(css)$/i.test(fileName);
    const isSql = /\.(sql)$/i.test(fileName);
    const normalFile = !isJs && !isHtml && !isPhp && !isCss && !isSql;

    return { isJs, isHtml, isPhp, isCss, normalFile, isSql };
  };

  const downloadFile = async (url: string) => {
    const res = await fetch(
      `https://socket.leuteriorealty.com/proxy?url=${url}`
    );
    const blob = await res.blob();

    const fileName =
      new URL(url).pathname.split("/").pop() || "downloaded-file";

    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  };

  useEffect(() => {
    const handleUploadFiles = async () => {
      photos.forEach(async (p, k) => {
        await uploadPhotos(p, k);
      });
      files.forEach(async (p, k) => {
        await uploadFiles(p, k);
      });
    };

    if (hasFiles) {
      handleUploadFiles();
    }
  }, [hasFiles]);

  useEffect(() => {
    if (activity_id) {
      isPaginatingRef.current = false;
      setMessages([]);

      fetchMessages(activity_id);
    }
  }, [activity_id]);

  useEffect(() => {
    if (socket === null) return;

    const handleReceiveMessage = async (payload: MessagePayload) => {
      const { activity } = payload;

      if (activity.id === activity_id) {
        if (activity.message.contributor?.id === user?.id) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === activity.message.id
                ? { ...activity.message, sent: true }
                : m
            )
          );
        } else {
          const newMessage = {
            ...activity.message,
            sent: true,
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, selectedActivity, activity_id]);

  useEffect(() => {
    if (isPaginatingRef.current) return;

    bottomMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupedMessages: Message[][] = useMemo(() => {
    return groupMessages(messages);
  }, [messages]);

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
      {groupedMessages.length > 0 ? (
        <>
          <Box
            ref={messagesContainer}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%",
              overflowY: "auto",
              maxHeight: "78%",
              pb: 15,
            }}
          >
            {onProgress && (
              <Box>
                {[1, 2, 3, 4, 5].map((n) => (
                  <ActivityUserMessageSkeleton key={n} />
                ))}
              </Box>
            )}
            {!onProgress && pagination.current < pagination.last && (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <StyledButton
                  onClick={handlePaginate}
                  variant="contained"
                  size="small"
                  color="info"
                  sx={{ borderRadius: 5 }}
                  startIcon={<ArrowUpward fontSize="small" />}
                >
                  Load more
                </StyledButton>
              </Box>
            )}
            {groupedMessages.map((g, i) => {
              const firstMessage = g[0];

              return (
                <Box key={i} sx={{ my: 1.5 }}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Avatar
                      src={firstMessage?.contributor?.avatar}
                      alt={firstMessage?.contributor?.name}
                      sx={{ height: 30, width: 30 }}
                    />
                    <Box>
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {firstMessage?.contributor?.name}
                        </Typography>
                        <Typography variant="caption">
                          {firstMessage.sent
                            ? firstMessage?.time
                            : "Sending..."}
                        </Typography>
                      </Box>
                      {g.map((m, j) => {
                        const _fileName = m.body.split("/").pop() || "";
                        const fileName = m.type === "file" ? _fileName : "";
                        const [name, ext] = _fileName.split(".");
                        const {
                          isCss,
                          isHtml,
                          isJs,
                          isPhp,
                          normalFile,
                          isSql,
                        } = checkedFileExtension(fileName);

                        return (
                          <Box
                            key={j}
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "center",
                            }}
                          >
                            <Box>
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
                                  sx={{ whiteSpace: "pre-wrap" }}
                                >
                                  {m.body}
                                </Typography>
                              )}
                              {m.type === "image" && (
                                <Avatar
                                  src={m.body}
                                  variant="rounded"
                                  sx={{
                                    height: 200,
                                    width: "auto",
                                    border: "1px solid #ddd",
                                    my: 1,
                                  }}
                                />
                              )}
                              {m.type === "file" && (
                                <>
                                  <Box
                                    onClick={() => downloadFile(m.body)}
                                    sx={{
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      backgroundColor: "#fff",
                                      gap: 1,
                                      p: 1,
                                      borderRadius: 3,
                                      my: 1,
                                    }}
                                  >
                                    {isJs && <JavascriptRounded color="info" />}
                                    {isHtml && <HtmlRounded color="error" />}
                                    {isPhp && <PhpRounded color="primary" />}
                                    {isCss && <CssRounded color="primary" />}
                                    {isSql && <StorageRounded color="error" />}
                                    {normalFile && (
                                      <TextSnippetRounded color="action" />
                                    )}
                                    <Typography variant="caption">
                                      {`${shortenText(name ?? "", 8)}.${ext}`}
                                    </Typography>
                                  </Box>
                                </>
                              )}
                            </Box>
                            <IconButton
                              size="small"
                              sx={{
                                color: "#eee",
                                ":hover": {
                                  color: "gray",
                                },
                              }}
                            >
                              <MoreVertRounded fontSize="small" />
                            </IconButton>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              );
            })}
            <Box ref={bottomMessagesRef} />
          </Box>
        </>
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
              backgroundColor: "#fff",
              borderRadius: 3,
              width: "95%",
            }}
          >
            <Box sx={{ px: 1 }}>
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
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "none",
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
            </Box>
            {(photos.length > 0 || files.length > 0) && (
              <>
                <Box sx={{ display: "flex", gap: 1, p: 1 }}>
                  {photos.map((p, k) => (
                    <Box
                      key={k}
                      sx={{
                        backgroundColor: "#eee",
                        borderRadius: 2,
                        position: "relative",
                        p: 0.5,
                      }}
                    >
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: -15,
                          right: -15,
                          zIndex: 2,
                        }}
                        size="small"
                        color="error"
                        onClick={() => handleRemovePhoto(k)}
                      >
                        <DoDisturbOn fontSize="small" />
                      </IconButton>
                      <Avatar
                        src={p.url}
                        variant="rounded"
                        sx={{ height: 35, width: 35, zIndex: 1 }}
                      />
                      <LinearProgress
                        variant="determinate"
                        sx={{ borderRadius: 3 }}
                        value={p.progress || 0}
                      />
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: "flex", gap: 1, p: 1, overflowX: "auto" }}>
                  {files.map((p, k) => {
                    const fileName = `${p.data?.name}`;
                    const [name, ext] = fileName.split(".");
                    const { isCss, isHtml, isJs, isPhp, normalFile, isSql } =
                      checkedFileExtension(fileName);

                    return (
                      <Box
                        key={k}
                        sx={{
                          backgroundColor: "#eee",
                          borderRadius: 3,
                          position: "relative",
                          width: 120,
                          p: 1,
                        }}
                      >
                        <IconButton
                          sx={{
                            position: "absolute",
                            top: -15,
                            right: -15,
                            zIndex: 2,
                          }}
                          size="small"
                          color="error"
                          onClick={() => handleRemoveFile(k)}
                        >
                          <DoDisturbOn fontSize="small" />
                        </IconButton>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          {isJs && <JavascriptRounded color="info" />}
                          {isHtml && <HtmlRounded color="error" />}
                          {isPhp && <PhpRounded color="primary" />}
                          {isCss && <CssRounded color="primary" />}
                          {isSql && <StorageRounded color="error" />}
                          {normalFile && <TextSnippetRounded color="action" />}
                          <Typography variant="caption">
                            {`${shortenText(name ?? "", 8)}.${ext}`}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          sx={{ borderRadius: 3 }}
                          value={p.progress || 0}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 1,
                py: 0.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton onClick={handleImagePicker} size="small">
                  <AddPhotoAlternate color="action" />
                </IconButton>
                <input
                  ref={photosInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <IconButton onClick={handleFilePicker} size="small">
                  <AttachmentRounded color="action" />
                </IconButton>
                <input
                  ref={filesInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.js,.jsx,.tsx,.css,.ts,.html,.json,.geojson,.md,.sql"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <Divider sx={{ height: 20, mx: 1 }} orientation="vertical" />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  onClick={handleSendMessage}
                  size="small"
                  disabled={sending}
                >
                  {sending ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SendRounded color="info" />
                  )}
                </IconButton>
              </Box>
            </Box>
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
