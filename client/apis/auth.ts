import type { loginRequest } from "@/types/login-request";
import { instance } from "./axios";

export const login = async (login: loginRequest): Promise<any> => {
  try {
    const response = await instance.post(`/login`, { email: login.email });
    return response;
  } catch (error: any) {
    throw error.response?.data;
  }
};
