#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Helper function from content.js
function dedent(str) {
  const lines = str.split(/\r?\n/);
  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  const indents = lines
    .filter((l) => l.trim())
    .map((l) => l.match(/^\s*/)[0].length);
  const pad = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(pad)).join("\n");
}

const text = (strings, ...values) => {
  const raw = strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "");
  return dedent(raw);
};

// Load content
const contentFile = fs.readFileSync('./content.js', 'utf-8');
const contentMatch = contentFile.match(/window\.CONTENT\s*=\s*({[\s\S]*?});/);
if (!contentMatch) {
  console.error('Could not parse content.js');
  process.exit(1);
}

const content = eval(`(${contentMatch[1]})`);

const baseUrl = 'https://frinky.org';

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

function generateBlurb(contentText, maxWords = 20) {
  if (!contentText) return "";
  const normalized = normalizeContent(contentText);
  const plainText = normalized
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,3}\s+/g, "")
    .replace(/\n+/g, " ")
    .trim();
  const words = plainText.split(/\s+/).filter(Boolean);
  const blurb = words.slice(0, maxWords).join(" ");
  return words.length > maxWords ? blurb + "..." : blurb;
}

function escapeHTML(str) {
  return (str || "").replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return char;
    }
  });
}

function generateMetaTags(title, description, image, url) {
  return `
  <!-- Open Graph / Social Media Meta Tags -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHTML(url)}" />
  <meta property="og:title" content="${escapeHTML(title)}" />
  <meta property="og:description" content="${escapeHTML(description)}" />
  <meta property="og:image" content="${escapeHTML(image)}" />

  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${escapeHTML(url)}" />
  <meta name="twitter:title" content="${escapeHTML(title)}" />
  <meta name="twitter:description" content="${escapeHTML(description)}" />
  <meta name="twitter:image" content="${escapeHTML(image)}" />`;
}

function generateHTML(title, description, image, url, redirectUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHTML(description)}" />
  <title>${escapeHTML(title)}</title>
  <link rel="icon" type="image/png" href="/images/frog.png" />
${generateMetaTags(title, description, image, url)}
  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
  <script>window.location.href = "${redirectUrl}";</script>
  <link rel="canonical" href="${redirectUrl}" />
</head>
<body>
  <p>Redirecting to <a href="${redirectUrl}">${redirectUrl}</a>...</p>
</body>
</html>`;
}

// Create output directory
const outputDir = './generated';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate pages for games
if (content.games && Array.isArray(content.games)) {
  content.games.forEach(game => {
    if (!game.slug) return;

    const title = game.title || game.name || "Untitled";
    const description = generateBlurb(game.content, 20);
    const image = game.image
      ? (game.image.startsWith('http') ? game.image : `${baseUrl}/${game.image}`)
      : `${baseUrl}/images/frog.png`;
    const url = `${baseUrl}/game/${game.slug}`;
    const redirectUrl = `${baseUrl}/#detail-game-${game.slug}`;

    const html = generateHTML(title, description, image, url, redirectUrl);

    const gameDir = path.join(outputDir, 'game', game.slug);
    fs.mkdirSync(gameDir, { recursive: true });
    fs.writeFileSync(path.join(gameDir, 'index.html'), html);

    console.log(`✓ Generated page for game: ${game.slug}`);
  });
}

// Generate pages for posts
if (content.posts && Array.isArray(content.posts)) {
  content.posts.forEach(post => {
    if (!post.slug) return;

    const title = post.title || "Untitled";
    const description = generateBlurb(post.content, 20);
    const image = `${baseUrl}/images/frog.png`;
    const url = `${baseUrl}/post/${post.slug}`;
    const redirectUrl = `${baseUrl}/#detail-post-${post.slug}`;

    const html = generateHTML(title, description, image, url, redirectUrl);

    const postDir = path.join(outputDir, 'post', post.slug);
    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(path.join(postDir, 'index.html'), html);

    console.log(`✓ Generated page for post: ${post.slug}`);
  });
}

console.log('\n✓ All pages generated successfully!');
console.log(`\nTo use these pages, copy the contents of the '${outputDir}' directory to your web root.`);
console.log('\nShare URLs like:');
console.log(`  ${baseUrl}/post/luaruntime-release`);
console.log(`  ${baseUrl}/game/transience`);
