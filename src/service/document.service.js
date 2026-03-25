import api from "./api";

// ================= GET DOCUMENTS BY CLASS =================
export const getDocumentsByClass = (classId, params) => {
  return api.get(`/document/class/${classId}`, {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    },
  });
};

// ================= CREATE DOCUMENT =================
export const createDocument = (classId, data) => {
  return api.post(`/document/class/${classId}`, data);
};

// ================= UPDATE DOCUMENT =================
export const updateDocument = (documentId, data) => {
  return api.put(`/document/${documentId}`, data);
};

// ================= DELETE DOCUMENT =================
export const deleteDocument = (documentId) => {
  return api.delete(`/document/${documentId}`);
};
