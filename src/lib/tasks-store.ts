import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "./utils";

export type Task = {
  id: string;
  text: string;
  createdAt: number;
};

type TasksState = {
  tasks: Task[];
  hydrated: boolean;
  addTask: (text: string) => void;
  removeTask: (id: string) => void;
  setHydrated: (value: boolean) => void;
};

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      tasks: [],
      hydrated: false,
      addTask: (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((s) => ({
          tasks: [
            ...s.tasks,
            { id: uid(), text: trimmed, createdAt: Date.now() },
          ],
        }));
      },
      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "pop-today-tasks",
      partialize: (s) => ({ tasks: s.tasks }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
