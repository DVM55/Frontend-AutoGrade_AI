import api from "./api";

export const getCategory = (params) => {
  return api.get("/category-question", {
    params: {
      name: params?.name,
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    },
  });
};

// ================= UPDATE =================
export const updateCategory = (id, data) => {
  return api.put(`/category-question/${id}`, data);
};

// ================= DELETE =================
export const deleteCategory = (id) => {
  return api.delete(`/category-question/${id}`);
};

// ================= CREATE =================
export const createCategory = (data) => {
  return api.post("/category-question", data);
};
