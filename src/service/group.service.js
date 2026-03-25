import api from "./api";

export const getGroup = (params) => {
  return api.get("/group-question", {
    params: {
      name: params?.name,
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    },
  });
};

// ================= CREATE =================
export const createGroup = (data) => {
  return api.post("/group-question", data);
};

// ================= UPDATE =================
export const updateGroup = (id, data) => {
  return api.put(`/group-question/${id}`, data);
};

// ================= DELETE =================
export const deleteGroup = (id) => {
  return api.delete(`/group-question/${id}`);
};
