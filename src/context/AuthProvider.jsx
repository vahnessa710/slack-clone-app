import { useState, createContext, useContext, useEffect } from "react";
import { API_URL } from "../constants/Constants";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userHeaders, setUserHeaders] = useState(() => {
    // Check localStorage on initial load
    const stored = localStorage.getItem("userHeaders");
    return stored ? JSON.parse(stored) : null;
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to check if token is expired
  const isTokenExpired = (expiry) => {
    if (!expiry) return true;
    const expiryTime = parseInt(expiry) * 1000; // Convert to milliseconds
    return Date.now() > expiryTime;
  };

  // Save headers to both state and localStorage
  const handleHeaders = (headers) => {
    const updatedHeaders = {
      "access-token": headers["access-token"],
      uid: headers.uid,
      expiry: headers.expiry,
      client: headers.client,
    };

    setUserHeaders(updatedHeaders);
    localStorage.setItem("userHeaders", JSON.stringify(updatedHeaders));
    // Optional: You might not need these separate items if you're using userHeaders object
  };

  const logout = () => {
    setUserHeaders(null);
    setCurrentUser(null);
    localStorage.removeItem("userHeaders");
    // Also remove the separate items if you're keeping them
    localStorage.removeItem("access-token");
    localStorage.removeItem("uid");
    localStorage.removeItem("client");
    localStorage.removeItem("expiry");
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/auth/sign_in`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        const { "access-token": token, client, uid, expiry } = response.headers;

        handleHeaders({
          "access-token": token,
          client,
          uid,
          expiry,
        });

        // Set current user immediately from response
        setCurrentUser(response.data.data);
        setError(null);
        return { success: true, user: response.data.data };
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.errors || "Invalid credentials");
      return {
        success: false,
        error: error.response?.data?.errors || "Invalid credentials",
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, passwordConfirmation) => {
    if (password !== passwordConfirmation) {
      return { success: false, error: "Passwords do not match" };
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/auth`,
        {
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        const { "access-token": token, client, uid, expiry } = response.headers;

        handleHeaders({
          "access-token": token,
          client,
          uid,
          expiry,
        });

        setCurrentUser(response.data.data);
        setError(null);

        return { success: true, user: response.data.data };
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError(
        error.response?.data?.errors?.full_messages?.join(", ") ||
          "Error creating account"
      );
      return {
        success: false,
        error:
          error.response?.data?.errors?.full_messages?.join(", ") ||
          "Error creating account",
      };
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user when headers are available
  useEffect(() => {
    const fetchCurrentUser = async () => {
      // Don't fetch if no headers
      if (!userHeaders) {
        setLoading(false);
        return;
      }

      // Check if token is expired before making the request
      if (isTokenExpired(userHeaders.expiry)) {
        console.log("Token expired, logging out");
        logout();
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/auth/validate_token`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "access-token": userHeaders["access-token"],
            client: userHeaders.client,
            uid: userHeaders.uid,
          },
        });

        // If unauthorized, clear the stale auth data
        if (response.status === 401) {
          console.log("Unauthorized, clearing auth state");
          logout();
          return;
        }

        // Handle other non-OK responses
        if (!response.ok) {
          throw new Error(`Failed to validate token: ${response.status}`);
        }

        const data = await response.json();
        setCurrentUser(data.data || data);
        setError(null);
      } catch (err) {
        console.error("Error fetching current user:", err);
        setError(err.message);

        // Only logout on actual auth errors, not network errors
        if (
          err.message.includes("401") ||
          err.message.includes("Unauthorized")
        ) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [userHeaders]);

  const refreshUser = async () => {
    if (!userHeaders) return;

    try {
      const response = await fetch(`${API_URL}/users/current`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "access-token": userHeaders["access-token"],
          client: userHeaders.client,
          uid: userHeaders.uid,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      } else if (response.status === 401) {
        logout(); // Token invalid, log out
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        handleHeaders,
        userHeaders,
        currentUser,
        loading,
        error,
        logout,
        refreshUser,
        isAuthenticated: !!userHeaders && !!currentUser,
        login,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthProvider;
