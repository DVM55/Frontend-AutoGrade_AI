import api from "./api";

export const getChatConversations = () => {
  return api.get("/chatbot/conversations");
};

export const createChatConversation = (data) => {
  return api.post("/chatbot/conversations", data);
};

export const deleteChatConversation = (conversationId) => {
  return api.delete(`/chatbot/conversations/${conversationId}`);
};

export const getChatMessages = (conversationId) => {
  return api.get(`/chatbot/conversations/${conversationId}/messages`);
};

export const sendChatMessage = ({ conversationId, message }) => {
  return api.post("/chatbot/chat", { conversationId, message });
};
