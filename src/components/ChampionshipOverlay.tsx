type Props = {
  active: boolean;
};

export function ChampionshipOverlay({ active }: Props) {
  if (!active) return null;
  return (
    <div className="championship-layer" aria-live="polite">
      <div className="championship-overlay">
        <p className="championship-kicker">You popped</p>
        <p className="championship-title">Champagne</p>
        <p className="championship-sub">Championship mode</p>
      </div>
    </div>
  );
}
