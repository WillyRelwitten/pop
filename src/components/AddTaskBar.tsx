import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { unlockAudio } from "@/lib/pop-sound";

type Props = {
  onAdd: (text: string) => void;
};

export function AddTaskBar({ onAdd }: Props) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const t = value.trim();
    if (!t) return;
    unlockAudio();
    onAdd(t);
    setValue("");
    setOpen(false);
  };

  if (!open) {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => {
            unlockAudio();
            setOpen(true);
          }}
          className="pointer-events-auto flex h-14 min-w-[14rem] items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-fg shadow-[0_12px_32px_color-mix(in_oklab,black_40%,transparent)] transition-transform duration-150 ease-out active:scale-[0.96]"
          aria-label="Add a task"
        >
          <Plus className="size-5" strokeWidth={2.25} />
          Add something
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <form
        onSubmit={submit}
        className="pointer-events-auto mx-auto flex max-w-md items-center gap-2 rounded-[1.25rem] border border-border bg-bg-elevated p-2 shadow-[0_16px_40px_color-mix(in_oklab,black_45%,transparent)]"
      >
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setValue("");
            }
          }}
          placeholder="What needs to get done?"
          maxLength={120}
          className="h-12 min-w-0 flex-1 rounded-[calc(1.25rem-0.5rem)] bg-transparent px-3 text-base text-fg outline-none placeholder:text-subtle"
          enterKeyHint="done"
          autoComplete="off"
          autoCorrect="on"
        />
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setValue("");
          }}
          className="h-12 shrink-0 rounded-[calc(1.25rem-0.5rem)] px-3 text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          Close
        </button>
        <button
          type="submit"
          disabled={!value.trim()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg transition-transform duration-150 ease-out enabled:active:scale-[0.96] disabled:opacity-40"
          aria-label="Add task"
        >
          <Plus className="size-5" strokeWidth={2.25} />
        </button>
      </form>
    </div>
  );
}
