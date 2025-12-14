import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { API_URL } from "../constants/Constants";
import { useAuth } from "./AuthProvider";

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  const { isAuthenticated, userHeaders } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    if (!userHeaders) return {};
    return {
      "access-token": userHeaders["access-token"],
      client: userHeaders.client,
      uid: userHeaders.uid,
      expiry: userHeaders.expiry,
      "Content-Type": "application/json",
    };
  }, [userHeaders]);

  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: getAuthHeaders(),
      });
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.errors || "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getAuthHeaders]);

  // Automatically fetch users when authenticated
  useEffect(() => {
    if (isAuthenticated && users.length === 0) {
      fetchUsers();
    }
  }, [isAuthenticated, fetchUsers, users.length]);

  const value = {
    users,
    loading,
    error,
    fetchUsers,
  };

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within UsersProvider");
  }
  return context;
};
