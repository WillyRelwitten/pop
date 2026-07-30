type Props = {
  count: number;
  dateLabel: string;
};

export function AppHeader({ count, dateLabel }: Props) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-4 pt-[max(0.85rem,env(safe-area-inset-top))]">
      <div className="min-w-0">
        <p className="font-display text-[1.65rem] font-medium leading-none tracking-[-0.03em] text-fg">
          Pop
        </p>
        <p className="mt-1.5 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-muted">
          {dateLabel}
        </p>
      </div>
      <div
        className="pointer-events-auto rounded-full border border-border bg-bg-elevated/90 px-3 py-1.5 backdrop-blur-sm"
        aria-live="polite"
      >
        <span className="text-xs font-medium tabular-nums text-muted">
          {count === 0 ? "Clear" : count === 1 ? "1 left" : `${count} left`}
        </span>
      </div>
    </header>
  );
}
