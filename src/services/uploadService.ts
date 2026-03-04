import axiosClient from "@/lib/axiosClient";

export const uploadService = {
  // Upload 1 file, trả về URL location
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosClient.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.location;
  },
};
