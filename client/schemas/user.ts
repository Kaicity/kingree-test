import { z } from "zod";

export const userProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(50, "Họ tên không được vượt quá 50 ký tự"),
  age: z.number(),
  gender: z.string(),
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  bio: z.string().optional(),
});

export type UserProfileFormInput = z.infer<typeof userProfileSchema>;
