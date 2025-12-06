const registryItems = [
  { date: "06 Nov 2025", text: "Sample entry about a new prototype release" },
  { date: "12 Oct 2025", text: "Placeholder post about a small tournament" },
  { date: "17 Sep 2025", text: "Example note on a 72 hour bundle" },
  { date: "21 Aug 2025", text: "Devlog: release recap and future plans" },
  { date: "23 Jul 2025", text: "Launch announcement on PC" },
  { date: "20 Jul 2025", text: "Bug fix: navigation buttons not working" },
  { date: "15 Jul 2025", text: "Wishlist milestone and content tease" },
  { date: "01 Jul 2025", text: "Help page display issue resolved" },
  { date: "27 Jun 2025", text: "Join the official community server" },
  { date: "24 Jun 2025", text: "Wishlist reminder for upcoming project" },
];

const experienceItems = [
  { date: "2023 - Present", text: "Lead Developer, Independent Projects", meta: "Remote" },
  { date: "2021 - 2023", text: "Game Designer, Example Studio", meta: "Helsinki" },
  { date: "2019 - 2021", text: "Technical Artist, Sample Collective", meta: "Berlin" },
  { date: "2016 - 2019", text: "Freelance Developer, Various Clients", meta: "Global" },
];

function daysAgo(dateString) {
  const target = new Date(dateString);
  const now = new Date();
  const ms = now - target;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days} days ago`;
}

function buildList(items, selector) {
  const list = document.querySelector(selector);
  if (!list) return;

  items.forEach((item) => {
    const li = document.createElement("li");
    const date = document.createElement("div");
    const link = document.createElement("a");
    const meta = document.createElement("div");

    date.className = "date";
    date.textContent = `[${item.date}]`;

    link.className = "link";
    link.href = "#";
    link.textContent = item.text;

    meta.className = "meta";
    meta.textContent = item.meta ?? daysAgo(item.date);

    li.append(date, link, meta);
    list.appendChild(li);
  });
}

function tintIcons() {
  const colors = [
    ["#ffd166", "#8f5200"],
    ["#ef476f", "#5d102b"],
    ["#06d6a0", "#0a3b2f"],
    ["#118ab2", "#0c2e40"],
    ["#f2e94e", "#574c00"],
    ["#c77dff", "#3a1b5d"],
    ["#ff9b85", "#531f10"],
  ];

  document.querySelectorAll(".item").forEach((item, idx) => {
    const pair = colors[idx % colors.length];
    item.style.background = `radial-gradient(circle at 40% 35%, ${pair[0]}, ${pair[1]} 65%, #0a0a0a 85%)`;
  });
}

buildList(registryItems, "#registry-list");
buildList(experienceItems, "#experience-list");
tintIcons();
