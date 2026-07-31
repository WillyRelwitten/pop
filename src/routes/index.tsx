import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AddTaskBar } from "@/components/AddTaskBar";
import { AppHeader } from "@/components/AppHeader";
import { BubbleField } from "@/components/BubbleField";
import { ChampionshipOverlay } from "@/components/ChampionshipOverlay";
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
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub = useTasksStore.persist.onFinishHydration(finish);
    if (useTasksStore.persist.hasHydrated()) finish();
    return unsub;
  }, [setHydrated]);

  const dateLabel = useMemo(() => formatDateLabel(new Date()), []);

  const onChampagne = useCallback(() => {
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 5200);
  }, []);

  return (
    <main
      className={`relative h-dvh w-full overflow-hidden bg-bg ${celebrate ? "is-celebrating" : ""}`}
    >
      <AppHeader count={tasks.length} dateLabel={dateLabel} />
      {tasks.length === 0 ? (
        <EmptyState />
      ) : (
        <BubbleField
          tasks={tasks}
          onRemove={removeTask}
          onChampagne={onChampagne}
        />
      )}
      <AddTaskBar onAdd={addTask} />
      <ChampionshipOverlay active={celebrate} />
    </main>
  );
}
