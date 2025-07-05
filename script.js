// === AUTHENTIFICATION ===
if (window.location.pathname.includes("index.html") && localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
}

const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    window.location.href = "login.html";
  });
}

if (window.location.pathname.includes("login.html")) {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;
      const users = JSON.parse(localStorage.getItem("users") || "{}");

      if (users[username] && users[username].password === password) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        window.location.href = "index.html";
      } else {
        document.getElementById("login-error").textContent = "Identifiants incorrects.";
      }
    });
  }
}

if (window.location.pathname.includes("register.html")) {
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("new-username").value.trim();
      const password = document.getElementById("new-password").value;
      const error = document.getElementById("register-error");

      if (!username || !password) {
        error.textContent = "Veuillez remplir tous les champs.";
        return;
      }

      const users = JSON.parse(localStorage.getItem("users") || "{}");
      if (users[username]) {
        error.textContent = "Ce nom d'utilisateur existe déjà.";
        return;
      }

      users[username] = { password };
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", username);
      window.location.href = "index.html";
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
if (notifClose) {
  notifClose.addEventListener("click", () => {
    notif.style.display = "none";
  });
}

// === EDITEUR + FORMULAIRE DE SOUMISSION ===
let quill;

if (document.getElementById("editor-container")) {
  quill = new Quill('#editor-container', {
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

  // === PRÉVIEW EN TEMPS RÉEL AVEC IMAGES REDIMENSIONNÉES ===
  const preview = document.getElementById("preview");
  quill.on('text-change', () => {
    if (preview) {
      preview.innerHTML = quill.root.innerHTML;
      preview.querySelectorAll("img").forEach(img => {
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.display = "block";
        img.style.margin = "1rem auto";
        img.style.borderRadius = "6px";
      });
    }
  });

  // === FORMULAIRE DE PUBLICATION ===
  const categoryForm = document.getElementById("entry-form");
  if (categoryForm) {
    categoryForm.addEventListener("submit", function handleSubmit(e) {
      e.preventDefault();

      const category = document.getElementById("category").value;
      const html = quill.root.innerHTML;
      document.getElementById("entry-text").value = html;

      if (!category || !html.trim()) return;

      const entry = {
        date: new Date(),
        text: html,
        author: localStorage.getItem("username") || "Anonyme"
      };

      const entries = JSON.parse(localStorage.getItem(category) || "[]");
      entries.unshift(entry);
      localStorage.setItem(category, JSON.stringify(entries));

      sauvegarderVersGoogleSheet(entry);

      categoryForm.reset();
      quill.root.innerHTML = "";
      if (preview) preview.innerHTML = "";

      showNotification(`✅ Enregistré dans "${category}"`);
    });
  }

  // === SUPPRIMER UNE ENTRÉE ===
  window.deleteEntry = function (category, index) {
    const entries = JSON.parse(localStorage.getItem(category) || "[]");
    if (confirm("Confirmer la suppression ?")) {
      entries.splice(index, 1);
      localStorage.setItem(category, JSON.stringify(entries));
      location.reload();
    }
  };

  // === MODIFIER UNE ENTRÉE ===
  window.editEntry = function (category, index, entry) {
    document.getElementById("category").value = category;
    quill.root.innerHTML = entry.text;

    const form = document.getElementById("entry-form");
    form.addEventListener("submit", function handleEdit(e) {
      e.preventDefault();

      const updatedText = quill.root.innerHTML;
      entry.text = updatedText;
      entry.date = new Date();

      const entries = JSON.parse(localStorage.getItem(category) || "[]");
      entries[index] = entry;
      localStorage.setItem(category, JSON.stringify(entries));

      alert("Article modifié !");
      location.reload();
    }, { once: true });
  };
}

// === DASHBOARD - DERNIÈRES ENTRÉES ===
const previewCategories = ["famille", "hobbies", "medical", "pro"];
previewCategories.forEach(cat => {
  const container = document.querySelector(`#preview-${cat} .preview-list`);
  if (!container) return;

  const data = JSON.parse(localStorage.getItem(cat) || "[]");
  const currentUser = localStorage.getItem("username");
  const latest = data.slice(0, 2);

  latest.forEach((entry, index) => {
    const date = new Date(entry.date);
    const li = document.createElement("li");
    li.innerHTML = `<strong>${date.toLocaleDateString()} à ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong><br>
    <em>Par ${entry.author || "?"}</em><br>
    ${entry.text}`;

    if (entry.author === currentUser) {
      const actions = document.createElement("div");
      actions.style.marginTop = "0.5rem";

      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️ Modifier";
      editBtn.addEventListener("click", () => editEntry(cat, index, entry));

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️ Supprimer";
      deleteBtn.addEventListener("click", () => deleteEntry(cat, index));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      li.appendChild(actions);
    }

    container.appendChild(li);
  });
});

// === AFFICHER UTILISATEUR CONNECTÉ ===
const user = localStorage.getItem("username");
if (user) {
  const userDisplay = document.getElementById("logged-user");
  if (userDisplay) {
    userDisplay.textContent = `👤 ${user}`;
  }
}

// === CLEAR DATA BASE (ADMIN only) ===
const currentUser = localStorage.getItem("username");

const resetBtn = document.getElementById("clearDataBtn");
const confirmBox = document.getElementById("custom-confirm");
const confirmReset = document.getElementById("confirm-reset");
const cancelReset = document.getElementById("cancel-reset");

if (currentUser === "ADMIN") {
  if (resetBtn) resetBtn.style.display = "inline-block";

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      confirmBox.classList.remove("hidden");
    });
  }

  if (confirmReset) {
    confirmReset.addEventListener("click", () => {
      localStorage.clear();
      alert("🧹 Données supprimées !");
      location.reload();
    });
  }

  if (cancelReset) {
    cancelReset.addEventListener("click", () => {
      confirmBox.classList.add("hidden");
    });
  }
} else {
  if (resetBtn) resetBtn.style.display = "none";
}

// === EXPORT DATA ===
function sauvegarderVersGoogleSheet(entry) {
  fetch("https://script.google.com/macros/s/AKfycbyD7MKx2nUFoueiRyjLC_pOyQypLrKb9ESsB9JY-vbYA_uTdkjydox54fqprYEL7YhG/exec", {
    method: "POST",
    body: JSON.stringify(entry),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.text())
  .then(msg => console.log("Sauvegarde GSheet : ", msg))
  .catch(err => console.error("Erreur GSheet :", err));
}
