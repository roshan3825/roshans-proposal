// ===============================
// ROSHAN'S PROPOSAL WEBSITE JS
// ===============================

const cfg = window.PROPOSAL_CONFIG || {};
const endpoint = cfg.formspreeEndpoint || "";

const $ = (id) => document.getElementById(id);

function save(key, value) {
  localStorage.setItem(`rp_${key}`, value);
}

function load(key, fallback = "") {
  return localStorage.getItem(`rp_${key}`) || fallback;
}

// ===============================
// Floating Petals
// ===============================

function spawnPetal() {
  const petal = document.createElement("div");
  petal.className = "petal";
  petal.textContent = Math.random() > 0.5 ? "♥" : "♡";

  petal.style.left = Math.random() * 100 + "vw";
  petal.style.animationDuration = 5 + Math.random() * 5 + "s";
  petal.style.fontSize = 14 + Math.random() * 18 + "px";

  document.body.appendChild(petal);

  setTimeout(() => {
    petal.remove();
  }, 10000);
}

setInterval(spawnPetal, 900);

// ===============================
// Home Page: Moving No Button
// ===============================

function moveNoButton() {
  const btn = $("noBtn");
  const card = document.querySelector(".glass-card");

  if (!btn || !card) return;

  const rect = card.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();

  const x = Math.max(14, Math.random() * (rect.width - btnRect.width - 30));
  const y = Math.max(80, Math.random() * (rect.height - btnRect.height - 30));

  btn.style.position = "absolute";
  btn.style.left = x + "px";
  btn.style.top = y + "px";

  const funnyTexts = [
    "No 🙈",
    "Catch me first",
    "Are you sure?",
    "Nope 😌",
    "Try Yes ❤️"
  ];

  btn.textContent = funnyTexts[Math.floor(Math.random() * funnyTexts.length)];
}

function setupHome() {
  const noBtn = $("noBtn");
  const yesBtn = $("yesBtn");

  if (noBtn) {
    noBtn.addEventListener("mouseenter", moveNoButton);
    noBtn.addEventListener("mouseover", moveNoButton);

    noBtn.addEventListener("touchstart", (event) => {
      event.preventDefault();
      moveNoButton();
    });

    noBtn.addEventListener("click", (event) => {
      event.preventDefault();
      moveNoButton();
    });
  }

  if (yesBtn) {
    yesBtn.addEventListener("click", () => {
      save("answer", "Yes");
      window.location.href = "cuisine.html";
    });
  }
}

// ===============================
// Cuisine Page
// ===============================

function setupCuisine() {
  const cards = document.querySelectorAll(".option-card");
  const custom = $("customCuisine");
  const next = $("toAvailability");
  const status = $("statusText");

  if (!cards.length && !custom && !next) return;

  let selected = load("cuisine", "");

  cards.forEach((card) => {
    const cuisine = card.dataset.cuisine || card.textContent.trim();

    if (cuisine === selected) {
      card.classList.add("selected");
    }

    card.addEventListener("click", () => {
      cards.forEach((item) => item.classList.remove("selected"));
      card.classList.add("selected");

      selected = cuisine;
      save("cuisine", selected);

      if (custom) {
        custom.value = "";
      }

      if (status) {
        status.textContent = "";
      }
    });
  });

  if (custom) {
    custom.addEventListener("input", () => {
      const typedCuisine = custom.value.trim();

      if (typedCuisine) {
        cards.forEach((item) => item.classList.remove("selected"));
        selected = typedCuisine;
        save("cuisine", selected);
      }
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      const typedCuisine = custom ? custom.value.trim() : "";

      if (typedCuisine) {
        selected = typedCuisine;
        save("cuisine", selected);
      }

      if (!selected) {
        if (status) {
          status.textContent = "Please choose a cuisine first.";
        }
        return;
      }

      save("cuisine", selected);
      window.location.href = "availability.html";
    });
  }
}

// ===============================
// Availability Page
// ===============================

