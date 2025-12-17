import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Login from "./pages/Login/Login.jsx";
import AuthProvider from "./context/AuthProvider.jsx";
import { useAuth } from "./context/AuthProvider.jsx"; // Add this
import "./App.css";
import { ChannelProvider } from "./context/ChannelProvider.jsx";
import { UsersProvider } from "./context/UsersProvider";
import { MessagesProvider } from "./context/MessagesProvider.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Add a proper loading component
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <UsersProvider>
        <ChannelProvider>
          <MessagesProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </BrowserRouter>
          </MessagesProvider>
        </ChannelProvider>
      </UsersProvider>
    </AuthProvider>
  );
}

export default App;
