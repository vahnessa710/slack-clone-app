// src/services/channelService.js
import axios from "axios";
import { API_URL } from "../constants/Constants";

export const channelService = {
  async getChannels(headers) {
    if (!headers || !headers["access-token"]) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await axios.get(`${API_URL}/channels`, {
        headers: {
          ...headers,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching channels:", error);
      throw error;
    }
  },

  async createChannel(channelData, headers) {
    if (!headers || !headers["access-token"]) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await axios.post(`${API_URL}/channels`, channelData, {
        headers: {
          ...headers,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating channel:", error);
      throw error;
    }
  },

};
