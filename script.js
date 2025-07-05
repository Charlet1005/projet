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
    document.getElementById("login-form").addEventListener("submit", (e) => {
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
      text: html,
      author: localStorage.getItem("username") || "Anonyme"
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
    li.innerHTML = `<strong>${date.toLocaleDateString()} à ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong><br>
    <em>Par ${entry.author || "?"}</em><br>
    ${entry.text}
    `;
    // 👇 Si l'auteur est le même que l'utilisateur connecté, on ajoute les boutons
  if (entry.author === currentUser) {
    const actions = document.createElement("div");
    actions.style.marginTop = "0.5rem";

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️ Modifier";
    editBtn.addEventListener("click", () => {
      editEntry(cat, index, entry);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️ Supprimer";
    deleteBtn.addEventListener("click", () => {
      deleteEntry(cat, index);
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(actions);
    }
    container.appendChild(li);
  });
});

// Del une entrée
function deleteEntry(category, index) {
  const entries = JSON.parse(localStorage.getItem(category) || "[]");
  if (confirm("Confirmer la suppression ?")) {
    entries.splice(index, 1);
    localStorage.setItem(category, JSON.stringify(entries));
    location.reload(); // recharge la page
  }
}

function editEntry(category, index, entry) {
  // recharge le contenu dans l’éditeur
  document.getElementById("category").value = category;
  quill.root.innerHTML = entry.text;

  // Mettre à jour à la place de créer une nouvelle entrée
  const form = document.getElementById("entry-form");
  form.removeEventListener("submit", handleSubmit); // éviter conflit

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
}

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
      li.innerHTML = `
        <strong>${date.toLocaleDateString()} à ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong><br>
        <em>par ${entry.author || "Anonyme"}</em><br>
        ${entry.text}
      `;
      ul.appendChild(li);
    });
  }
}

const user = localStorage.getItem("username");
if (user) {
  document.getElementById("logged-user").textContent = `👤 ${user}`;
}

// === INSCRIPTION ===
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
