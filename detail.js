function renderDetail() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const slug = params.get("slug");
  const data = window.CONTENT || {};

  const collections = {
    post: data.posts || [],
    game: data.games || [],
  };

  const items = collections[type] || [];
  const entry = items.find((item) => item.slug === slug) || null;

  if (!entry) {
    setBodyText("Entry not found.");
    setHero({ title: "Missing", meta: "" });
    return;
  }

  const meta = entry.date || entry.meta || "";
  const body = entry.content || "No additional details provided yet.";

  setHero({ title: entry.title || "Untitled", meta });
  setBodyText(body);
  setHeroImage(entry.image);
}

function setHero({ title, meta }) {
  const titleEl = document.querySelector(".detail-title");
  const metaEl = document.querySelector(".detail-meta");
  if (titleEl) titleEl.textContent = title;
  if (metaEl) metaEl.textContent = meta;
}

function setHeroImage(image) {
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

function setBodyText(raw) {
  const body = document.getElementById("detail-body");
  if (!body) return;
  const normalized = normalizeContent(raw);
  const parts = normalized.split(/\n{2,}/);
  body.innerHTML = parts
    .map((p) => {
      // Simple bullet handling
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

document.addEventListener("layout:ready", renderDetail);
