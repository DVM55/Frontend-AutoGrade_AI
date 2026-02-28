import api from "./api";

// ================= GET APPROVED MEMBERS =================
export const getClassMembers = (classId, params) => {
  return api.get(`/class/member/${classId}/approved`, {
    params: {
      username: params?.username || "",
      email: params?.email || "",
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    },
  });
};

// ================= DELETE =================
export const deleteClassMember = (id) => {
  return api.delete(`/class/member/${id}`);
};

export const getClassMemberPendings = (classId, params) => {
  return api.get(`/class/member/${classId}/pending`, {
    params: {
      username: params?.username || "",
      email: params?.email || "",
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    },
  });
};

export const approveClassMember = (id) => {
  return api.put(`/class/member/${id}/approve`);
};

// ================= JOIN CLASS =================
export const joinClass = (classCode) => {
  return api.post("/class/member/join", {
    classCode,
  });
};
