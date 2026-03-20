import { routeToPath } from "./routing.js";

const DEFAULT_IMAGE_PATH = "/images/frog.png";

function stripHtml(html) {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureMeta(selector, create) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = create();
    document.head.appendChild(node);
  }
  return node;
}

function setMetaByName(name, content) {
  const node = ensureMeta(`meta[name=\"${name}\"]`, () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", name);
    return meta;
  });
  node.setAttribute("content", content || "");
}

function setMetaByProperty(property, content) {
  const node = ensureMeta(`meta[property=\"${property}\"]`, () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", property);
    return meta;
  });
  node.setAttribute("content", content || "");
}

function setCanonical(url) {
  const node = ensureMeta("link[rel=\"canonical\"]", () => {
    const link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    return link;
  });
  node.setAttribute("href", url);
}

function toAbsoluteUrl(baseUrl, input, fallback = "") {
  const value = String(input || fallback || "").trim();
  if (!value) return "";
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return "";
  }
}

function routeHeadline(section) {
  switch (section) {
    case "posts-all":
      return "Posts";
    case "games-all":
      return "Games";
    case "about":
      return "About";
    case "contact":
      return "Contact";
    default:
      return "Home";
  }
}

export function updateSeo({ route, entry, site }) {
  const siteName = site?.name || "Frinky";
  const siteDesc = site?.description || "Frinky's portfolio of games and posts.";
  const baseUrl = site?.url || window.location.origin;

  const pathname = routeToPath(route);
  const absoluteUrl = toAbsoluteUrl(baseUrl, pathname);

  let title = `${siteName} | ${routeHeadline(route.section)}`;
  let description = siteDesc;
  let ogType = "website";
  let image = toAbsoluteUrl(baseUrl, DEFAULT_IMAGE_PATH);

  if (route.section === "detail" && entry) {
    title = `${entry.title} | ${siteName}`;
    description = entry.summary || stripHtml(entry.contentHtml).slice(0, 180) || siteDesc;
    ogType = route.type === "post" ? "article" : "website";
    image = toAbsoluteUrl(baseUrl, entry.image || DEFAULT_IMAGE_PATH, DEFAULT_IMAGE_PATH);
  }

  document.title = title;
  setCanonical(absoluteUrl);
  setMetaByName("description", description);
  setMetaByProperty("og:type", ogType);
  setMetaByProperty("og:site_name", siteName);
  setMetaByProperty("og:title", title);
  setMetaByProperty("og:description", description);
  setMetaByProperty("og:url", absoluteUrl);
  setMetaByProperty("og:image", image);
  setMetaByName("twitter:card", image ? "summary_large_image" : "summary");
  setMetaByName("twitter:title", title);
  setMetaByName("twitter:description", description);
  setMetaByName("twitter:image", image);
}
