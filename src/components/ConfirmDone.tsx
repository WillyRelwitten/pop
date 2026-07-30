import { useEffect, useRef } from "react";

type Props = {
  taskText: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDone({ taskText, onConfirm, onCancel }: Props) {
  const yesRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    yesRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, onConfirm]);

  return (
    <div
      className="confirm-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onCancel}
    >
      <div
        className="confirm-card"
        onClick={(e) => e.stopPropagation()}
      >
        <p
          id="confirm-title"
          className="text-[0.7rem] font-medium tracking-[0.14em] uppercase text-muted"
        >
          Mark done
        </p>
        <p className="mt-2 font-display text-xl leading-snug tracking-tight text-fg">
          {taskText}
        </p>
        <p className="mt-2 text-sm leading-normal text-muted">
          Pop it and it's gone for good.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-12 rounded-[calc(var(--radius-xl)-0.5rem)] border border-border bg-transparent text-sm font-medium text-fg transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            Cancel
          </button>
          <button
            ref={yesRef}
            type="button"
            onClick={onConfirm}
            className="h-12 rounded-[calc(var(--radius-xl)-0.5rem)] bg-accent text-sm font-semibold text-accent-fg transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            Pop it
          </button>
        </div>
      </div>
    </div>
  );
}
