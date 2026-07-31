/** Exact-match easter eggs. Keep triggers weird so real tasks never fire them. */

export function normalizeEggText(text: string) {
  return text.trim().toLowerCase();
}

export function isChampagneEgg(text: string) {
  return normalizeEggText(text) === "champagne";
}
