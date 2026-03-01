import WebRoute from "./WebRoute";
import { AuthProvider } from "./providers/AuthProvider";
import WorkspaceProvider from "./providers/WorkspaceProvider";

function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <WebRoute />
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;
