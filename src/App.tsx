import { Routes, Route } from "react-router-dom";
import Main from "./components/Main";
import Auth from "./components/Auth";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/:auth_type" element={<Auth />} />
    </Routes>
  );
}

export default App;
