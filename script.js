const content = window.CONTENT || {};
const games = content.games || [];
const posts = content.posts || [];
const featured = content.featured || games.find((g) => g.featured) || games[0];

let currentSection = "home";
const MAX_POSTS = 8;

const FEEDS = {
  posts: {
    items: posts,
    meta: (item) => item.meta ?? (item.date ? daysAgo(item.date) : ""),
  },
  experience: {
    items: content.experience || [],
    meta: (item) => item.meta ?? "",
  },
  games: {
    items: games,
    meta: (item) => item.date || "",
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
    if (item.date) {
      meta.textContent = daysAgo(item.date);
    } else {
      meta.textContent = typeof metaFn === "function" ? metaFn(item) : item.meta ?? "";
    }

    const fullContent = normalizeContent(item.content);
    if (fullContent) li.dataset.content = fullContent;
    if (item.slug) {
      li.dataset.slug = item.slug;
      li.dataset.type = "post";
      link.addEventListener("click", (ev) => {
        ev.preventDefault();
        openDetail("post", item.slug);
      });
    }

    li.append(date, link, meta);
    listEl.appendChild(li);
  });
}

function renderLists() {
  renderPostsList();
  renderGamesList();
  renderAllPostsList();
  const expList = document.querySelector("#experience-list");
  buildList(FEEDS.experience.items, expList, FEEDS.experience.meta);
}

function renderPostsList() {
  const list = document.querySelector("#registry-list");
  if (!list) return;
  const items = posts.slice(0, MAX_POSTS);
  buildList(items, list, FEEDS.posts.meta);
}

function renderGamesList() {
  const list = document.querySelector("#games-list");
  if (!list) return;
  buildList(FEEDS.games.items, list, FEEDS.games.meta);
}

function renderAllPostsList() {
  const list = document.querySelector("#all-posts-list");
  if (!list) return;
  buildList(posts, list, FEEDS.posts.meta);
}

function renderFeatured(game) {
  if (!game) return;
  const titleEl = document.querySelector("[data-slot='feature-title']");
  const windowEl = document.querySelector(".feature-window");
  const blurbEl = document.querySelector("#feature-blurb");
  if (titleEl) titleEl.textContent = game.title || game.name || "Untitled";
  const fallbackImage = findEntry("game", game.slug || "")?.image || games.find((g) => g.image)?.image;
  setFeatureBackground(game.image || fallbackImage);
  if (blurbEl) {
    const datePart = game.date ? `${game.date}` : "";
    const ago = game.date ? ` (${daysAgo(game.date)})` : "";
    const body = normalizeContent(game.content) || "No description available.";
    blurbEl.innerHTML = `
      <div class="detail-meta">${datePart}${ago}</div>
      <div class="blurb-body">${body.replace(/\n/g, "<br>")}</div>
    `;
  }
  if (windowEl) {
    const hasHref = Boolean(game.href);
    const hasSlug = Boolean(game.slug);
    windowEl.classList.toggle("clickable", hasHref || hasSlug);
    windowEl.onclick = null;
    windowEl.onkeydown = null;
    windowEl.tabIndex = hasHref || hasSlug ? 0 : -1;

    const handleActivate = () => {
      if (hasHref) {
        window.location.href = game.href;
      } else if (hasSlug) {
        openDetail("game", game.slug);
      }
    };

    if (hasHref || hasSlug) {
      windowEl.addEventListener("click", handleActivate);
      windowEl.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          handleActivate();
        }
      });
    }
  }
}

function setFeatureBackground(image) {
  const win = document.querySelector(".feature-window");
  if (!win) return;
  if (image) {
    win.style.backgroundImage = `
      url('${image}'),
      linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.75) 100%)
    `;
    win.style.backgroundSize = "cover, cover";
    win.style.backgroundPosition = "center, center";
    win.style.backgroundBlendMode = "normal, overlay";
  } else {
    win.style.backgroundImage = "";
    win.style.backgroundSize = "";
    win.style.backgroundPosition = "";
    win.style.backgroundBlendMode = "";
  }
}

function openDetail(type, slug) {
  const entry = findEntry(type, slug);
  if (!entry) return;
  setDetail(entry);
  const state = { section: "detail", type, slug };
  if (history.state?.section === "detail" && history.state.slug === slug && history.state.type === type) {
    showSection("detail", false);
    return;
  }
  history.pushState(state, "", "#detail");
  showSection("detail", false);
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
      const state = { section: target };
      history.pushState(state, "", `#${target}`);
      showSection(target, false);
    });
  });
  const postsAll = document.querySelector("[data-action='view-all-posts']");
  if (postsAll) {
    postsAll.addEventListener("click", (ev) => {
      ev.preventDefault();
      history.pushState({ section: "posts-all" }, "", "#posts-all");
      showSection("posts-all", false);
    });
  }
  const backHome = document.querySelector("[data-action='back-home']");
  if (backHome) {
    backHome.addEventListener("click", (ev) => {
      ev.preventDefault();
      history.pushState({ section: "home" }, "", "#home");
      showSection("home", false);
    });
  }
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
  renderLists();
  setupNav();
  showSection("home", false);
});
