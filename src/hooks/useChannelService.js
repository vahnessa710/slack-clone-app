import { useCallback } from "react";
import { useAuth } from "../context/AuthProvider";
import { channelService } from "../services/channelService";

export const useChannelService = () => {
  const { userHeaders, error: authError, logout, isAuthenticated } = useAuth();

  const handleAuthError = useCallback(
    (error) => {
      if (error.response?.status === 401) {
        console.log("Authentication failed, logging out");
        logout();
      }
    },
    [logout]
  );

  const ensureAuthenticated = useCallback(() => {
    if (!isAuthenticated || !userHeaders) {
      throw new Error("User is not authenticated");
    }
    return userHeaders;
  }, [isAuthenticated, userHeaders]);

  const getChannels = useCallback(async () => { // all channels under current user
    try {
      console.log("getChannels called with isAuthenticated:", isAuthenticated);
      const headers = ensureAuthenticated();
      return await channelService.getChannels(headers);
    } catch (error) {
      if (error.message === "User is not authenticated") {
        // Don't call handleAuthError for non-authenticated state
        throw new Error("Please log in to access channels");
      }
      handleAuthError(error);
      throw error;
    }
  }, [ensureAuthenticated, handleAuthError, isAuthenticated]);

  const createChannel = useCallback(
    async (channelData) => {
      try {
        const headers = ensureAuthenticated();
        return await channelService.createChannel(channelData, headers);
      } catch (error) {
        if (error.message === "User is not authenticated") {
          throw new Error("Please log in to create channels");
        }
        handleAuthError(error);
        throw error;
      }
    },
    [ensureAuthenticated, handleAuthError]
  );

  const getChannel = useCallback( // specific channel under current user
    async (id) => {
      try {
        const headers = ensureAuthenticated();
        // Fixed: Changed from getChannels to getChannel (assuming that's correct)
        return await channelService.getChannel(id, headers);
      } catch (error) {
        if (error.message === "User is not authenticated") {
          throw new Error("Please log in to view channel details");
        }
        handleAuthError(error);
        throw error;
      }
    },
    [ensureAuthenticated, handleAuthError]
  );

  const addMembers = useCallback(
    async (channelId, userIds) => {
      try {
        const headers = ensureAuthenticated();
        return await channelService.addMembers(channelId, userIds, headers);
      } catch (error) {
        if (error.message === "User is not authenticated") {
          throw new Error("Please log in to add members");
        }
        handleAuthError(error);
        throw error;
      }
    },
    [ensureAuthenticated, handleAuthError]
  );

  return {
    getChannels,
    createChannel,
    getChannel,
    addMembers,
    isAuthenticated,
    authError,
  };
};
