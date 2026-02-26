import { z } from "zod";

export const loginRequestSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
});

export type loginRequestFromInput = z.infer<typeof loginRequestSchema>;
