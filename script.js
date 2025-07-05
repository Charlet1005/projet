// 🔐 Vérifie la connexion
if (window.location.pathname.includes("index.html") && localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
}

// 🔓 Déconnexion
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
  });
}

// 🔐 Connexion depuis login.html
if (window.location.pathname.includes("login.html")) {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
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

// 🌗 Thème clair / sombre
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

// 📝 Formulaire d’écriture avec catégorie (index.html)
const categoryForm = document.getElementById("entry-form");
if (categoryForm && document.getElementById("category")) {
  categoryForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const category = document.getElementById("category").value;
    const text = document.getElementById("entry-text").value;

    if (!category || !text) return;

    const entry = {
      date: new Date(),
      text: text
    };

    const allEntries = JSON.parse(localStorage.getItem(category) || "[]");
    allEntries.unshift(entry);
    localStorage.setItem(category, JSON.stringify(allEntries));
    categoryForm.reset();
    alert(`Entrée enregistrée dans la catégorie "${category}"`);
  });
}

// 🔍 Affichage aperçu par catégorie (dashboard)
const previewCategories = ["famille", "hobbies", "medical", "pro"];
previewCategories.forEach(cat => {
  const container = document.querySelector(`#preview-${cat} .preview-list`);
  if (!container) return;

  const data = JSON.parse(localStorage.getItem(cat) || "[]");
  const latest = data.slice(0, 2);
  latest.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${new Date(entry.date).toLocaleDateString()} - ${entry.text}`;
    container.appendChild(li);
  });
});

// header
function adjustPaddingTop() {
  const header = document.querySelector("header");
  if (header) {
    const height = header.offsetHeight;
    document.body.style.paddingTop = height + "px";
  }
}

window.addEventListener("load", adjustPaddingTop);
window.addEventListener("resize", adjustPaddingTop);
