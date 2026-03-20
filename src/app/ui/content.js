import { yearsAgo } from "../date.js";
import { withExternalLinkAttrs } from "./helpers.js";

export function renderHomeIntro(model) {
  const homeIntroEl = document.querySelector("#home-intro-content");
  if (!homeIntroEl) return;

  homeIntroEl.innerHTML = withExternalLinkAttrs(model.home?.contentHtml || "");
}

export function renderAbout(model) {
  const about = model.about || {};
  const aboutAvatar = document.querySelector(".about-avatar");
  const aboutImage = document.querySelector("#about-image");
  const aboutNameEl = document.querySelector("#about-name");
  const aboutContentEl = document.querySelector("#about-content");
  const aboutAgeEl = document.querySelector("#about-age");

  if (aboutAvatar && about.imageAlt) {
    aboutAvatar.setAttribute("aria-label", about.imageAlt);
  }

  if (aboutImage) {
    aboutImage.src = about.image || "/images/frog.png";
    aboutImage.alt = about.imageAlt || "";
  }

  if (aboutNameEl) aboutNameEl.textContent = about.name || "";
  if (aboutContentEl) aboutContentEl.innerHTML = withExternalLinkAttrs(about.contentHtml || "");
  if (aboutAgeEl) {
    const birthDate = String(about.birthDate || "").trim();
    if (birthDate) {
      const age = yearsAgo(birthDate);
      aboutAgeEl.textContent = age !== null ? `${birthDate} (age ${age})` : birthDate;
    }
  }
}

export function setupContactActions() {
  const emailBtn = document.querySelector("[data-action='copy-email']");
  if (!emailBtn) return;

  const email = emailBtn.dataset.email || "";
  const metaEl = document.querySelector(".contact-email-meta");
  const originalLabel = emailBtn.textContent || "Copy";

  const setFeedback = (text) => {
    emailBtn.textContent = text;
    setTimeout(() => {
      emailBtn.textContent = originalLabel;
    }, 1500);
  };

  emailBtn.addEventListener("click", async () => {
    if (!email) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = email;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setFeedback("Copied!");
    } catch {
      setFeedback("Failed");
    }
  });
}
