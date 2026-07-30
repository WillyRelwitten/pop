/* Pop — static HTML twin of the full React/TanStack app.
   Same product: floating daily tasks, confirm-to-pop, localStorage carry-over.
   Full stack version lives on repo main (Vercel). This folder is GitHub Pages. */

(() => {
  const STORAGE_KEY = "pop-today-tasks";

  /** @typedef {{ id: string, text: string, createdAt: number }} Task */
  /** @typedef {{ id: string, text: string, x: number, y: number, vx: number, vy: number, r: number, popping: boolean, el: HTMLButtonElement | null }} Body */

  /** @type {Task[]} */
  let tasks = loadTasks();
  /** @type {Map<string, Body>} */
  const bodies = new Map();
  /** @type {Task | null} */
  let pending = null;

  const field = document.getElementById("field");
  const emptyEl = document.getElementById("empty");
  const countChip = document.getElementById("count-chip");
  const dateLabel = document.getElementById("date-label");
  const addDock = document.getElementById("add-dock");
  const addOpen = document.getElementById("add-open");
  const addForm = document.getElementById("add-form");
  const addInput = document.getElementById("add-input");
  const addCancel = document.getElementById("add-cancel");
  const addSubmit = document.getElementById("add-submit");
  const confirmEl = document.getElementById("confirm");
  const confirmText = document.getElementById("confirm-text");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmCancel = document.getElementById("confirm-cancel");

  let size = { w: field.clientWidth || 390, h: field.clientHeight || 700 };
  let lastTs = 0;
  let audioCtx = null;

  dateLabel.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      // Support plain array OR zustand persist shape from the full React app
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.state?.tasks)) return parsed.state.tasks;
      if (parsed && Array.isArray(parsed.tasks)) return parsed.tasks;
      return [];
    } catch {
      return [];
    }
  }

  function persist() {
    // Zustand-compatible shape so the full React app can rehydrate the same key
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { tasks }, version: 0 }),
    );
  }

  function bubbleRadius(text, fieldW) {
    const len = text.length;
    const base = 52 + Math.min(len, 48) * 1.15;
    const max = Math.min(fieldW * 0.42, 118);
    return Math.max(48, Math.min(base, max));
  }

  function randomIn(min, max) {
    return min + Math.random() * (max - min);
  }

  function getAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    return audioCtx;
  }

  function unlockAudio() {
    const c = getAudio();
    if (c && c.state === "suspended") void c.resume();
  }

  function playPopSound() {
    const c = getAudio();
    if (!c) return;
    if (c.state === "suspended") void c.resume();
    const t0 = c.currentTime;
    const master = c.createGain();
    master.gain.value = 0.55;
    master.connect(c.destination);

    const thump = c.createOscillator();
    const thumpGain = c.createGain();
    thump.type = "sine";
    thump.frequency.setValueAtTime(140, t0);
    thump.frequency.exponentialRampToValueAtTime(48, t0 + 0.12);
    thumpGain.gain.setValueAtTime(0.45, t0);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.14);
    thump.connect(thumpGain);
    thumpGain.connect(master);
    thump.start(t0);
    thump.stop(t0 + 0.15);

    const pop = c.createOscillator();
    const popGain = c.createGain();
    pop.type = "triangle";
    pop.frequency.setValueAtTime(620 + Math.random() * 80, t0);
    pop.frequency.exponentialRampToValueAtTime(180, t0 + 0.08);
    popGain.gain.setValueAtTime(0.35, t0);
    popGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09);
    pop.connect(popGain);
    popGain.connect(master);
    pop.start(t0);
    pop.stop(t0 + 0.1);

    const noiseBuf = c.createBuffer(1, c.sampleRate * 0.08, c.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.015));
    }
    const noise = c.createBufferSource();
    noise.buffer = noiseBuf;
    const noiseFilter = c.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 1800;
    const noiseGain = c.createGain();
    noiseGain.gain.setValueAtTime(0.28, t0);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.07);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(t0);
    noise.stop(t0 + 0.08);
  }

  function spawnParticles(x, y) {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + randomIn(-0.2, 0.2);
      const dist = randomIn(40, 88);
      const el = document.createElement("span");
      el.className = "pop-particle";
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      el.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      el.style.width = `${5 + (i % 3)}px`;
      el.style.height = `${5 + (i % 3)}px`;
      field.appendChild(el);
      setTimeout(() => el.remove(), 500);
    }
  }

  function updateChrome() {
    const n = tasks.length;
    countChip.textContent =
      n === 0 ? "Clear" : n === 1 ? "1 left" : `${n} left`;
    emptyEl.hidden = n !== 0;
  }

  function ensureBodies() {
    const ids = new Set(tasks.map((t) => t.id));
    for (const id of [...bodies.keys()]) {
      if (!ids.has(id) && !bodies.get(id)?.popping) {
        bodies.get(id)?.el?.remove();
        bodies.delete(id);
      }
    }
    for (const task of tasks) {
      if (bodies.has(task.id)) {
        const b = bodies.get(task.id);
        b.text = task.text;
        b.r = bubbleRadius(task.text, size.w);
        if (b.el) {
          b.el.querySelector("span").textContent = task.text;
          b.el.style.width = `${b.r * 2}px`;
          b.el.style.height = `${b.r * 2}px`;
          const fs =
            b.r < 58 ? "0.72rem" : b.r > 90 ? "0.9rem" : "0.8125rem";
          b.el.querySelector("span").style.fontSize = fs;
        }
        continue;
      }
      const r = bubbleRadius(task.text, size.w);
      /** @type {Body} */
      const body = {
        id: task.id,
        text: task.text,
        x: randomIn(r + 8, Math.max(r + 9, size.w - r - 8)),
        y: randomIn(r + 72, Math.max(r + 73, size.h - r - 100)),
        vx: randomIn(-18, 18),
        vy: randomIn(-14, 14),
        r,
        popping: false,
        el: null,
      };
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bubble";
      btn.setAttribute("aria-label", `Task: ${task.text}. Tap to complete.`);
      const span = document.createElement("span");
      span.textContent = task.text;
      span.style.fontSize =
        r < 58 ? "0.72rem" : r > 90 ? "0.9rem" : "0.8125rem";
      btn.appendChild(span);
      btn.style.left = `${body.x}px`;
      btn.style.top = `${body.y}px`;
      btn.style.width = `${r * 2}px`;
      btn.style.height = `${r * 2}px`;
      btn.addEventListener("click", () => {
        if (body.popping) return;
        unlockAudio();
        openConfirm(task);
      });
      body.el = btn;
      field.appendChild(btn);
      bodies.set(task.id, body);
    }
  }

  function openConfirm(task) {
    pending = task;
    confirmText.textContent = task.text;
    confirmEl.hidden = false;
    confirmYes.focus();
  }

  function closeConfirm() {
    pending = null;
    confirmEl.hidden = true;
  }

  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    tasks = [
      ...tasks,
      { id: uid(), text: trimmed, createdAt: Date.now() },
    ];
    persist();
    ensureBodies();
    updateChrome();
  }

  function removeTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    persist();
    updateChrome();
  }

  function confirmPop() {
    if (!pending) return;
    const task = pending;
    const body = bodies.get(task.id);
    closeConfirm();
    unlockAudio();
    playPopSound();
    if (body) {
      body.popping = true;
      body.el?.classList.add("is-popping");
      spawnParticles(body.x, body.y);
      setTimeout(() => {
        body.el?.remove();
        bodies.delete(task.id);
        removeTask(task.id);
      }, 380);
    } else {
      removeTask(task.id);
    }
  }

  function physics(ts) {
    const dt = Math.min(0.032, (ts - (lastTs || ts)) / 1000);
    lastTs = ts;
    const { w, h } = size;
    const list = [...bodies.values()].filter((b) => !b.popping);
    const topPad = 64;
    const bottomPad = 108;

    for (const b of list) {
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

    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
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
          const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
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

    for (const b of list) {
      if (!b.el) continue;
      b.el.style.left = `${b.x}px`;
      b.el.style.top = `${b.y}px`;
    }

    requestAnimationFrame(physics);
  }

  addOpen.addEventListener("click", () => {
    unlockAudio();
    addDock.hidden = true;
    addForm.hidden = false;
    addInput.focus();
  });

  function closeAdd() {
    addForm.hidden = true;
    addDock.hidden = false;
    addInput.value = "";
    addSubmit.disabled = true;
  }

  addCancel.addEventListener("click", closeAdd);
  addInput.addEventListener("input", () => {
    addSubmit.disabled = !addInput.value.trim();
  });
  addInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAdd();
  });
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    unlockAudio();
    addTask(addInput.value);
    closeAdd();
  });

  confirmCancel.addEventListener("click", closeConfirm);
  confirmYes.addEventListener("click", confirmPop);
  confirmEl.addEventListener("click", (e) => {
    if (e.target === confirmEl) closeConfirm();
  });
  window.addEventListener("keydown", (e) => {
    if (confirmEl.hidden) return;
    if (e.key === "Escape") closeConfirm();
    if (e.key === "Enter") confirmPop();
  });

  const ro = new ResizeObserver(() => {
    size = { w: field.clientWidth, h: field.clientHeight };
  });
  ro.observe(field);

  size = { w: field.clientWidth || 390, h: field.clientHeight || 700 };
  ensureBodies();
  updateChrome();
  requestAnimationFrame(physics);
})();
