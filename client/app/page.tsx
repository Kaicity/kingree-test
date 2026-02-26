"use client";

import { getAllUser, getUser, likeUser } from "@/apis/user.api";
import MatchBadge from "@/components/matchBadget";
import { title } from "@/components/primitives";
import { GenderLabel, type UserGender } from "@/enums/user-gender";
import useUserStore from "@/stores/profileStore";
import type { User } from "@/types/user";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "tailwind-variants";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL);

export default function Home() {
  const { user } = useUserStore();
  const router = useRouter();
  const [profiles, setProfiles] = useState<User[]>([]);
  const [userDetail, setUserDetail] = useState<User>();

  useEffect(() => {
    socket.on("profile:created", () => {
      fetchUsers();
    });

    return () => {
      socket.off("profile:created");
    };
  }, []);

  useEffect(() => {
    socket.on("profile:match", () => {
      fetchUsers();
      fetchUserDetail();
    });

    return () => {
      socket.off("profile:match");
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUsers();
      fetchUserDetail();
    }
  }, [user?.id]);

  const fetchUserDetail = async () => {
    try {
      if (!user?.id) return;
      const result = await getUser(user.id);
      setUserDetail(result.data);
    } catch (err: any) {
      addToast({
        title: "Đã có lỗi xảy ra",
        description: err.err.message || "Hệ thống xảy ra lỗi không xác định",
        color: "danger",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const result = await getAllUser();
      if (result) {
        setProfiles(result?.data);
      }
    } catch (err: any) {
      addToast({
        title: "Đã có lỗi xảy ra",
        description: err.err.message || "Hệ thống xảy ra lỗi không xác định",
        color: "danger",
      });
    }
  };

  const handleLike = async (targetUserId: string) => {
    if (!user?.id) return;

    try {
      const result = await likeUser(user.id, targetUserId);

      if (result.match) {
        addToast({
          title: "🎉 It's a Match!",
          description: "Hai bạn đã thích nhau 💕",
          color: "success",
        });
      }

      await fetchUsers();
      await fetchUserDetail();
    } catch (err: any) {
      addToast({
        title: "Đã có lỗi xảy ra",
        description: err.message || "Hệ thống xảy ra lỗi không xác định",
        color: "danger",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center mb-3">
          <span className={title()}>Kingree&nbsp;</span>
          <span className={title({ color: "violet" })}>"xã giao"&nbsp;</span>
          <br />
          <span className={title()}>và gặp ngay người phù hợp.</span>
        </div>

        {!user && (
          <div className="flex justify-end">
            <Button
              onPress={() => router.push("/create-profile")}
              className="bg-linear-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
              radius="full"
            >
              Tạo profile ngay
            </Button>
          </div>
        )}

        <Divider className="my-6" />

        <div className="flex flex-col justify-center items-center">
          <h1 className={title({ size: "sm", color: "violet" })}>
            Những người bạn có thể quen
          </h1>

          {profiles.length > 0 && user ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {profiles
                .filter((u: User) => u.id !== userDetail?.id)
                .map((u: User) => {
                  const liked = userDetail?.likes?.includes(u.id);
                  return (
                    <Card
                      key={u.id}
                      className="w-64 rounded-2xl shadow-md hover:shadow-xl transition"
                    >
                      <CardBody className="flex flex-col items-center gap-3 p-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-3xl text-white shadow-md">
                          <img
                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${u.name}`}
                            alt={u.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>

                        {/* Name */}
                        <h2 className="text-lg font-semibold text-center">
                          {u.name}
                        </h2>

                        <p className="text-sm text-gray-500 capitalize">
                          {GenderLabel[u.gender as UserGender]}
                        </p>

                        <p className="text-xs text-gray-400 text-center w-full line-clamp-2">
                          {u.bio}
                        </p>
                      </CardBody>

                      <CardFooter className="flex justify-center pb-5">
                        {userDetail?.matches?.includes(u.id) ? (
                          <div className="flex items-center gap-3">
                            <MatchBadge />
                            <Button
                              radius="full"
                              variant="flat"
                              color="secondary"
                              onPress={() =>
                                router.push(`/availability/${u.id}`)
                              }
                            >
                              Lịch hẹn
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className={cn(
                              "rounded-full px-6",
                              liked
                                ? "cursor-not-allowed opacity-70"
                                : "cursor-pointer",
                            )}
                            hidden={u.id === user?.id}
                            onPress={() => handleLike(u.id)}
                            disabled={liked}
                            color="secondary"
                          >
                            {liked ? "💘 Liked" : "💗 Like"}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
            </div>
          ) : (
            <p className="text-center mt-10">
              Tạo profile của bạn trước khi tìm những người khác !
            </p>
          )}
        </div>
      </div>
    </>
  );
}
