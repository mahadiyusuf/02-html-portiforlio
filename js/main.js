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
 * Sets the footer copyright year to the current year.
 */
const initFooterYear = () => {
  const currentYear = document.querySelector("#current-year");
  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }
};

/**
 * Validates signups, prevents duplicate emails, and stores successful entries.
 */
const initSignupForm = () => {
  const signupForm = document.querySelector("#signup-form");
  const formFeedback = document.querySelector("#form-feedback");

  if (!signupForm || !formFeedback) {
    return;
  }

  const nameInput = signupForm.querySelector("#full-name");
  const emailInput = signupForm.querySelector("#email");
  const planInput = signupForm.querySelector("#service");
  const termsInput = signupForm.querySelector("#terms");
  const signupFields = [
    {
      input: nameInput,
      error: signupForm.querySelector("#name-error"),
      validate: () => nameInput.value.trim().length >= 2
        ? ""
        : "Enter a name with at least 2 characters.",
    },
    {
      input: emailInput,
      error: signupForm.querySelector("#email-error"),
      validate: () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailInput.value.trim())
        ? ""
        : "Enter a valid email address.",
    },
    {
      input: planInput,
      error: signupForm.querySelector("#plan-error"),
      validate: () => planInput.value
        ? ""
        : "Choose a plan or service.",
    },
    {
      input: termsInput,
      error: signupForm.querySelector("#terms-error"),
      validate: () => termsInput.checked
        ? ""
        : "Please agree to be contacted.",
    },
  ];

  if (signupFields.some((field) => !field.input || !field.error)) {
    console.error("The signup form is missing a required field or error message.");
    return;
  }

  const setFieldError = (field, message) => {
    field.error.textContent = message;
    field.input.setAttribute("aria-invalid", String(Boolean(message)));
  };

  signupFields.forEach((field) => {
    const clearIfValid = () => {
      if (field.input.getAttribute("aria-invalid") === "true") {
        setFieldError(field, field.validate());
      }
      formFeedback.textContent = "";
      formFeedback.classList.remove("is-error");
    };

    field.input.addEventListener("input", clearIfValid);
    field.input.addEventListener("change", clearIfValid);
  });

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formFeedback.classList.remove("is-error");
    formFeedback.textContent = "";

    let isValid = true;
    signupFields.forEach((field) => {
      const error = field.validate();
      setFieldError(field, error);
      if (error) {
        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }

    const email = emailInput.value.trim();
    let signups;

    try {
      const savedSignups = localStorage.getItem("signups");
      signups = savedSignups ? JSON.parse(savedSignups) : [];
      if (!Array.isArray(signups)) {
        throw new TypeError('The "signups" localStorage entry must be an array.');
      }
    } catch (error) {
      console.error("Unable to read signup records from localStorage.", error);
      formFeedback.textContent = "We couldn't check existing signups. Please try again.";
      formFeedback.classList.add("is-error");
      return;
    }

    const emailExists = signups.some(
      (signup) => typeof signup?.email === "string"
        && signup.email.trim().toLowerCase() === email.toLowerCase(),
    );

    if (emailExists) {
      formFeedback.textContent = "You've already signed up";
      formFeedback.classList.add("is-error");
      return;
    }

    const signup = {
      name: nameInput.value.trim(),
      email,
      plan: planInput.value,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("signups", JSON.stringify([...signups, signup]));
    } catch (error) {
      console.error("Unable to save signup to localStorage.", error);
      formFeedback.textContent = "We couldn't save your signup. Please try again.";
      formFeedback.classList.add("is-error");
      return;
    }

    signupForm.reset();
    signupFields.forEach((field) => setFieldError(field, ""));
    formFeedback.textContent = `Thanks, ${signup.name}! Your signup was successful.`;
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
  initFooterYear();
  initSignupForm();
};

document.addEventListener("DOMContentLoaded", init, { once: true });
