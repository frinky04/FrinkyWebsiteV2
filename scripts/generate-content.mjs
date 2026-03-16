import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const PAGES_DIR = path.join(ROOT, "pages");
const OUTPUT_FILE = path.join(ROOT, "src", "generated", "content.generated.js");

marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: false,
  mangle: false,
});

const REQUIRED = {
  post: ["title", "slug", "date"],
  game: ["title", "slug", "date", "image"],
};

const COLLECTIONS = [
  { type: "post", dir: "posts" },
  { type: "game", dir: "games" },
];

function normalizeUrl(url) {
  if (!url) return "";
  const value = url.trim();
  if (!value) return "";

  // Keep external, hash, data, and already-rooted URLs unchanged.
  if (/^(?:[a-z]+:)?\/\//i.test(value) || /^(?:mailto:|tel:|data:|#)/i.test(value) || value.startsWith("/")) {
    return value;
  }

  return `/${value.replace(/^\.?\//, "")}`;
}

function normalizeHtmlUrls(html) {
  if (!html) return "";
  return html.replace(/(src|href)="([^"]+)"/g, (match, attr, value) => {
    const normalized = normalizeUrl(value);
    return `${attr}="${normalized || value}"`;
  });
}

function ensureString(value, key, sourcePath, required = true) {
  if (value == null || value === "") {
    if (required) {
      throw new Error(`Missing required frontmatter '${key}' in ${sourcePath}`);
    }
    return "";
  }
  if (typeof value !== "string") {
    throw new Error(`Frontmatter '${key}' must be a string in ${sourcePath}`);
  }
  return value.trim();
}

function ensureBoolean(value, key, sourcePath, fallback = false) {
  if (value == null) return fallback;
  if (typeof value !== "boolean") {
    throw new Error(`Frontmatter '${key}' must be a boolean in ${sourcePath}`);
  }
  return value;
}

function ensureNumber(value, key, sourcePath) {
  if (value == null || value === "") return null;
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Frontmatter '${key}' must be a number in ${sourcePath}`);
  }
  return value;
}

function toEpoch(input) {
  if (!input || typeof input !== "string") return 0;
  const timestamp = Date.parse(input);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function stripMarkdownExcerpt(markdown) {
  const plain = (markdown || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~]/g, "")
    .trim();
  if (!plain) return "";
  const firstLine = plain.split(/\r?\n/).find((line) => line.trim());
  return (firstLine || "").trim();
}

function compareEntries(a, b) {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

  const aHasOrder = typeof a.order === "number";
  const bHasOrder = typeof b.order === "number";
  if (aHasOrder && bHasOrder && a.order !== b.order) {
    return a.order - b.order;
  }
  if (aHasOrder !== bHasOrder) return aHasOrder ? -1 : 1;

  if (a.sortEpoch !== b.sortEpoch) return b.sortEpoch - a.sortEpoch;
  return a.title.localeCompare(b.title);
}

async function readCollection({ type, dir }) {
  const collectionDir = path.join(PAGES_DIR, dir);
  let files;
  try {
    files = await fs.readdir(collectionDir);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(`Missing content directory: ${collectionDir}`);
    }
    throw error;
  }

  const mdFiles = files.filter((name) => name.endsWith(".md"));
  const entries = [];
  const seenSlugs = new Set();

  for (const fileName of mdFiles) {
    const fullPath = path.join(collectionDir, fileName);
    const raw = await fs.readFile(fullPath, "utf8");
    const { data, content } = matter(raw);

    for (const key of REQUIRED[type]) {
      ensureString(data[key], key, fullPath, true);
    }

    const slug = ensureString(data.slug, "slug", fullPath, true);
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error(`Frontmatter 'slug' must match /^[a-z0-9-]+$/ in ${fullPath}`);
    }
    if (seenSlugs.has(slug)) {
      throw new Error(`Duplicate slug '${slug}' in ${collectionDir}`);
    }
    seenSlugs.add(slug);

    const date = ensureString(data.date, "date", fullPath, true);
    const sortDate = ensureString(data.sortDate, "sortDate", fullPath, false);
    const sortEpoch = toEpoch(sortDate) || toEpoch(date);

    const summary = ensureString(data.summary, "summary", fullPath, false) || stripMarkdownExcerpt(content);

    const entry = {
      type,
      title: ensureString(data.title, "title", fullPath, true),
      slug,
      date,
      sortDate,
      sortEpoch,
      summary,
      pinned: ensureBoolean(data.pinned, "pinned", fullPath, false),
      featured: ensureBoolean(data.featured, "featured", fullPath, false),
      order: ensureNumber(data.order, "order", fullPath),
      image: normalizeUrl(ensureString(data.image, "image", fullPath, false)),
      downloadUrl: ensureString(data.downloadUrl, "downloadUrl", fullPath, false),
      contentHtml: normalizeHtmlUrls(marked.parse(content).trim()),
    };

    entries.push(entry);
  }

  return entries;
}

function toOutput(entry) {
  const out = {
    title: entry.title,
    slug: entry.slug,
    date: entry.date,
    summary: entry.summary,
    pinned: entry.pinned,
    featured: entry.featured,
    order: entry.order,
    image: entry.image,
    contentHtml: entry.contentHtml,
  };

  if (entry.downloadUrl) out.downloadUrl = entry.downloadUrl;
  if (entry.sortDate) out.sortDate = entry.sortDate;

  return out;
}

export async function generateContent() {
  const bucket = { post: [], game: [] };

  for (const collection of COLLECTIONS) {
    const entries = await readCollection(collection);
    bucket[collection.type].push(...entries);
  }

  const posts = bucket.post.sort(compareEntries);
  const games = bucket.game.sort(compareEntries);

  const featuredCandidates = games.filter((item) => item.featured).sort(compareEntries);
  const featured = featuredCandidates[0] || games[0] || null;

  const payload = {
    posts: posts.map(toOutput),
    games: games.map(toOutput),
    featured: featured ? toOutput(featured) : null,
  };

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(
    OUTPUT_FILE,
    `// Auto-generated by scripts/generate-content.mjs. Do not edit directly.\nexport const CONTENT = ${JSON.stringify(payload, null, 2)};\n`,
    "utf8"
  );

  return payload;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateContent().catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
}
