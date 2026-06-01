const cfg = window.PROPOSAL_CONFIG || {};
const endpoint = cfg.formspreeEndpoint || "";
const $ = (id) => document.getElementById(id);

function save(key, value) { localStorage.setItem(`rp_${key}`, value); }
function load(key, fallback = "") { return localStorage.getItem(`rp_${key}`) || fallback; }

function spawnPetal() {
  const p = document.createElement("div");
  p.className = "petal";
  p.textContent = Math.random() > 0.5 ? "♥" : "♡";
  p.style.left = Math.random() * 100 + "vw";
  p.style.animationDuration = 5 + Math.random() * 5 + "s";
  p.style.fontSize = 14 + Math.random() * 18 + "px";
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 10000);
}
setInterval(spawnPetal, 900);

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
  btn.textContent = ["No 🙈", "Catch me first", "Are you sure?", "Nope 😌", "Try Yes ❤️"][Math.floor(Math.random() * 5)];
}

function setupHome() {
  const noBtn = $("noBtn");
  const yesBtn = $("yesBtn");
  if (noBtn) {
    noBtn.addEventListener("mouseenter", moveNoButton);
    noBtn.addEventListener("mouseover", moveNoButton);
    noBtn.addEventListener("touchstart", (e) => { e.preventDefault(); moveNoButton(); });
    noBtn.addEventListener("click", (e) => { e.preventDefault(); moveNoButton(); });
  }
  if (yesBtn) yesBtn.addEventListener("click", () => {
    save("answer", "Yes");
    window.location.href = "cuisine.html";
  });
}

function setupCuisine() {
  const cards = document.querySelectorAll(".option-card");
  const custom = $("customCuisine");
  const next = $("toAvailability");
  const status = $("statusText");
  let selected = load("cuisine", "");

  cards.forEach(card => {
    if (card.dataset.cuisine === selected) card.classList.add("selected");
    card.addEventListener("click", () => {
      cards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selected = card.dataset.cuisine;
      if (custom) custom.value = "";
      save("cuisine", selected);
      if (status) status.textContent = "";
    });
  });

  if (custom) custom.addEventListener("input", () => {
    if (custom.value.trim()) {
      cards.forEach(c => c.classList.remove("selected"));
      selected = custom.value.trim();
      save("cuisine", selected);
    }
  });

  if (next) next.addEventListener("click", () => {
    if (custom && custom.value.trim()) selected = custom.value.trim();
    if (!selected) {
      status.textContent = "Please choose a cuisine first.";
      return;
    }
    save("cuisine", selected);
    window.location.href = "availability.html";
  });
}

function setupAvailability() {
  const date = $("dateInput");
  const time = $("timeInput");
  const note = $("noteInput");
  const next = $("toReview");
  const status = $("statusText");

  if (date) date.value = load("date", "");
  if (time) time.value = load("time", "");
  if (note) note.value = load("note", "");

  if (next) next.addEventListener("click", () => {
    if (!date.value || !time.value) {
      status.textContent = "Please choose both date and time.";
      return;
    }
    save("date", date.value);
    save("time", time.value);
    save("note", note.value.trim() || "No note");
    window.location.href = "review.html";
  });
}

function setupReview() {
  const cuisine = load("cuisine", "Not selected");
  const date = load("date", "Not selected");
  const time = load("time", "Not selected");
  const note = load("note", "No note");
  const contact = $("contactInput");
  const form = $("datePlanForm");
  const status = $("statusText");
  const copyBtn = $("copyPlanBtn");

  if ($("summaryCuisine")) $("summaryCuisine").textContent = cuisine;
  if ($("summaryDate")) $("summaryDate").textContent = date;
  if ($("summaryTime")) $("summaryTime").textContent = time;
  if ($("summaryNote")) $("summaryNote").textContent = note;

  function message() {
    return `New date proposal response\n\nAnswer: Yes\nCuisine: ${cuisine}\nDate: ${date}\nTime: ${time}\nContact: ${contact ? contact.value.trim() : ""}\nNote: ${note}`;
  }

  function fillFields() {
    const c = contact ? contact.value.trim() : "";
    if ($("fsAnswer")) $("fsAnswer").value = "Yes";
    if ($("fsCuisine")) $("fsCuisine").value = cuisine;
    if ($("fsDate")) $("fsDate").value = date;
    if ($("fsTime")) $("fsTime").value = time;
    if ($("fsContact")) $("fsContact").value = c;
    if ($("fsNote")) $("fsNote").value = note;
    if ($("fsMessage")) $("fsMessage").value = message();
    if ($("summaryContact")) $("summaryContact").textContent = c || "Not entered";
  }

  if (contact) contact.addEventListener("input", fillFields);
  fillFields();

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      fillFields();

      if (!contact.value.trim()) {
        status.textContent = "Please enter a contact number.";
        return;
      }
      if (!endpoint || endpoint.includes("YOUR_FORM_ID")) {
        status.textContent = "Add your Formspree endpoint in config.js first.";
        return;
      }

      status.textContent = "Sending...";
      const data = new FormData(form);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: data,
          headers: { "Accept": "application/json" }
        });
        if (!res.ok) throw new Error("Formspree submission failed");
        window.location.href = "success.html";
      } catch (err) {
        status.textContent = "Could not send. Check your Formspree endpoint and internet connection.";
      }
    });
  }

  if (copyBtn) copyBtn.addEventListener("click", async () => {
    fillFields();
    try {
      await navigator.clipboard.writeText(message());
      status.textContent = "Date plan copied.";
    } catch {
      status.textContent = message();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupHome();
  setupCuisine();
  setupAvailability();
  setupReview();
});
