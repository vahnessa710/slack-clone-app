import { useCallback } from "react";
import { useAuth } from "../context/AuthProvider";
import { messageService } from "../services/messageService";

export const useMessageService = () => {
  const { userHeaders, logout } = useAuth();

  const handleAuthError = useCallback(
    (error) => {
      if (error?.response?.status === 401) {
        logout();
      }
      throw error;
    },
    [logout]
  );

 const fetchMessages = useCallback(
   async (channelId) => {
     if (!userHeaders) {
       // Early exit if no auth headers
       console.warn("Cannot fetch messages: no authentication headers");
       return [];
     }

     try {
       return await messageService.getMessages(channelId, userHeaders);
     } catch (error) {
       handleAuthError(error);
       return []; // Return empty array instead of throwing
     }
   },
   [userHeaders, handleAuthError]
 );
//  console.log("fetchMessages with userHeaders:", userHeaders);
  const sendMessage = useCallback(
    async (channelId, content) => {
      try {
        return await messageService.createMessage(
          channelId,
          content,
          userHeaders
        );
      } catch (error) {
        handleAuthError(error);
      }
    },
    [userHeaders, handleAuthError]
  );

  return {
    fetchMessages,
    sendMessage,
  };
};
