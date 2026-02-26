import type { UserProfile } from "@/types/create-profile";
import { instance } from "./axios";

export const createUserProfile = async (user: UserProfile): Promise<any> => {
  try {
    const response = await instance.post("/users", user);
    return response;
  } catch (error: any) {
    throw error.response?.data;
  }
};

export const getAllUser = async (): Promise<any> => {
  try {
    const response = await instance.get("/users");
    return response;
  } catch (error: any) {
    throw error.response?.data;
  }
};

export const getUser = async (id: string): Promise<any> => {
  try {
    const response = await instance.get(`/users/${id}`);
    return response;
  } catch (error: any) {
    throw error.response?.data;
  }
};

export const likeUser = async (id: string, targetId: string): Promise<any> => {
  try {
    const response = await instance.post(`/users/${id}/like/${targetId}`);
    return response;
  } catch (error: any) {
    throw error.response?.data;
  }
};
