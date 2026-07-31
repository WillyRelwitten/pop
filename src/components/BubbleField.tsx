import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Task } from "@/lib/tasks-store";
import { isChampagneEgg } from "@/lib/easter-eggs";
import {
  playChampagneCork,
  playClubSting,
  playPopSound,
  unlockAudio,
} from "@/lib/pop-sound";
import { ConfirmDone } from "./ConfirmDone";

type BubbleBody = {
  id: string;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  popping: boolean;
  el: HTMLButtonElement | null;
};

type Particle = {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  hue: number;
  champagne?: boolean;
};

function bubbleRadius(text: string, fieldW: number) {
  const len = text.length;
  const base = 52 + Math.min(len, 48) * 1.15;
  const max = Math.min(fieldW * 0.42, 118);
  return Math.max(48, Math.min(base, max));
}

function randomIn(min: number, max: number) {
  return min + Math.random() * (max - min);
}

type Props = {
  tasks: Task[];
  onRemove: (id: string) => void;
  onChampagne?: () => void;
};

export function BubbleField({ tasks, onRemove, onChampagne }: Props) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const bodiesRef = useRef<Map<string, BubbleBody>>(new Map());
  const [renderIds, setRenderIds] = useState<string[]>([]);
  const [pending, setPending] = useState<Task | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const sizeRef = useRef({ w: 390, h: 700 });
  const rafRef = useRef(0);
  const lastTs = useRef(0);

  useLayoutEffect(() => {
    const map = bodiesRef.current;
    const { w, h } = sizeRef.current;
    const ids = new Set(tasks.map((t) => t.id));
    let changed = false;

    for (const id of [...map.keys()]) {
      if (!ids.has(id) && !map.get(id)?.popping) {
        map.delete(id);
        changed = true;
      }
    }

    for (const task of tasks) {
      if (map.has(task.id)) {
        const b = map.get(task.id)!;
        b.text = task.text;
        b.r = bubbleRadius(task.text, w);
        continue;
      }
      const r = bubbleRadius(task.text, w);
      map.set(task.id, {
        id: task.id,
        text: task.text,
        x: randomIn(r + 8, Math.max(r + 9, w - r - 8)),
        y: randomIn(r + 72, Math.max(r + 73, h - r - 100)),
        vx: randomIn(-18, 18),
        vy: randomIn(-14, 14),
        r,
        popping: false,
        el: null,
      });
      changed = true;
    }

    if (changed) {
      setRenderIds([...map.keys()]);
    }
  }, [tasks]);

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      sizeRef.current = { w: cr.width, h: cr.height };
    });
    ro.observe(el);
    sizeRef.current = { w: el.clientWidth, h: el.clientHeight };
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const step = (ts: number) => {
      const dt = Math.min(0.032, (ts - (lastTs.current || ts)) / 1000);
      lastTs.current = ts;
      const { w, h } = sizeRef.current;
      const bodies = [...bodiesRef.current.values()].filter((b) => !b.popping);
      const topPad = 64;
      const bottomPad = 108;

      for (const b of bodies) {
        b.vx += Math.sin(ts * 0.0007 + b.x * 0.01) * 6 * dt;
        b.vy += Math.cos(ts * 0.0009 + b.y * 0.01) * 5 * dt;
        b.vx += ((w / 2 - b.x) / w) * 4 * dt;
        b.vy += ((h / 2 - b.y) / h) * 3 * dt;
        b.vx *= 1 - 0.35 * dt;
        b.vy *= 1 - 0.35 * dt;

        const sp = Math.hypot(b.vx, b.vy);
        if (sp > 42) {
          b.vx = (b.vx / sp) * 42;
          b.vy = (b.vy / sp) * 42;
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        if (b.x < b.r + 6) {
          b.x = b.r + 6;
          b.vx = Math.abs(b.vx) * 0.7;
        } else if (b.x > w - b.r - 6) {
          b.x = w - b.r - 6;
          b.vx = -Math.abs(b.vx) * 0.7;
        }
        if (b.y < b.r + topPad) {
          b.y = b.r + topPad;
          b.vy = Math.abs(b.vy) * 0.7;
        } else if (b.y > h - b.r - bottomPad) {
          b.y = h - b.r - bottomPad;
          b.vy = -Math.abs(b.vy) * 0.7;
        }
      }

      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i]!;
          const b = bodies[j]!;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const min = a.r + b.r + 6;
          if (dist < min) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (min - dist) * 0.5;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;
            const dvx = b.vx - a.vx;
            const dvy = b.vy - a.vy;
            const vn = dvx * nx + dvy * ny;
            if (vn < 0) {
              const impulse = vn * 0.55;
              a.vx += impulse * nx;
              a.vy += impulse * ny;
              b.vx -= impulse * nx;
              b.vy -= impulse * ny;
            }
          }
        }
      }

      for (const b of bodies) {
        if (!b.el) continue;
        b.el.style.left = `${b.x}px`;
        b.el.style.top = `${b.y}px`;
        b.el.style.width = `${b.r * 2}px`;
        b.el.style.height = `${b.r * 2}px`;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const spawnParticles = useCallback((x: number, y: number, champagne = false) => {
    const count = champagne ? 42 : 14;
    const next: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + randomIn(-0.25, 0.25);
      const dist = champagne ? randomIn(60, 160) : randomIn(40, 88);
      return {
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        x: x + (champagne ? randomIn(-12, 12) : 0),
        y: y + (champagne ? randomIn(-12, 12) : 0),
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - (champagne ? randomIn(20, 70) : 0),
        hue: i,
        champagne,
      };
    });
    setParticles((p) => [...p, ...next]);
    window.setTimeout(
      () => {
        setParticles((p) => p.filter((pt) => !next.some((n) => n.id === pt.id)));
      },
      champagne ? 1100 : 500,
    );
  }, []);

  const confirmPop = useCallback(() => {
    if (!pending) return;
    const body = bodiesRef.current.get(pending.id);
    const champagne = isChampagneEgg(pending.text);
    unlockAudio();

    if (champagne) {
      playChampagneCork();
      playClubSting(5);
      onChampagne?.();
    } else {
      playPopSound();
    }

    if (body) {
      body.popping = true;
      if (body.el) {
        body.el.classList.add("is-popping");
        if (champagne) body.el.classList.add("is-champagne-pop");
      }
      spawnParticles(body.x, body.y, champagne);
      if (champagne) {
        window.setTimeout(() => spawnParticles(body.x, body.y - 20, true), 120);
        window.setTimeout(() => spawnParticles(body.x, body.y + 10, true), 260);
      }
      window.setTimeout(
        () => {
          bodiesRef.current.delete(pending.id);
          setRenderIds((ids) => ids.filter((id) => id !== pending.id));
          onRemove(pending.id);
        },
        champagne ? 520 : 380,
      );
    } else {
      onRemove(pending.id);
    }
    setPending(null);
  }, [onChampagne, onRemove, pending, spawnParticles]);

  const setBubbleEl = useCallback(
    (id: string, el: HTMLButtonElement | null) => {
      const b = bodiesRef.current.get(id);
      if (b) b.el = el;
    },
    [],
  );

  return (
    <div ref={fieldRef} className="absolute inset-0 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in oklab, #2a2a36 55%, transparent), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 90%, color-mix(in oklab, #1e2430 40%, transparent), transparent 60%)",
        }}
      />

      {renderIds.map((id) => {
        const b = bodiesRef.current.get(id);
        if (!b) return null;
        const egg = isChampagneEgg(b.text);
        return (
          <button
            key={id}
            ref={(el) => setBubbleEl(id, el)}
            type="button"
            className={`bubble-shell ${egg ? "bubble-champagne" : ""}`}
            style={{
              left: b.x,
              top: b.y,
              width: b.r * 2,
              height: b.r * 2,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => {
              if (b.popping) return;
              unlockAudio();
              const task = tasks.find((t) => t.id === id);
              if (task) setPending(task);
            }}
            aria-label={`Task: ${b.text}. Tap to complete.`}
          >
            <span
              className="line-clamp-4 max-w-full px-1 font-medium leading-snug tracking-tight"
              style={{
                fontSize:
                  b.r < 58 ? "0.72rem" : b.r > 90 ? "0.9rem" : "0.8125rem",
              }}
            >
              {b.text}
            </span>
          </button>
        );
      })}

      {particles.map((p) => (
        <span
          key={p.id}
          className={`pop-particle ${p.champagne ? "pop-particle-gold" : ""}`}
          style={
            {
              left: p.x,
              top: p.y,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              opacity: 0.95,
              width: p.champagne ? 6 + (p.hue % 5) : 5 + (p.hue % 3),
              height: p.champagne ? 6 + (p.hue % 5) : 5 + (p.hue % 3),
            } as CSSProperties
          }
        />
      ))}

      {pending && (
        <ConfirmDone
          taskText={pending.text}
          onConfirm={confirmPop}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
