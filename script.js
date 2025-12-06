const content = window.CONTENT || {};
const site = content.site || {};
const games = content.games || [];
const featured = content.featured || games.find((g) => g.featured) || games[0];

const FEEDS = {
  posts: {
    items: content.posts || [],
    meta: (item) => item.meta ?? (item.date ? daysAgo(item.date) : ""),
  },
  experience: {
    items: content.experience || [],
    meta: (item) => item.meta ?? "",
  },
};

function daysAgo(dateString) {
  const target = dateString ? new Date(dateString) : null;
  if (!target || Number.isNaN(target.getTime())) return "";
  const now = new Date();
  const ms = now - target;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days} days ago`;
}

function buildList(items, listEl, metaFn) {
  if (!listEl || !items) return;
  listEl.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    const date = document.createElement("div");
    const link = document.createElement("a");
    const meta = document.createElement("div");

    date.className = "date";
    date.textContent = item.date ? `[${item.date}]` : "";

    link.className = "link";
    link.href = item.href || "#";
    link.textContent = item.title || item.text || "Untitled";

    meta.className = "meta";
    meta.textContent = typeof metaFn === "function" ? metaFn(item) : item.meta ?? "";

    const fullContent = normalizeContent(item.content);
    if (fullContent) {
      li.dataset.content = fullContent;
    }

    li.append(date, link, meta);
    listEl.appendChild(li);
  });
}

function normalizeContent(raw) {
  if (!raw) return "";
  const lines = raw.split(/\r?\n/);
  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  const indents = lines
    .filter((l) => l.trim())
    .map((l) => l.match(/^\s*/)[0].length);
  const pad = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(pad)).join("\n");
}

function renderLists() {
  document.querySelectorAll("[data-feed]").forEach((list) => {
    const key = list.dataset.feed;
    const feed = FEEDS[key];
    if (!feed) return;
    buildList(feed.items, list, feed.meta);
  });
}

function renderShell() {
  if (site.title) {
    const titleEl = document.querySelector(".title");
    if (titleEl) titleEl.textContent = site.title;
  }
  if (site.year) {
    const yearEl = document.querySelector(".year");
    if (yearEl) yearEl.textContent = ``;
  }
  if (Array.isArray(site.nav)) {
    const navEl = document.querySelector(".nav");
    if (navEl) {
      navEl.innerHTML = site.nav
        .map((item) => `<a href="${item.href}">${item.label}</a>`)
        .join("");
    }
  }
}

function renderFeatured(game) {
  if (!game) return;
  const titleEl = document.querySelector("[data-slot='feature-title']");
  const dateEl = document.querySelector("[data-slot='feature-date']");
  if (titleEl) titleEl.textContent = game.title || game.name || "Untitled";
  if (dateEl) dateEl.textContent = game.date || "";
  setFeatureBackground(game.image);
}

function setFeatureBackground(image) {
  const win = document.querySelector(".feature-window");
  if (!win) return;
  if (image) {
    win.style.backgroundImage = `
      linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%),
      linear-gradient(135deg, #2c2c2c, #0a0a0a),
      url('${image}')
    `;
    win.style.backgroundSize = "cover, auto, cover";
    win.style.backgroundPosition = "center, center, center";
    win.style.backgroundBlendMode = "overlay, normal, normal";
  } else {
    win.style.backgroundImage = "";
    win.style.backgroundSize = "";
    win.style.backgroundPosition = "";
    win.style.backgroundBlendMode = "";
  }
}

function renderGamesGrid(items) {
  const grid = document.querySelector("#games-grid");
  if (!grid || !items) return;
  grid.innerHTML = "";

  items.forEach((game, idx) => {
    const cell = document.createElement("div");
    cell.className = "item";
    cell.title = game.title || game.name || "Game";

    if (game.href) {
      cell.dataset.href = game.href;
      cell.tabIndex = 0;
      cell.setAttribute("role", "link");
      cell.addEventListener("click", () => {
        window.location.href = game.href;
      });
      cell.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          window.location.href = game.href;
        }
      });
    }

    if (game.image) {
      cell.classList.add("has-image");
      cell.style.backgroundImage = `
        linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.5)),
        url('${game.image}')
      `;
      cell.style.backgroundSize = "cover, cover";
      cell.style.backgroundPosition = "center, center";
      cell.style.backgroundBlendMode = "overlay, normal";
    } else {
      cell.classList.add("needs-tint");
      cell.dataset.tintIndex = idx;
    }

    grid.appendChild(cell);
  });

  tintIcons(grid);
}

function tintIcons(scope) {
  const colors = [
    ["#ffd166", "#8f5200"],
    ["#ef476f", "#5d102b"],
    ["#06d6a0", "#0a3b2f"],
    ["#118ab2", "#0c2e40"],
    ["#f2e94e", "#574c00"],
    ["#c77dff", "#3a1b5d"],
    ["#ff9b85", "#531f10"],
  ];

  (scope || document)
    .querySelectorAll(".item.needs-tint")
    .forEach((item, idx) => {
      const baseIndex = Number(item.dataset.tintIndex ?? idx);
      const pair = colors[baseIndex % colors.length];
      item.style.background = `radial-gradient(circle at 40% 35%, ${pair[0]}, ${pair[1]} 65%, #0a0a0a 85%)`;
    });
}

document.addEventListener("layout:ready", () => {
  renderShell();
  renderFeatured(featured);
  renderGamesGrid(games);
  renderLists();
});
