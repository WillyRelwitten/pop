import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { AddTaskBar } from "@/components/AddTaskBar";
import { AppHeader } from "@/components/AppHeader";
import { BubbleField } from "@/components/BubbleField";
import { EmptyState } from "@/components/EmptyState";
import { useTasksStore } from "@/lib/tasks-store";

export const Route = createFileRoute("/")({
  component: Home,
});

function formatDateLabel(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function Home() {
  const tasks = useTasksStore((s) => s.tasks);
  const addTask = useTasksStore((s) => s.addTask);
  const removeTask = useTasksStore((s) => s.removeTask);
  const setHydrated = useTasksStore((s) => s.setHydrated);

  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub = useTasksStore.persist.onFinishHydration(finish);
    if (useTasksStore.persist.hasHydrated()) finish();
    return unsub;
  }, [setHydrated]);

  const dateLabel = useMemo(() => formatDateLabel(new Date()), []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg">
      <AppHeader count={tasks.length} dateLabel={dateLabel} />
      {tasks.length === 0 ? (
        <EmptyState />
      ) : (
        <BubbleField tasks={tasks} onRemove={removeTask} />
      )}
      <AddTaskBar onAdd={addTask} />
    </main>
  );
}