function setupAvailability() {
  const date = $("dateInput");
  const time = $("timeInput");
  const note = $("noteInput");
  const next = $("toReview");
  const status = $("statusText");

  if (!date && !time && !note && !next) return;

  if (date) {
    date.value = load("date", "");
  }

  if (time) {
    time.value = load("time", "");
  }

  if (note) {
    note.value = load("note", "");
  }

  if (next) {
    next.addEventListener("click", () => {
      if (!date.value || !time.value) {
        if (status) {
          status.textContent = "Please choose both date and time.";
        }
        return;
      }

      save("date", date.value);
      save("time", time.value);
      save("note", note.value.trim() || "No note");

      window.location.href = "review.html";
    });
  }
}

// ===============================
// Review Page + Formspree
// ===============================

function setupReview() {
  const cuisine = load("cuisine", "Not selected");
  const date = load("date", "Not selected");
  const time = load("time", "Not selected");
  const note = load("note", "No note");

  const nameInput = $("nameInput");
  const contactInput = $("contactInput");
  const form = $("datePlanForm");
  const status = $("statusText");
  const copyBtn = $("copyPlanBtn");

  if (!form) return;

  // Summary fields
  if ($("summaryCuisine")) $("summaryCuisine").textContent = cuisine;
  if ($("summaryDate")) $("summaryDate").textContent = date;
  if ($("summaryTime")) $("summaryTime").textContent = time;
  if ($("summaryNote")) $("summaryNote").textContent = note;

  // Use Formspree endpoint from config.js
  if (endpoint && !endpoint.includes("YOUR_FORM_ID")) {
    form.action = endpoint;
  }

  function getPersonName() {
    return nameInput ? nameInput.value.trim() : "";
  }

  function getContactNumber() {
    return contactInput ? contactInput.value.trim() : "";
  }

  function buildMessage() {
    const personName = getPersonName() || "Not entered";
    const contactNumber = getContactNumber() || "Not entered";

    return `New date proposal response

Answer: Yes
Cuisine: ${cuisine}
Date: ${date}
Time: ${time}
Name: ${personName}
Contact: ${contactNumber}
Note: ${note}`;
  }

  function fillFields() {
    const personName = getPersonName();
    const contactNumber = getContactNumber();

    if ($("fsAnswer")) $("fsAnswer").value = "Yes";
    if ($("fsCuisine")) $("fsCuisine").value = cuisine;
    if ($("fsDate")) $("fsDate").value = date;
    if ($("fsTime")) $("fsTime").value = time;
    if ($("fsName")) $("fsName").value = personName;
    if ($("fsContact")) $("fsContact").value = contactNumber;
    if ($("fsNote")) $("fsNote").value = note;
    if ($("fsMessage")) $("fsMessage").value = buildMessage();

    if ($("summaryName")) {
      $("summaryName").textContent = personName || "Not entered";
    }

    if ($("summaryContact")) {
      $("summaryContact").textContent = contactNumber || "Not entered";
    }
  }

  if (nameInput) {
    nameInput.addEventListener("input", fillFields);
  }

  if (contactInput) {
    contactInput.addEventListener("input", fillFields);
  }

  fillFields();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    fillFields();

    const personName = getPersonName();
    const contactNumber = getContactNumber();

    if (!personName) {
      if (status) {
        status.textContent = "Please enter your name.";
      }
      return;
    }

    if (!contactNumber) {
      if (status) {
        status.textContent = "Please enter a contact number.";
      }
      return;
    }

    if (!endpoint || endpoint.includes("YOUR_FORM_ID")) {
      if (status) {
        status.textContent = "Add your Formspree endpoint in config.js first.";
      }
      return;
    }

    if (status) {
      status.textContent = "Sending...";
    }

    const data = new FormData(form);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Formspree submission failed");
      }

      window.location.href = "success.html";
    } catch (error) {
      if (status) {
        status.textContent =
          "Could not send. Check your Formspree endpoint and internet connection.";
      }
    }
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      fillFields();

      try {
        await navigator.clipboard.writeText(buildMessage());

        if (status) {
          status.textContent = "Date plan copied.";
        }
      } catch (error) {
        if (status) {
          status.textContent = buildMessage();
        }
      }
    });
  }
}

// ===============================
// Init
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  setupHome();
  setupCuisine();
  setupAvailability();
  setupReview();
});