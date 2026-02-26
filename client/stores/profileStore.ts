import type { User } from "@/types/user";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserStoreState = {
  user: User | null;
};

type UserStoreActions = {
  setUser: (user: User) => void;
  clearUser: () => void;
};

const useUserStore = create<UserStoreState & UserStoreActions>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      setUser: (user) => {
        set({ user: user });
      },
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useUserStore;
