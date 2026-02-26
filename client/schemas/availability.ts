import { z } from "zod";

export const availabilitySchema = z
  .object({
    date: z.string().min(1, "Vui lòng chọn ngày"),
    from: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),
    to: z.string().min(1, "Vui lòng chọn giờ kết thúc"),
  })
  .refine(
    (data) => {
      const start = new Date(`${data.date}T${data.from}`);
      const end = new Date(`${data.date}T${data.to}`);
      return start < end;
    },
    {
      message: "Giờ kết thúc phải lớn hơn giờ bắt đầu",
      path: ["to"],
    },
  );

export type AvailabilityFromInput = z.infer<typeof availabilitySchema>;
