// Helper to write tidy multi-line text without worrying about indent.
function dedent(str) {
  const lines = str.split(/\r?\n/);
  // Strip leading/trailing blank lines
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

window.CONTENT = {
  site: {
    title: "Finn Rawlings (Frinky)",
    nav: [
      { label: "home", section: "home" },
      { label: "contact", section: "contact" },
      { label: "about", section: "about" },
    ],
  },
  featured: {
    title: "Transience",
    date: "05 Dec 2025",
    slug: "transience",
    image: "images/transience_screenshot.webp",
    content: text`
    Become an Accountant - a hired mercenary who keeps the books balanced by any means necessary. This time though, you are the intended target. Take a journey through New Houston in the year 2056 and follow one man's tale of revenge as he escapes Transience.
    `,
  },
  games: [
    {
      title: "Bang Shoot",
      date: "Coming Soon",
      slug: "bang-shoot",
      href: "#",
      image: "images/bang-shoot.webp",
      downloadUrl: "https://store.steampowered.com/app/3264590/bang_shoot/",
      content: text`
      A fast-paced arena shooter where you wield two weapons at once across unique battlegrounds. Each round is different—new map, teams, weapons, and modifiers.
      `,
    },
    {
      title: "Transience",
      date: "05 Dec 2025",
      slug: "transience",
      href: "#",
      image: "images/transience_screenshot.webp",
      downloadUrl: "https://store.steampowered.com/app/2124100/Transience/",
      content: text`
      Become an Accountant - a hired mercenary who keeps the books balanced by any means necessary. This time though, you are the intended target. Take a journey through New Houston in the year 2056 and follow one man's tale of revenge as he escapes Transience.
      `,
    },
    {
      title: "Screen Wrap",
      date: "02 Aug 2025",
      slug: "screen-wrap",
      href: "#",
      image: "images/screen_wrap.webp",
      downloadUrl: "https://frinkyyy.itch.io/screenwrap",
      content: text`
      A short, top down, atmospheric puzzle game about boundary warp, screen wrap, whatever you want to call it. Built by frinky & daniel in 4 days for the GMTK game jam.
      `,
    },
    {
      title: "Dishwashing Simulator",
      date: "03 April 2024",
      slug: "dishwashing-simulator",
      href: "#",
      image: "images/dishwashing-simulator.webp",
      downloadUrl: "https://store.steampowered.com/app/2747780/Dishwashing_Simulator/",
      content: text`
      A short, unique survival-farming-base-building-tycoon-horror game where you must survive through washing dishes. Explore mysterious depths, manage resources, and unravel a cryptic narrative. In DWS, a chore becomes a journey to freedom.
      `,
    },
    {
      title: "Infinite Golf",
      date: "07 Feb 2024",
      slug: "infinite-golf",
      href: "#",
      image: "images/infinite_golf.webp",
      downloadUrl: "https://frinkyyy.itch.io/infinite-golf",
      content: text`
      A zen-like golf experience where you can relax whilst hitting the ball into the hole. Made with Godot.
      `,
    },
    {
      title: "Ground Unbound",
      date: "08 Oct 2021",
      slug: "ground-unbound",
      href: "#",
      image: "images/ground-unbound.webp",
      downloadUrl: "https://store.steampowered.com/app/1760020/GROUNDUNBOUND/",
      content: text`
      GROUND-UNBOUND is a procedurally generated, high-intensity movement shooter with a retro wave art style. It features roguelike mechanics with a number of skills, guns and abilities to play with, including a variety of enemy types. Created during the 7-Day BigFry Game Jam, updated for steam release.
      `,
    },
    {
      title: "Chaos",
      date: "28 April 2020",
      slug: "chaos",
      href: "#",
      image: "images/chaos.webp",
      downloadUrl: "https://store.steampowered.com/app/1230410/Chaos/",
      content: text`
      Chaos is an online FPS game. Why should you play it? Destruction, lots of it, plus some explosions, oh yeah, guns! Who doesn't like guns and explosions?
      `,
    },
  ],
  posts: [
    {
      date: "07 Dec 2025",
      title: "New website",
      slug: "website-release",
      href: "#",
      content: text`
        Decided to make a new website.
      `,
    },
    {
      date: "24 Sep 2004",
      title: "I was born",
      slug: "birth",
      href: "#",
      content: text`
        Spawned into the world on this day.
      `,
    },
  ],
  experience: [
    { date: "2022 - Present", title: "Full-time Remote Programmer & Gameplay Designer", meta: "Transience @ RESURGENT" },
  ],
};
