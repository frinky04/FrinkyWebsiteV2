import fs from "node:fs/promises";
import path from "node:path";
import { defineConfig } from "vite";
import { generateContent } from "./scripts/generate-content.mjs";

const PAGES_GLOB = /[\\/]pages[\\/].*\.md$/;
const DEFAULT_SITE_URL = "https://frinky.org";
const DEFAULT_DESCRIPTION = "Frinky's portfolio of games, updates, and development posts.";
const DEFAULT_IMAGE_PATH = "/images/frog.png";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toAbsoluteUrl(base, candidate, fallback = "") {
  const value = String(candidate || fallback || "").trim();
  if (!value) return "";

  try {
    return new URL(value, base).toString();
  } catch {
    return "";
  }
}

function upsertHeadTag(html, regex, tagLine) {
  if (regex.test(html)) return html.replace(regex, tagLine);
  return html.replace("</head>", `  ${tagLine}\n</head>`);
}

function injectRouteSeo(indexHtml, meta) {
  let html = indexHtml;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  html = upsertHeadTag(
    html,
    /<link\s+[^>]*rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${escapeHtml(meta.url)}" />`
  );

  html = html
    .replace(/<meta\s+name=["']description["'][^>]*>\s*/gi, "")
    .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>\s*/gi, "")
    .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>\s*/gi, "");

  const tags = [
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:type" content="${escapeHtml(meta.ogType)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(meta.siteName)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.url)}" />`,
    `<meta name="twitter:card" content="${escapeHtml(meta.twitterCard)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  ];

  if (meta.image) {
    tags.push(`<meta property="og:image" content="${escapeHtml(meta.image)}" />`);
    tags.push(`<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`);
  }

  const block = tags.map((tag) => `  ${tag}`).join("\n");
  return html.replace("</head>", `${block}\n</head>`);
}

async function generateSocialRoutePages({ outDir, indexHtml, payload, logger }) {
  const siteName = payload?.site?.name || "Frinky";
  const siteUrl = payload?.site?.url || DEFAULT_SITE_URL;
  const siteDescription = payload?.site?.description || DEFAULT_DESCRIPTION;
  const posts = Array.isArray(payload?.posts) ? payload.posts : [];
  const games = Array.isArray(payload?.games) ? payload.games : [];
  const entries = [
    ...posts.map((entry) => ({ ...entry, type: "post" })),
    ...games.map((entry) => ({ ...entry, type: "game" })),
  ];

  let written = 0;

  for (const entry of entries) {
    const slug = String(entry.slug || "").trim();
    if (!slug) continue;

    const section = entry.type === "post" ? "posts" : "games";
    const routePath = `/${section}/${slug}/`;
    const url = toAbsoluteUrl(siteUrl, routePath);
    const title = `${entry.title || "Untitled"} | ${siteName}`;
    const description = String(entry.summary || stripHtml(entry.contentHtml).slice(0, 180) || siteDescription);
    const image = toAbsoluteUrl(siteUrl, entry.image || DEFAULT_IMAGE_PATH, DEFAULT_IMAGE_PATH);
    const routeHtml = injectRouteSeo(indexHtml, {
      siteName,
      title,
      description,
      url,
      image,
      ogType: entry.type === "post" ? "article" : "website",
      twitterCard: image ? "summary_large_image" : "summary",
    });

    const outputPath = path.join(outDir, section, slug, "index.html");
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, routeHtml, "utf8");
    written += 1;
  }

  logger?.info(`[content] generated social route html (${written} pages)`);
}

function contentPlugin() {
  let latestPayload = null;
  let resolvedConfig = null;

  const rebuild = async (logger) => {
    latestPayload = await generateContent();
    logger?.info("[content] generated markdown content index");
    return latestPayload;
  };

  return {
    name: "markdown-content-generator",
    async configResolved(config) {
      resolvedConfig = config;
      this.__logger = config.logger;
    },
    async buildStart() {
      await rebuild(this.__logger);
    },
    async closeBundle() {
      if (!resolvedConfig || resolvedConfig.command !== "build") return;

      const root = resolvedConfig.root || process.cwd();
      const outDir = path.resolve(root, resolvedConfig.build?.outDir || "dist");
      const indexPath = path.join(outDir, "index.html");

      let indexHtml = "";
      try {
        indexHtml = await fs.readFile(indexPath, "utf8");
      } catch (error) {
        this.__logger?.warn(`[content] skipped social route html generation: ${(error && error.message) || error}`);
        return;
      }

      const payload = latestPayload || (await rebuild(this.__logger));
      await generateSocialRoutePages({
        outDir,
        indexHtml,
        payload,
        logger: this.__logger,
      });
    },
    configureServer(server) {
      rebuild(server.config.logger).catch((error) => {
        server.config.logger.error(error?.message || String(error));
      });

      const refresh = async (file) => {
        if (!PAGES_GLOB.test(file)) return;
        try {
          await rebuild(server.config.logger);
          server.ws.send({ type: "full-reload" });
        } catch (error) {
          server.config.logger.error(error?.message || String(error));
        }
      };

      server.watcher.on("add", refresh);
      server.watcher.on("change", refresh);
      server.watcher.on("unlink", refresh);
    },
  };
}

export default defineConfig({
  plugins: [contentPlugin()],
});
