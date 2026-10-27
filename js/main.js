"use strict";

/**
 * Sets up the mobile navigation and its keyboard dismissal behavior.
 */
const initMobileMenu = () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const primaryNav = document.querySelector("#primary-nav");

  if (!menuToggle || !primaryNav) {
    return;
  }

  const setMenuOpen = (isOpen) => {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.querySelector(".sr-only").textContent = isOpen
      ? "Close navigation menu"
      : "Open navigation menu";
    primaryNav.classList.toggle("is-open", isOpen);
  };

  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
};

/**
 * Animates FAQ panels and ensures that at most one answer is open.
 */
const initAccordion = () => {
  const questions = document.querySelectorAll(".faq-question");

  questions.forEach((question) => {
    const panel = document.getElementById(question.getAttribute("aria-controls"));

    if (!panel) {
      return;
    }

    panel.hidden = question.getAttribute("aria-expanded") !== "true";
    panel.style.height = panel.hidden ? "0px" : "auto";

    panel.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "height") {
        return;
      }

      if (question.getAttribute("aria-expanded") === "true") {
        panel.style.height = "auto";
      } else {
        panel.hidden = true;
      }
    });

    question.addEventListener("click", () => {
      const shouldOpen = question.getAttribute("aria-expanded") !== "true";

      if (shouldOpen) {
        questions.forEach((otherQuestion) => {
          if (otherQuestion === question) {
            return;
          }

          const otherPanel = document.getElementById(
            otherQuestion.getAttribute("aria-controls"),
          );
          if (otherPanel && otherQuestion.getAttribute("aria-expanded") === "true") {
            otherQuestion.setAttribute("aria-expanded", "false");
            otherPanel.style.height = `${otherPanel.scrollHeight}px`;
            void otherPanel.offsetHeight;
            otherPanel.style.height = "0px";
          }
        });
      }

      question.setAttribute("aria-expanded", String(shouldOpen));
      if (shouldOpen) {
        panel.hidden = false;
        panel.style.height = "0px";
        void panel.offsetHeight;
        panel.style.height = `${panel.scrollHeight}px`;
      } else {
        panel.style.height = `${panel.scrollHeight}px`;
        void panel.offsetHeight;
        panel.style.height = "0px";
      }
    });
  });
};

/**
 * Changes package prices and captions for monthly or yearly billing.
 */
const initPricingToggle = () => {
  const options = document.querySelectorAll(".billing-option");
  const prices = document.querySelectorAll(".price[data-monthly][data-yearly]");
  const billingNote = document.querySelector("#billing-note");
  const savingsBadge = document.querySelector(".billing-savings");

  if (options.length === 0 || prices.length === 0) {
    return;
  }

  const updatePrices = (period) => {
    options.forEach((option) => {
      const selected = option.dataset.billing === period;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });

    prices.forEach((price) => {
      const amount = price.querySelector(".price-amount");
      const value = Number(price.dataset[period]);

      if (!amount || !Number.isFinite(value)) {
        console.error("Pricing element is missing a valid amount for", period, price);
        return;
      }

      amount.textContent = new Intl.NumberFormat("en-NG").format(value);
      const caption = price.parentElement.querySelector(".price-caption");
      if (caption) {
        caption.textContent = period === "yearly"
          ? "per month, billed yearly"
          : "per month, billed monthly";
      }
    });

    if (savingsBadge) {
      savingsBadge.hidden = period !== "yearly";
    }
    if (billingNote) {
      billingNote.textContent = period === "yearly"
        ? "Yearly billing is shown as a monthly equivalent."
        : "Choose yearly billing to save 20%.";
    }
  };

  options.forEach((option) => {
    option.addEventListener("click", () => {
      updatePrices(option.dataset.billing === "yearly" ? "yearly" : "monthly");
    });
  });

  updatePrices(
    document.querySelector('.billing-option[aria-pressed="true"]')?.dataset.billing === "yearly"
      ? "yearly"
      : "monthly",
  );
};

/**
 * Adds a shadow to the sticky header after the page scrolls.
 */
const initHeaderShadow = () => {
  const header = document.querySelector(".site-header");

  if (!header) {
    return;
  }

  const updateHeaderShadow = () => {
    header.classList.toggle("site-header--scrolled", window.scrollY > 10);
  };

  window.addEventListener("scroll", updateHeaderShadow, { passive: true });
  updateHeaderShadow();
};

/**
 * Applies the saved color theme, falling back to the system preference.
 */
const initThemeToggle = () => {
  const themeToggle = document.querySelector(".theme-toggle");
  const themeIcon = themeToggle?.querySelector(".theme-toggle__icon");
  const themeLabel = themeToggle?.querySelector(".sr-only");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const themeStorageKey = "na-manzo-theme";
  let savedTheme = null;

  try {
    const storedTheme = localStorage.getItem(themeStorageKey);
    savedTheme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : null;
  } catch (error) {
    console.warn("Unable to read the saved color theme.", error);
  }

  const applyTheme = (theme) => {
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
  };

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

  themeToggle?.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);

    try {
      localStorage.setItem(themeStorageKey, nextTheme);
    } catch (error) {
      console.warn("Unable to save the selected color theme.", error);
    }
  });
};

/**
 * Updates the copyright year and handles the demo quote form.
 */
const initFooterYearAndQuoteForm = () => {
  const currentYear = document.querySelector("#current-year");
  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  const quoteForm = document.querySelector("#quote-form");
  const formFeedback = document.querySelector("#form-feedback");

  if (!quoteForm || !formFeedback) {
    return;
  }

  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formFeedback.classList.remove("is-error");

    if (!quoteForm.reportValidity()) {
      formFeedback.textContent =
        "Please complete all required fields with valid information.";
      formFeedback.classList.add("is-error");
      return;
    }

    const formData = new FormData(quoteForm);
    const fullName = String(formData.get("fullName")).trim();
    formFeedback.textContent =
      `Thanks, ${fullName}. Your details are valid. This demo form does not send enquiries, so please email yusufmahadi54@gmail.com or call 0813 192 3393 to complete your request.`;
  });
};

/**
 * Initializes all page interactions after the document has loaded.
 */
const init = () => {
  initThemeToggle();
  initMobileMenu();
  initAccordion();
  initPricingToggle();
  initHeaderShadow();
  initFooterYearAndQuoteForm();
};

document.addEventListener("DOMContentLoaded", init, { once: true });
