import axios from "axios";
import qs from "qs";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const instance = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) =>
    qs.stringify(params, {
      arrayFormat: "repeat",
    }),
});

instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Lỗi kết nối tới server (mất mạng, server down)
    if (!error.response) {
      return Promise.reject(error.message);
    }

    if (error.response.status === 500) {
      console.error("Server error:", error.response.data);
      alert("Có lỗi xảy ra từ phía máy chủ, vui lòng thử lại sau.");
    }
    return Promise.reject(error);
  },
);
