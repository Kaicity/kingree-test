"use client";

import { login } from "@/apis/auth";
import {
  loginRequestSchema,
  type loginRequestFromInput,
} from "@/schemas/login-request";
import useUserStore from "@/stores/profileStore";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { addToast } from "@heroui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUserStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<loginRequestFromInput>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {},
  });

  const onSubmit = async (data: loginRequestFromInput) => {
    try {
      const result = await login(data);
      if (result) setUser(result?.data);

      if (result?.data) {
        setUser(result.data);
        router.push("/");
      }
    } catch (err: any) {
      addToast({
        title: "Đã có lỗi xảy ra",
        description: err.message || "Hệ thống xảy ra lỗi không xác định",
        color: "danger",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardBody className="flex flex-col gap-6 p-8">
          <h1 className="text-2xl text-pink-500 font-bold text-center">
            Đăng nhập
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              type="email"
              label="Email"
              placeholder="Nhập email của bạn"
              variant="bordered"
              radius="lg"
              isRequired
              {...register("email")}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
            />

            <Button
              isLoading={isSubmitting}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              radius="full"
              type="submit"
            >
              Đăng nhập
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
