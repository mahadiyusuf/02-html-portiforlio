"use strict";

const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = themeToggle?.querySelector(".theme-toggle__icon");
const themeLabel = themeToggle?.querySelector(".sr-only");
const themeMeta = document.querySelector('meta[name="theme-color"]');
const themeStorageKey = "na-manzo-theme";

function readSavedTheme() {
  try {
    const savedTheme = localStorage.getItem(themeStorageKey);
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : null;
  } catch (error) {
    console.warn("Unable to read the saved color theme.", error);
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch (error) {
    console.warn("Unable to save the selected color theme.", error);
  }
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = theme;

  if (themeToggle && themeIcon && themeLabel) {
    const label = isDark ? "Switch to light mode" : "Switch to dark mode";
    themeToggle.setAttribute("aria-label", label);
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.title = label;
    themeIcon.textContent = isDark ? "☀" : "☾";
    themeLabel.textContent = label;
  }

  if (themeMeta) {
    themeMeta.content = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-theme-color")
      .trim();
  }
}

const savedTheme = readSavedTheme();
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });
}

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.querySelector(".sr-only").textContent = isExpanded
      ? "Open navigation menu"
      : "Close navigation menu";
    primaryNav.classList.toggle("is-open", !isExpanded);
  });

  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.querySelector(".sr-only").textContent = "Open navigation menu";
      primaryNav.classList.remove("is-open");
    });
  });
}

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    const answer = document.getElementById(button.getAttribute("aria-controls"));

    if (!answer) {
      return;
    }

    button.setAttribute("aria-expanded", String(!expanded));
    answer.hidden = expanded;
  });
});

const billingNote = document.querySelector("#billing-note");
document.querySelectorAll(".billing-option").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".billing-option").forEach((option) => {
      const selected = option === button;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });

    if (billingNote) {
      const period = button.dataset.billing === "yearly" ? "Yearly" : "Monthly";
      billingNote.textContent =
        `${period} preview selected — prices remain one-time project estimates.`;
    }
  });
});

const currentYear = document.querySelector("#current-year");
if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

const quoteForm = document.querySelector("#quote-form");
const formFeedback = document.querySelector("#form-feedback");

if (quoteForm && formFeedback) {
  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formFeedback.classList.remove("is-error");

    if (!quoteForm.reportValidity()) {
      formFeedback.textContent = "Please complete all required fields with valid information.";
      formFeedback.classList.add("is-error");
      return;
    }

    const formData = new FormData(quoteForm);
    const fullName = String(formData.get("fullName")).trim();
    formFeedback.textContent =
      `Thanks, ${fullName}. Your details are valid. This demo form does not send enquiries, so please email yusufmahadi54@gmail.com or call 0813 192 3393 to complete your request.`;
  });
}
