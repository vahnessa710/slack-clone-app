// src/context/ChannelProvider.jsx
import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { channelService } from "../services/channelService";
import { useAuth } from "./AuthProvider"; 

const ChannelContext = createContext();

export const ChannelProvider = ({ children }) => {
  const { isAuthenticated, userHeaders } = useAuth(); // Get auth state
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
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

  // Automatically fetch channels when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      fetchChannels();
    } else {
      // Clear channels when user logs out
      setChannels([]);
      setCurrentChannel(null);
    }
  }, [isAuthenticated]);

  // Fetch all channels for the user
  const fetchChannels = useCallback(async () => {
    if (!isAuthenticated) {
      console.warn("Cannot fetch channels: user not authenticated");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await channelService.getChannels(getAuthHeaders());
      setChannels(data);
      return data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.errors ||
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch channels";
      setError(errorMessage);
      console.error("Error in fetchChannels:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getAuthHeaders]);

  // Create a new channel
  const createChannel = useCallback(
    async (name, userIds = []) => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to create a channel");
      }

      setLoading(true);
      setError(null);
      try {
        const channelData = {
          name: name.trim(),
          user_ids: userIds
            .map((id) => parseInt(id, 10))
            .filter((id) => !isNaN(id)),
        };

        // Validate
        if (!channelData.name) {
          throw new Error("Channel name is required");
        }

        const newChannel = await channelService.createChannel(channelData);

        // Update local state
        setChannels((prev) => [newChannel, ...prev]);
        setCurrentChannel(newChannel);

        return newChannel;
      } catch (err) {
        const errorMessage =
          err.response?.data?.errors ||
          err.response?.data?.error ||
          err.message ||
          "Failed to create channel";
        setError(errorMessage);
        console.error("Error in createChannel:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Fetch single channel details
  const fetchChannel = useCallback(
    async (id) => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to view channels");
      }

      setLoading(true);
      setError(null);
      try {
        const channel = await channelService.getChannel(id);
        setCurrentChannel(channel);
        return channel;
      } catch (err) {
        const errorMessage =
          err.response?.data?.errors ||
          err.response?.data?.error ||
          err.message ||
          "Failed to fetch channel";
        setError(errorMessage);
        console.error("Error in fetchChannel:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Add members to channel
  const addChannelMembers = useCallback(
    async (channelId, userIds) => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to add members");
      }

      setLoading(true);
      setError(null);
      try {
        // Convert to integers and filter out invalid IDs
        const validUserIds = userIds
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id) && id > 0);

        if (validUserIds.length === 0) {
          throw new Error("No valid user IDs provided");
        }

        const result = await channelService.addMembers(channelId, validUserIds);

        // Refresh current channel if it's the one we modified
        if (currentChannel?.id === channelId) {
          await fetchChannel(channelId);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err.response?.data?.errors ||
          err.response?.data?.error ||
          err.message ||
          "Failed to add members";
        setError(errorMessage);
        console.error("Error in addChannelMembers:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, currentChannel, fetchChannel]
  );

  // Select a channel (without fetching details)
  const selectChannel = useCallback((channel) => {
    setCurrentChannel(channel);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    // State
    channels,
    currentChannel,
    loading,
    error,

    // Actions
    fetchChannels,
    createChannel,
    fetchChannel,
    addChannelMembers,
    selectChannel,
    clearError,

    // Helper
    isReady: isAuthenticated && !loading,
  };

  return (
    <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>
  );
};

export const useChannel = () => {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error("useChannel must be used within ChannelProvider");
  }
  return context;
};
