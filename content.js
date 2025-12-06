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
      { label: "homepage", section: "home" },
      { label: "contact", section: "contact" },
      { label: "about", section: "about" },
    ],
  },
  featured: {
    title: "Transience",
    date: "05 Dec 2025",
    slug: "transience",
    href: "https://store.steampowered.com/app/2124100/Transience/",
    image: "images/transience.png",
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
      href: "#",
      image: "images/screen_wrap.png",
      content: text`
        Quick blurb about this game. Mention mechanics, mood, and where to play.
      `,
    },
    { title: "Project Echo", date: "02 Sep 2025", slug: "project-echo", href: "#", image: "", content: "Quick blurb for Project Echo." },
    { title: "Signal Black", date: "18 Aug 2025", slug: "signal-black", href: "#", image: "", content: "Quick blurb for Signal Black." },
    { title: "Rogue Lattice", date: "01 Aug 2025", slug: "rogue-lattice", href: "#", image: "", content: "Quick blurb for Rogue Lattice." },
    { title: "Delta Switch", date: "17 Jul 2025", slug: "delta-switch", href: "#", image: "", content: "Quick blurb for Delta Switch." },
  ],
  posts: [
    {
      date: "06 Nov 2025",
      title: "Sample entry about a new prototype release",
      slug: "prototype-release",
      href: "#",
      content: text`
        This is a longer note about the release. Keep adding lines without worrying about
        indenting the text file; the helper above will tidy it.

        - Add bullet points
        - Add links like https://example.com
        - Keep paragraphs separated by blank lines
      `,
    },
    { date: "12 Oct 2025", title: "Placeholder post about a small tournament", slug: "tournament", href: "#" },
    { date: "17 Sep 2025", title: "Example note on a 72 hour bundle", slug: "bundle-note", href: "#" },
    { date: "21 Aug 2025", title: "Devlog: release recap and future plans", slug: "devlog-recap", href: "#" },
    { date: "23 Jul 2025", title: "Launch announcement on PC", slug: "pc-launch", href: "#" },
    { date: "20 Jul 2025", title: "Bug fix: navigation buttons not working", slug: "nav-bugfix", href: "#" },
    { date: "15 Jul 2025", title: "Wishlist milestone and content tease", slug: "wishlist-tease", href: "#" },
    { date: "01 Jul 2025", title: "Help page display issue resolved", slug: "help-display", href: "#" },
    { date: "27 Jun 2025", title: "Join the official community server", slug: "community-server", href: "#" },
    { date: "24 Jun 2025", title: "Wishlist reminder for upcoming project", slug: "wishlist-reminder", href: "#" },
  ],
  experience: [
    { date: "2023 - Present", title: "Lead Developer, Independent Projects", meta: "Remote" },
    { date: "2021 - 2023", title: "Game Designer, Example Studio", meta: "Helsinki" },
    { date: "2019 - 2021", title: "Technical Artist, Sample Collective", meta: "Berlin" },
    { date: "2016 - 2019", title: "Freelance Developer, Various Clients", meta: "Global" },
  ],
};
