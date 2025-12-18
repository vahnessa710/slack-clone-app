import { createContext, useContext, useState, useEffect } from "react";
import { useMessageService } from "../hooks/useMessageService";
import { useAuth } from "../context/AuthProvider";

const MessagesContext = createContext();

export const MessagesProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { fetchMessages, sendMessage } = useMessageService();

  // Clear messages when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setMessages([]);
      setActiveChannelId(null);
    }
  }, [isAuthenticated]);

  const loadMessages = async (channelId) => {
    if (!isAuthenticated || !channelId){
    setMessages([]);
    return;
    }
    setLoading(true);
    setActiveChannelId(channelId);
    try {
      const data = await fetchMessages(channelId);
      setMessages(data || []);
    } finally {
      setLoading(false);
    }
  };

  const createMessage = async (content) => {
    if (!activeChannelId || !isAuthenticated) return null; // don't create if no channelid and auth
    try {
      const newMessage = await sendMessage(activeChannelId, content);
      setMessages((prev) => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      console.error("Failed to send message:", error);
      return null;
    }
  };
  
  return (
    <MessagesContext.Provider
      value={{
        messages,
        loading,
        loadMessages,
        createMessage,
        activeChannelId,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => useContext(MessagesContext);
