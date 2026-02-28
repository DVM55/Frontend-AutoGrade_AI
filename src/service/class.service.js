import api from "./api";

export const getClasses = (params) => {
  return api.get("/class", {
    params: {
      title: params?.title,
      classCode: params?.classCode,
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    },
  });
};

// ================= CREATE =================
export const createClass = (data) => {
  return api.post("/class", data);
};

// ================= UPDATE =================
export const updateClass = (id, data) => {
  return api.put(`/class/${id}`, data);
};

// ================= DELETE =================
export const deleteClass = (id) => {
  return api.delete(`/class/${id}`);
};

// ================= GET BY ID =================
export const getClassById = (id) => {
  return api.get(`/class/${id}`);
};

// ================= GET BY CLASS CODE =================
export const getClassByCode = (classCode) => {
  return api.get(`/class/code/${classCode}`);
};
