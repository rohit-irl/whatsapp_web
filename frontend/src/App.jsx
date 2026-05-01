import { Navigate, Route, Routes } from "react-router-dom";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const ProtectedRoute = ({ children }) => {
  const storedUser = localStorage.getItem("chat_user");

  if (!storedUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  // Restore persisted theme on every render/refresh
  const savedTheme = localStorage.getItem("wa_theme");
  if (savedTheme === "Dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
