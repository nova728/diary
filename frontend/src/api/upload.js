import client from "./client";

export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return client.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },
  deleteImage: (filename) => client.delete(`/upload/image/${filename}`).then((r) => r.data),
};
