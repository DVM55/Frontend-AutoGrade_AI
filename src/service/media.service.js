import api from "./api";

export const getMedias = (params) => {
  return api.get("/medias", {
    params: {
      fileName: params?.fileName,
      mediaType: params?.mediaType,
      page: params?.page ?? 0,
      size: params?.size ?? 12,
    },
  });
};

// UPDATE
export const updateMedia = (mediaId, data) => {
  return api.put(`/medias/${mediaId}`, data);
};

// DELETE 1
export const deleteMedia = (mediaId) => {
  return api.delete(`/medias/${mediaId}`);
};

// DELETE ALL (của user)
export const deleteAllMedia = (mediaType) => {
  return api.delete(`/medias/type/${mediaType}`); // ✅ truyền mediaType qua URL path
};

// DELETE BATCH (multi select)
export const deleteMediasByIds = (mediaIds) => {
  return api.delete("/medias/batch", {
    data: mediaIds, // ⚠️ axios phải dùng data cho body DELETE
  });
};

export const createMedia = (data) => {
  return api.post("/medias", data);
};
