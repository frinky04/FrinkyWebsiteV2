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

const link = (type, slug) => `detail.html?type=${type}&slug=${slug}`;

window.CONTENT = {
  site: {
    title: "Finn Rawlings (Frinky)",
    year: "2025",
    nav: [
      { label: "homepage", href: "index.html#top" },
      { label: "contact", href: "contact.html" },
      { label: "about", href: "about.html" },
    ],
  },
  featured: {
    title: "example project",
    date: "14 Oct 2025",
    slug: "example-project",
    href: link("game", "example-project"),
    image: "1.png",
    content: text`
      A short teaser for the featured project. Drop a few sentences here
      about what makes it interesting and why someone should click in.
    `,
  },
  games: [
    {
      title: "example project",
      date: "14 Oct 2025",
      slug: "example-project",
      href: link("game", "example-project"),
      image: "1.png",
      content: text`
        Paragraph one about this game. Mention mechanics, mood, and where to play.

        Paragraph two can include links, credits, or quick patch highlights.
      `,
    },
    { title: "Project Echo", date: "02 Sep 2025", slug: "project-echo", href: link("game", "project-echo"), image: "" },
    { title: "Signal Black", date: "18 Aug 2025", slug: "signal-black", href: link("game", "signal-black"), image: "" },
    { title: "Rogue Lattice", date: "01 Aug 2025", slug: "rogue-lattice", href: link("game", "rogue-lattice"), image: "" },
    { title: "Delta Switch", date: "17 Jul 2025", slug: "delta-switch", href: link("game", "delta-switch"), image: "" },
    { title: "Brass Needle", date: "04 Jul 2025", slug: "brass-needle", href: link("game", "brass-needle"), image: "" },
    { title: "Night Ferry", date: "19 Jun 2025", slug: "night-ferry", href: link("game", "night-ferry"), image: "" },
    { title: "Horizon Fold", date: "29 May 2025", slug: "horizon-fold", href: link("game", "horizon-fold"), image: "" },
    { title: "Dust Relay", date: "10 May 2025", slug: "dust-relay", href: link("game", "dust-relay"), image: "" },
    { title: "Static Bloom", date: "21 Apr 2025", slug: "static-bloom", href: link("game", "static-bloom"), image: "" },
    { title: "Glass Choir", date: "02 Apr 2025", slug: "glass-choir", href: link("game", "glass-choir"), image: "" },
    { title: "Vapor Spine", date: "14 Mar 2025", slug: "vapor-spine", href: link("game", "vapor-spine"), image: "" },
  ],
  posts: [
    {
      date: "06 Nov 2025",
      title: "Sample entry about a new prototype release",
      slug: "prototype-release",
      href: link("post", "prototype-release"),
      content: text`
        This is a longer note about the release. Keep adding lines without worrying about
        indenting the text file; the helper above will tidy it.

        - Add bullet points
        - Add links like https://example.com
        - Keep paragraphs separated by blank lines
      `,
    },
    { date: "12 Oct 2025", title: "Placeholder post about a small tournament", slug: "tournament", href: link("post", "tournament") },
    { date: "17 Sep 2025", title: "Example note on a 72 hour bundle", slug: "bundle-note", href: link("post", "bundle-note") },
    { date: "21 Aug 2025", title: "Devlog: release recap and future plans", slug: "devlog-recap", href: link("post", "devlog-recap") },
    { date: "23 Jul 2025", title: "Launch announcement on PC", slug: "pc-launch", href: link("post", "pc-launch") },
    { date: "20 Jul 2025", title: "Bug fix: navigation buttons not working", slug: "nav-bugfix", href: link("post", "nav-bugfix") },
    { date: "15 Jul 2025", title: "Wishlist milestone and content tease", slug: "wishlist-tease", href: link("post", "wishlist-tease") },
    { date: "01 Jul 2025", title: "Help page display issue resolved", slug: "help-display", href: link("post", "help-display") },
    { date: "27 Jun 2025", title: "Join the official community server", slug: "community-server", href: link("post", "community-server") },
    { date: "24 Jun 2025", title: "Wishlist reminder for upcoming project", slug: "wishlist-reminder", href: link("post", "wishlist-reminder") },
  ],
  experience: [
    { date: "2023 - Present", title: "Lead Developer, Independent Projects", meta: "Remote" },
    { date: "2021 - 2023", title: "Game Designer, Example Studio", meta: "Helsinki" },
    { date: "2019 - 2021", title: "Technical Artist, Sample Collective", meta: "Berlin" },
    { date: "2016 - 2019", title: "Freelance Developer, Various Clients", meta: "Global" },
  ],
};
