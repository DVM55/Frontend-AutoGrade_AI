import api from "./api";

export const getHistory = () => {
  return api.get("/chatbot/conversations/messages");
};

export const sendMessage = (message) => {
  return api.post("/chatbot/chat", { message });
};
