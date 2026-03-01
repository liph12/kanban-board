import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import useAxios from "../hooks/useAxios";
import { getUserJson } from "../helpers";
import type { Workspace, AutocompleteValue } from "../types/workspace";
import { createContext, useContext } from "react";
import { io, Socket } from "socket.io-client";
import type { Item } from "../types/card";
import type { ActivityType } from "../components/pages/Activity";
import type { Message } from "../components/pages/Activity";

export interface MessagePayload {
  activity: ActivityType;
  room: string;
}

export interface ServerToClientEvents {
  message: (data: string) => void;
  item_notification_update: (item: Item) => void;
  item_notification_store: (item: Item) => void;
  receive_message: (message: Message) => void;
  receive_user_update: (data: any) => void;
}

export interface ClientToServerEvents {
  update_item: (item: Item) => void;
  store_item: (item: Item) => void;
  register: (userId: number) => void;
  join_workspaces: (rooms: string[]) => void;
  send_message: (payload: MessagePayload) => void;
  update_user: (data: any) => void;
}

const SOCKET_API_URL =
  "https://system.leuteriorealty.com/services/task-master/notify";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  SOCKET_API_URL,
  {
    transports: ["websocket"],
  }
);

type WorkspaceContextType = {
  socket: Socket | null;
  workspaces: Workspace[] | null;
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[] | null>>;
  selectedWorkspace: AutocompleteValue | null;
  setSelectedWorkspace: React.Dispatch<
    React.SetStateAction<AutocompleteValue | null>
  >;
  selectedActivity: ActivityType | null;
  setSelectedActivity: React.Dispatch<
    React.SetStateAction<ActivityType | null>
  >;
  activityCount: number;
  setActivityCount: React.Dispatch<React.SetStateAction<number>>;
};

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: null,
  socket: socket,
  setWorkspaces: () => {},
  selectedWorkspace: null,
  setSelectedWorkspace: () => {},
  selectedActivity: null,
  setSelectedActivity: () => {},
  activityCount: 0,
  setActivityCount: () => {},
});

export default function WorkspaceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const user = getUserJson();
  const axios = useAxios();

  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<AutocompleteValue | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(
    null
  );
  const [activityCount, setActivityCount] = useState<number>(0);

  const updateActivityCount = async () => {
    const response = await axios.get("/task-activity-count", {
      headers: { Authorization: `Bearer ${user.auth_token}` },
    });

    const { activity_count } = response.data;

    setActivityCount(activity_count);
  };

  useEffect(() => {
    if (socket === null) return;

    if (user) {
      socket.emit("register", user?.email);
    }
  }, []);

  useEffect(() => {
    if (socket === null) return;

    if (workspaces) {
      const rooms = workspaces.map((w) => w.id);

      socket.emit("join_workspaces", rooms);
    }

    socket.on("receive_message", updateActivityCount);

    return () => {
      socket.off("receive_message", updateActivityCount);
    };
  }, [workspaces]);

  useEffect(() => {
    if (socket === null) return;

    const getWorkspaces = async () => {
      try {
        const response = await axios.get("/workspaces", {
          headers: { Authorization: `Bearer ${user.auth_token}` },
        });
        const { data } = response.data;
        setWorkspaces(data);
      } catch (error) {
        // to do
      }
    };
    getWorkspaces();
    updateActivityCount();

    const handleReceiveBulkUpdateAsync = async (data: any) => {
      console.log(data);

      await getWorkspaces();
      await updateActivityCount();
    };

    socket.on("receive_user_update", handleReceiveBulkUpdateAsync);

    return () => {
      socket.off("receive_user_update", handleReceiveBulkUpdateAsync);
    };
  }, [socket]);

  return (
    <WorkspaceContext.Provider
      value={{
        socket,
        workspaces,
        setWorkspaces,
        selectedWorkspace,
        setSelectedWorkspace,
        selectedActivity,
        setSelectedActivity,
        activityCount,
        setActivityCount,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  return useContext(WorkspaceContext);
}
