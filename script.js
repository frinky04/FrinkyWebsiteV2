const content = window.CONTENT || {};
const games = content.games || [];
const posts = content.posts || [];
const featured = content.featured || games.find((g) => g.featured) || games[0];

let currentSection = "home";

const FEEDS = {
  posts: {
    items: posts,
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

function showSection(section, pushHistory = false) {
  if (!section) return;
  currentSection = section;
  document.querySelectorAll(".page-section").forEach((sec) => {
    const id = sec.id.replace("section-", "");
    sec.classList.toggle("hidden", id !== section);
  });
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === section);
  });
  if (pushHistory) {
    history.pushState({ section }, "", `#${section}`);
  }
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
    link.href = "#";
    link.textContent = item.title || item.text || "Untitled";

    meta.className = "meta";
    meta.textContent = typeof metaFn === "function" ? metaFn(item) : item.meta ?? "";

    const fullContent = normalizeContent(item.content);
    if (fullContent) li.dataset.content = fullContent;
    if (item.slug) {
      li.dataset.slug = item.slug;
      li.dataset.type = "post";
      li.style.cursor = "pointer";
      link.addEventListener("click", (ev) => {
        ev.preventDefault();
        openDetail("post", item.slug);
      });
      li.addEventListener("click", () => openDetail("post", item.slug));
    }

    li.append(date, link, meta);
    listEl.appendChild(li);
  });
}

function renderLists() {
  document.querySelectorAll("[data-feed]").forEach((list) => {
    const key = list.dataset.feed;
    const feed = FEEDS[key];
    if (!feed) return;
    buildList(feed.items, list, feed.meta);
  });
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

    if (game.slug) {
      cell.dataset.slug = game.slug;
      cell.dataset.type = "game";
      cell.style.cursor = "pointer";
      cell.addEventListener("click", () => openDetail("game", game.slug));
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

function openDetail(type, slug) {
  const entry = findEntry(type, slug);
  if (!entry) return;
  setDetail(entry);
  showSection("detail", false);
  history.pushState({ section: "detail", type, slug }, "", "#detail");
}

function findEntry(type, slug) {
  const collection = type === "game" ? games : posts;
  return collection.find((item) => item.slug === slug);
}

function setDetail(entry) {
  const titleEl = document.querySelector(".detail-title");
  const metaEl = document.querySelector(".detail-meta");
  const bodyEl = document.getElementById("detail-body");
  const meta = entry.date || entry.meta || "";

  if (titleEl) titleEl.textContent = entry.title || entry.name || "Untitled";
  if (metaEl) metaEl.textContent = meta;
  if (bodyEl) {
    const normalized = normalizeContent(entry.content) || "More details coming soon.";
    const parts = normalized.split(/\n{2,}/);
    bodyEl.innerHTML = parts
      .map((p) => {
        if (p.trim().startsWith("-")) {
          const items = p
            .split(/\n/)
            .map((line) => line.replace(/^\s*-\s?/, "").trim())
            .filter(Boolean)
            .map((li) => `<li>${li}</li>`)
            .join("");
          return `<ul>${items}</ul>`;
        }
        return `<p>${p.replace(/\n/g, "<br>")}</p>`;
      })
      .join("");
  }
  setDetailHero(entry.image);
}

function setDetailHero(image) {
  const hero = document.querySelector(".detail-hero");
  if (!hero) return;
  if (image) {
    hero.style.backgroundImage = `
      linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.6)),
      url('${image}')
    `;
    hero.style.backgroundSize = "cover, cover";
    hero.style.backgroundPosition = "center, center";
    hero.style.backgroundBlendMode = "overlay, normal";
  } else {
    hero.style.backgroundImage = "linear-gradient(180deg, #1a1a1a, #0a0a0a)";
    hero.style.backgroundSize = "";
    hero.style.backgroundPosition = "";
    hero.style.backgroundBlendMode = "";
  }
}

function setupNav() {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.addEventListener("click", (ev) => {
      ev.preventDefault();
      const target = link.dataset.nav;
      if (!target) return;
      showSection(target, true);
    });
  });
}

window.addEventListener("popstate", (event) => {
  const state = event.state;
  if (state?.section === "detail" && state.type && state.slug) {
    const entry = findEntry(state.type, state.slug);
    if (entry) {
      setDetail(entry);
      showSection("detail", false);
      return;
    }
  }
  const section = state?.section || "home";
  showSection(section, false);
});

document.addEventListener("DOMContentLoaded", () => {
  history.replaceState({ section: "home" }, "", "#home");
  renderFeatured(featured);
  renderGamesGrid(games);
  renderLists();
  setupNav();
  showSection("home", false);
});
