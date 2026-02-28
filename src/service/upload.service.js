import api from "./api";

export const getPresignedUploadUrls = async (files) => {
  const body = files.map((file) => ({
    fileName: file.name,
    contentType: file.type || "application/octet-stream",
    fileSize: file.size,
  }));

  const res = await api.post("/storage/upload-urls", body);

  return res;
};
