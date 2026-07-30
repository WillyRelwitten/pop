export function EmptyState() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-8 text-center">
      <div
        aria-hidden
        className="mb-5 size-16 rounded-full border border-border bg-surface shadow-[inset_0_1px_0_color-mix(in_oklab,white_10%,transparent)]"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, color-mix(in oklab, white 12%, transparent), transparent 55%), var(--color-surface)",
        }}
      />
      <h2 className="font-display text-2xl font-medium tracking-tight text-fg">
        Nothing floating
      </h2>
      <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-muted">
        Add the shit you need to get done today. Unfinished ones stick around
        until you pop them.
      </p>
    </div>
  );
}
