"use client";

import { createUserProfile } from "@/apis/user.api";
import { title } from "@/components/primitives";
import { genders } from "@/constants/gender";
import { userProfileSchema, type UserProfileFormInput } from "@/schemas/user";
import useUserStore from "@/stores/profileStore";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { addToast } from "@heroui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function CreateProfilePage() {
  const { setUser } = useUserStore();

  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserProfileFormInput>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {},
  });

  const onSubmit = async (data: UserProfileFormInput) => {
    try {
      const result = await createUserProfile(data);
      if (result) setUser(result?.data);
      addToast({
        title: "Thông báo",
        description: "Profile của bạn đã được tạo thành công",
        color: "success",
      });
      reset();
      router.push("/");
    } catch (err: any) {
      addToast({
        title: "Đã có lỗi xảy ra",
        description: err.message || "Hệ thống xảy ra lỗi không xác định",
        color: "danger",
      });
    }
  };

  return (
    <div className="w-[500px] mx-auto mt-10">
      <Card>
        <CardBody className="flex flex-col gap-4 space-y-3">
          <h1 className={title({ size: "sm", color: "pink" })}>
            Tạo profile của bạn
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              label="Họ tên"
              isRequired
              {...register("name")}
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
            />

            <Input
              label="Email"
              type="email"
              isRequired
              {...register("email")}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
            />

            <Input
              label="Tuổi"
              type="number"
              isRequired
              {...register("age", { valueAsNumber: true })}
              isInvalid={!!errors.age}
              errorMessage={errors.age?.message}
            />

            <Select
              label="Giới tính"
              onSelectionChange={(keys) =>
                setValue("gender", Array.from(keys)[0] as string)
              }
              isInvalid={!!errors.gender}
              errorMessage={errors.gender?.message}
            >
              {genders.map((g) => (
                <SelectItem key={g.key}>{g.label}</SelectItem>
              ))}
            </Select>

            <Textarea label="Bio" {...register("bio")} />

            <Button isLoading={isSubmitting} color="danger" type="submit">
              Lưu thông tin
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
