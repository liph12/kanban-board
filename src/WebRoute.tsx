import { Routes, Route } from "react-router-dom";
import Project from "./components/pages/Project";
import CreateWorkspace from "./components/pages/workspace/CreateWorkspace";
import CreateProject from "./components/pages/CreateProject";
import WorkspaceProjects from "./components/pages/workspace/WorkspaceProjects";
import WorkspaceSettings from "./components/pages/workspace/WorkspaceSettings";
import Activity from "./components/pages/Activity";
import Profile from "./components/pages/Profile";
import MainLayout from "./components/layouts/MainLayout";
import ActivityMessagesLayout from "./components/layouts/ActivityMessagesLayout";
import Main from "./components/pages/Main";
import ErrorPage from "./components/pages/ErrorPage";
import LoginLayout from "./components/layouts/LoginLayout";
import RegistrationLayout from "./components/layouts/RegistrationLayout";
import { useAuth } from "./providers/AuthProvider";

function WebRoute() {
  const { user } = useAuth();

  return (
    <Routes>
      {user ? (
        <Route element={<MainLayout />}>
          <Route path="/" element={<Main />} />
          <Route
            path="/workspace/:workspace_id"
            element={<WorkspaceProjects />}
          />
          <Route
            path="/workspace/:workspace_id/:project_id"
            element={<Project />}
          />
          <Route path="/create-workspace" element={<CreateWorkspace />} />
          <Route
            path="/workspace/:workspace_id/create-project"
            element={<CreateProject />}
          />
          <Route path="/settings/workspace" element={<WorkspaceSettings />} />
          <Route path="/settings/account" element={<Profile />} />
          <Route path="/activity" element={<Activity />}>
            <Route path=":activity_id" element={<ActivityMessagesLayout />} />
          </Route>
        </Route>
      ) : (
        <>
          <Route path="/login" element={<LoginLayout />} />
          <Route path="/register" element={<RegistrationLayout />} />
        </>
      )}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default WebRoute;
