import axios from "axios";
import { API_URL } from "../constants/Constants";

export const messageService = {
  async getMessages(channelId, headers) {
    const response = await axios.get(
      `${API_URL}/channels/${channelId}/messages`,
      { headers }
    );
    return response.data;
  },

  async createMessage(channelId, content, headers) {
    const response = await axios.post(
      `${API_URL}/channels/${channelId}/messages`,
      {
        message: { content },
      },
      { headers }
    );
    return response.data;
  },
};
