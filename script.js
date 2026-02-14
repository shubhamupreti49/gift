const els = {
  toName: document.getElementById("toName"),
  fromName: document.getElementById("fromName"),
  headline: document.getElementById("headline"),
  subhead: document.getElementById("subhead"),
  letterText: document.getElementById("letterText"),
  reasons: document.getElementById("reasons"),
  daysPill: document.getElementById("daysPill"),
  todayPill: document.getElementById("todayPill"),
  scrollBtn: document.getElementById("scrollBtn"),
  editBtn: document.getElementById("editBtn"),
  editDialog: document.getElementById("editDialog"),
  toInput: document.getElementById("toInput"),
  fromInput: document.getElementById("fromInput"),
  sinceInput: document.getElementById("sinceInput"),
  letterInput: document.getElementById("letterInput"),
  reasonsInput: document.getElementById("reasonsInput"),
  saveBtn: document.getElementById("saveBtn"),
  jarInput: document.getElementById("jarInput"),
  addJarBtn: document.getElementById("addJarBtn"),
  clearJarBtn: document.getElementById("clearJarBtn"),
  jarList: document.getElementById("jarList"),
  yesBtn: document.getElementById("yesBtn"),
  noBtn: document.getElementById("noBtn"),
  answerBox: document.getElementById("answerBox"),
  confetti: document.getElementById("confetti"),
};

const STORAGE_KEY = "valentine_site_v1";

const defaultState = {
  to: "My Ruchi",
  from: "Your Shubham",
  since: "", // "2024-05-10"
  letter:
    "Hey love — I’m grateful for you. Thank you for being you, for the laughs, the support, and the way you make ordinary days feel like something to look forward to.",
  reasons: [
    "Your smile changes my whole world.",
    "The way you care about me makes forget everything.",
    "How you make “small moments” feel huge.",
  ],
  jar: [],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...parsed };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

function formatDate(d) {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function daysBetween(dateStr) {
  if (!dateStr) return null;
  const start = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(start.getTime())) return null;
  const now = new Date();
  const ms = now.setHours(0,0,0,0) - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function render() {
  els.toName.textContent = state.to || defaultState.to;
  els.fromName.textContent = "— " + (state.from || defaultState.from);
  els.letterText.textContent = state.letter || defaultState.letter;

  // pills
  els.todayPill.textContent = `Today: ${formatDate(new Date())}`;
  const d = daysBetween(state.since);
  els.daysPill.textContent = d === null ? "Together: set a date" : `Together: ${d} days`;

  // reasons
  els.reasons.innerHTML = "";
  (state.reasons || defaultState.reasons).slice(0, 6).forEach((r) => {
    const li = document.createElement("li");
    li.textContent = r;
    els.reasons.appendChild(li);
  });

  // jar
  els.jarList.innerHTML = "";
  (state.jar || []).forEach((note, idx) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = note;

    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      state.jar.splice(idx, 1);
      saveState(state);
      render();
    });

    li.appendChild(span);
    li.appendChild(del);
    els.jarList.appendChild(li);
  });
}

function openEditor() {
  els.toInput.value = state.to || "";
  els.fromInput.value = state.from || "";
  els.sinceInput.value = state.since || "";
  els.letterInput.value = state.letter || "";
  els.reasonsInput.value = (state.reasons || []).join("\n");
  els.editDialog.showModal();
}

function saveEditor() {
  state.to = (els.toInput.value || "").trim() || defaultState.to;
  state.from = (els.fromInput.value || "").trim() || defaultState.from;
  state.since = (els.sinceInput.value || "").trim();
  state.letter = (els.letterInput.value || "").trim() || defaultState.letter;

  const reasonsLines = (els.reasonsInput.value || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  state.reasons = reasonsLines.length ? reasonsLines.slice(0, 6) : structuredClone(defaultState.reasons);

  saveState(state);
  render();
}

// Cute “No” button behavior
let noMoves = 0;
function moveNoButton() {
  noMoves += 1;

  const btn = els.noBtn;
  const container = btn.parentElement;
  const rect = container.getBoundingClientRect();

  const maxX = Math.max(0, rect.width - btn.offsetWidth);
  const maxY = Math.max(0, rect.height - btn.offsetHeight);

  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  btn.style.position = "absolute";
  btn.style.left = `${x}px`;
  btn.style.top = `${y}px`;

  if (noMoves >= 5) {
    btn.textContent = "Okay okay…";
  }
}

// Confetti (tiny canvas)
function startConfetti(durationMs = 1800) {
  const canvas = els.confetti;
  const ctx = canvas.getContext("2d");

  const DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  function resize() {
    canvas.width = Math.floor(window.innerWidth * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();

  const colors = ["#ff4d7d", "#ff7aa2", "#45d483", "#ffffff"];
  const pieces = Array.from({ length: 160 }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * 400,
    r: 3 + Math.random() * 4,
    vx: -2 + Math.random() * 4,
    vy: 2 + Math.random() * 5,
    rot: Math.random() * Math.PI,
    vr: -0.2 + Math.random() * 0.4,
    c: colors[Math.floor(Math.random() * colors.length)],
  }));

  const start = performance.now();
  function frame(t) {
    const elapsed = t - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.vy += 0.03; // gravity

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r, -p.r, p.r * 2.2, p.r * 1.6);
      ctx.restore();
    });

    if (elapsed < durationMs) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", resize, { once: true });
  requestAnimationFrame(frame);
}

function wireEvents() {
  els.scrollBtn.addEventListener("click", () => {
    document.getElementById("content").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  els.editBtn.addEventListener("click", openEditor);

  els.saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    saveEditor();
    els.editDialog.close();
  });

  els.addJarBtn.addEventListener("click", () => {
    const note = (els.jarInput.value || "").trim();
    if (!note) return;
    state.jar.unshift(note);
    state.jar = state.jar.slice(0, 20);
    els.jarInput.value = "";
    saveState(state);
    render();
  });

  els.jarInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      els.addJarBtn.click();
    }
  });

  els.clearJarBtn.addEventListener("click", () => {
    state.jar = [];
    saveState(state);
    render();
  });

  els.noBtn.addEventListener("mouseenter", moveNoButton);
  els.noBtn.addEventListener("click", moveNoButton);

  els.yesBtn.addEventListener("click", () => {
    els.answerBox.hidden = false;
    startConfetti();
    els.answerBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

wireEvents();
render();
