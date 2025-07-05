// === AUTHENTIFICATION ===
if (window.location.pathname.includes("index.html") && localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
}

const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
  });
}

if (window.location.pathname.includes("login.html")) {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = document.getElementById("username").value;
      const pass = document.getElementById("password").value;
      if (user === "romane" && pass === "1234") {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "index.html";
      } else {
        document.getElementById("login-error").textContent = "Identifiants incorrects.";
      }
    });
  }
}

// === THEME CLAIR / SOMBRE ===
const toggleTheme = document.getElementById("toggleTheme");
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}
if (toggleTheme) {
  toggleTheme.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const theme = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", theme);
  });
}

// === HEADER SPACING ===
function adjustPaddingTop() {
  const header = document.querySelector("header");
  if (header) {
    document.body.style.paddingTop = header.offsetHeight + "px";
  }
}
window.addEventListener("load", adjustPaddingTop);
window.addEventListener("resize", adjustPaddingTop);

// === EDITEUR QUILL ===
const quill = new Quill('#editor-container', {
  theme: 'snow',
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  }
});

// === PREVIEW EN TEMPS REEL ===
const preview = document.getElementById("preview");
quill.on('text-change', () => {
  if (preview) preview.innerHTML = quill.root.innerHTML;
});

// === NOTIFICATION ===
const notif = document.getElementById("notif");
const notifMsg = document.getElementById("notif-msg");
const notifClose = document.getElementById("notif-close");

function showNotification(message) {
  notifMsg.textContent = message;
  notif.style.display = "flex";
  setTimeout(() => {
    notif.style.display = "none";
  }, 4000);
}
notifClose.addEventListener("click", () => {
  notif.style.display = "none";
});

// === FORMULAIRE DE SOUMISSION ===
const categoryForm = document.getElementById("entry-form");
if (categoryForm) {
  categoryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const category = document.getElementById("category").value;
    const html = quill.root.innerHTML;
    document.getElementById("entry-text").value = html;

    if (!category || !html.trim()) return;

    const entry = {
      date: new Date(),
      text: html
    };

    const entries = JSON.parse(localStorage.getItem(category) || "[]");
    entries.unshift(entry);
    localStorage.setItem(category, JSON.stringify(entries));

    categoryForm.reset();
    quill.root.innerHTML = "";
    if (preview) preview.innerHTML = "";

    showNotification(`✅ Enregistré dans "${category}"`);
  });
}

// === DASHBOARD - DERNIÈRES ENTRÉES ===
const previewCategories = ["famille", "hobbies", "medical", "pro"];
previewCategories.forEach(cat => {
  const container = document.querySelector(`#preview-${cat} .preview-list`);
  if (!container) return;

  const data = JSON.parse(localStorage.getItem(cat) || "[]");
  const latest = data.slice(0, 2);
  latest.forEach(entry => {
    const date = new Date(entry.date);
    const li = document.createElement("li");
    li.innerHTML = `<strong>${date.toLocaleDateString()} à ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong><br>${entry.text}`;
    container.appendChild(li);
  });
});

  // Récupérer le nom de la catégorie depuis l’ID de la section
  const previewSection = document.querySelector(".preview-section");
  if (previewSection) {
    const id = previewSection.id.replace("preview-", "");
    const data = JSON.parse(localStorage.getItem(id) || "[]");

    const ul = previewSection.querySelector(".preview-list");
    if (ul) {
      data.forEach(entry => {
        const li = document.createElement("li");
        const date = new Date(entry.date);
        li.innerHTML = `<strong>${date.toLocaleDateString()} à ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong><br>${entry.text}`;
        ul.appendChild(li);
      });
    }
  }
