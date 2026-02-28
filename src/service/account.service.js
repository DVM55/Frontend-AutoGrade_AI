import api from "./api";

export const getProfile = () => {
  return api.get("/account/profile");
};

export const changePassword = (data) => {
  return api.put("/account/change-password", data);
};

export const updateAccount = (data) => {
  return api.put("/account/update", data);
};

export const updateAvatar = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.put("/account/update-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getUsers = (params) => {
  return api.get("/account/users", {
    params: {
      username: params?.username || "",
      email: params?.email || "",
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    },
  });
};

export const getTeachers = (params) => {
  return api.get("/account/teachers", {
    params: {
      username: params?.username || "",
      email: params?.email || "",
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    },
  });
};

export const deleteAccount = (id) => {
  return api.delete(`/account/${id}`);
};

export const toggleLockAccount = (id) => {
  return api.put(`/account/${id}/lock`);
};
