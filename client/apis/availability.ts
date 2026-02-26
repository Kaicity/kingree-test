import type { CreateAvailability } from "@/types/create-availability";
import { instance } from "./axios";

export const createAvailabiliy = async (
  ca: CreateAvailability,
): Promise<any> => {
  try {
    const response = await instance.post("/availabilities", ca);
    return response;
  } catch (error: any) {
    throw error.response?.data;
  }
};

export const matchAvailability = async (
  userCurrentId: string,
  userTargetId: string,
): Promise<any> => {
  try {
    const response = await instance.get(
      `/availabilities/match/${userCurrentId}/${userTargetId}`,
    );
    return response;
  } catch (error: any) {
    throw error.response?.data;
  }
};
