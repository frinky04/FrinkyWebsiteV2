function buildShell() {
  const app = document.getElementById("app");
  const tpl = document.getElementById("page-content");
  if (!app || !tpl) return;

  const page = document.createElement("div");
  page.className = "page";

  const frame = document.createElement("div");
  frame.className = "frame";

  const inner = document.createElement("div");
  inner.className = "inner";
  inner.id = "top";

  const header = document.createElement("header");
  header.className = "top";
  header.innerHTML = `
    <div>
      <div class="title">Title</div>
    </div>
    <div class="year"></div>
  `;

  const navBox = document.createElement("section");
  navBox.className = "nav-box";
  navBox.innerHTML = `<div class="nav">nav</div>`;

  const slot = document.createElement("div");
  slot.className = "content-slot";
  slot.appendChild(tpl.content.cloneNode(true));

  inner.append(header, navBox, slot);
  frame.appendChild(inner);
  page.appendChild(frame);

  app.replaceChildren(page);

  document.dispatchEvent(new CustomEvent("layout:ready"));
}

document.addEventListener("DOMContentLoaded", buildShell);
