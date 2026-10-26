export const pct = (x) => Math.round(x * 100) + "%";

export const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function bits(mask) {
  let n = 0;
  while (mask) {
    n += mask & 1;
    mask >>>= 1;
  }
  return n;
}

export const maskOf = (indices) => indices.reduce((m, j) => m | (1 << j), 0);

export function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const randomItem = (list) => list[Math.floor(Math.random() * list.length)];

export function mmss(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}
