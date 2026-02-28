import api from "./api";

// ================= GET DOCUMENT DETAILS BY DOCUMENT =================
export const getDocumentDetails = (documentId, params) => {
  return api.get(`/document-detail/document/${documentId}`, {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    },
  });
};

// ================= CREATE DOCUMENT DETAILS (MULTIPLE FILES) =================
export const createDocumentDetails = (documentId, data) => {
  // data là List<DocumentDetailRequest>
  return api.post(`/document-detail/${documentId}`, data);
};

// ================= UPDATE DOCUMENT DETAIL =================
export const updateDocumentDetail = (documentDetailId, data) => {
  return api.put(`/document-detail/${documentDetailId}`, data);
};

// ================= DELETE DOCUMENT DETAIL =================
export const deleteDocumentDetail = (documentDetailId) => {
  return api.delete(`/document-detail/${documentDetailId}`);
};
