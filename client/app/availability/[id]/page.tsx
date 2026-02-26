"use client";

import { createAvailabiliy, matchAvailability } from "@/apis/availability";
import {
  AvailabilityLabel,
  AvailabilityStatus,
} from "@/enums/availability-status";
import {
  availabilitySchema,
  type AvailabilityFromInput,
} from "@/schemas/availability";
import useUserStore from "@/stores/profileStore";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { addToast } from "@heroui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function AvailabilityPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const params = useParams();
  const matchUserId = params.id as string;

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 21);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const [notification, setNotification] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<{
    start: string;
    end: string;
  } | null>(null);

  useEffect(() => {
    !user && router.push("/");
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AvailabilityFromInput>({
    resolver: zodResolver(availabilitySchema),
  });

  const onSubmit = async (data: AvailabilityFromInput) => {
    const startTime = new Date(`${data.date}T${data.from}`);
    const endTime = new Date(`${data.date}T${data.to}`);

    const payload = {
      userId: user?.id as string,
      userTargetId: matchUserId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };

    console.log(payload);

    try {
      const result = await createAvailabiliy(payload);
      if (result?.data) {
        const overlap = await matchAvailability(
          user?.id as string,
          matchUserId,
        );

        if (overlap) {
          setNotification(overlap.status);

          if (overlap.status === AvailabilityStatus.scheduled) {
            setScheduledTime({
              start: overlap.data.start,
              end: overlap.data.end,
            });
          }
        }
      }
    } catch (err: any) {
      addToast({
        title: "Đã có lỗi xảy ra",
        description: err.message || "Hệ thống xảy ra lỗi không xác định",
        color: "danger",
      });
    }
  };

  const renderStatus = () => {
    if (!notification) return null;

    switch (notification) {
      case AvailabilityStatus.waiting:
        return (
          <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-300 text-yellow-700 text-center">
            Bạn đã chọn thời gian.
            <br />
            Đang chờ đối phương chọn.
          </div>
        );

      case AvailabilityStatus.no_overlap:
        return (
          <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-700 text-center">
            Chưa tìm được thời gian trùng.
            <br />
            Vui lòng chọn lại.
          </div>
        );

      case AvailabilityStatus.scheduled:
        return (
          <div className="p-6 rounded-2xl bg-green-50 border border-green-400 text-green-800 text-center shadow-md animate-fadeIn">
            <div className="text-lg font-semibold mb-3">
              🎉 Hai bạn có date hẹn vào:
            </div>

            {scheduledTime && (
              <>
                <div className="text-md font-medium">
                  📅 {new Date(scheduledTime.start).toLocaleDateString("vi-VN")}
                </div>
                <div className="text-md">
                  ⏰{" "}
                  {new Date(scheduledTime.start).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(scheduledTime.end).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-center mt-12">
      <Card className="w-full max-w-md rounded-2xl shadow-xl">
        <CardBody className="flex flex-col gap-6 p-8">
          <h1 className="text-2xl font-bold text-center">
            Chọn thời gian rảnh 💕
          </h1>

          {notification !== AvailabilityStatus.scheduled && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Input
                type="date"
                label="Chọn ngày"
                min={formatDate(today)}
                max={formatDate(maxDate)}
                {...register("date")}
                isInvalid={!!errors.date}
                errorMessage={errors.date?.message}
              />

              <Input
                type="time"
                label="Từ giờ"
                {...register("from")}
                isInvalid={!!errors.from}
                errorMessage={errors.from?.message}
              />

              <Input
                type="time"
                label="Đến giờ"
                {...register("to")}
                isInvalid={!!errors.to}
                errorMessage={errors.to?.message}
              />

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                radius="full"
              >
                Lưu và tìm lịch trống
              </Button>
            </form>
          )}

          {renderStatus()}
        </CardBody>
      </Card>
    </div>
  );
}
