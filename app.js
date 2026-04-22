import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2NDQKWTiAKr5UITDNeYu3Whz2v1xh_aE",
  authDomain: "modelagem-de-dados-5ab71.firebaseapp.com",
  databaseURL: "https://modelagem-de-dados-5ab71-default-rtdb.firebaseio.com",
  projectId: "modelagem-de-dados-5ab71",
  storageBucket: "modelagem-de-dados-5ab71.firebasestorage.app",
  messagingSenderId: "374007017801",
  appId: "1:374007017801:web:ae6a1090d63d8f66852a98"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const pagina = window.location.pathname;
const naDashboard = pagina.includes("dashboard");

if (!naDashboard) {
  const btnLogin     = document.getElementById("btn-login");
  const btnCadastrar = document.getElementById("btn-cadastrar");
  const mensagem     = document.getElementById("mensagem");

  btnCadastrar.addEventListener("click", async () => {
    const email = document.getElementById("cad-email").value;
    const senha = document.getElementById("cad-senha").value;
    const cargo = document.getElementById("cad-cargo").value;

    if (!email || !senha) {
      mensagem.textContent = "Preencha e-mail e senha.";
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      const uid  = cred.user.uid;

      await set(ref(db, `users/${uid}`), {
        email: email,
        cargo: cargo,
        criadoEm: new Date().toISOString()
      });

      if (cargo === "admin") {
        await set(ref(db, `admin-data/${uid}`), {
          email: email,
          nivelAcesso: "total",
          criadoEm: new Date().toISOString()
        });
      }

      mensagem.style.color = "#AB4D26";
      mensagem.textContent = "Conta criada com sucesso! Fazendo login...";
      setTimeout(() => window.location.href = "dashboard.html", 1200);

    } catch (erro) {
      mensagem.style.color = "#e53935";
      if (erro.code === "auth/email-already-in-use") {
        mensagem.textContent = "Este e-mail já está cadastrado.";
      } else if (erro.code === "auth/weak-password") {
        mensagem.textContent = "Senha muito fraca. Use pelo menos 6 caracteres.";
      } else {
        mensagem.textContent = "Erro: " + erro.message;
      }
    }
  });

  btnLogin.addEventListener("click", async () => {
    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-senha").value;

    if (!email || !senha) {
      mensagem.textContent = "Preencha e-mail e senha.";
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      window.location.href = "dashboard.html";
    } catch (erro) {
      mensagem.style.color = "#e53935";
      if (erro.code === "auth/invalid-credential") {
        mensagem.textContent = "E-mail ou senha incorretos.";
      } else {
        mensagem.textContent = "Erro: " + erro.message;
      }
    }
  });
}

if (naDashboard) {
  onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
      window.location.href = "index.html";
      return;
    }

    const snap = await get(ref(db, `users/${usuario.uid}`));
    const dados = snap.val();
    const cargo = dados?.cargo || "user";

    document.getElementById("info-email").textContent = usuario.email;
    document.getElementById("info-cargo").textContent =
      cargo === "admin" ? "Administrador (Admin)" : "Usuário comum (User)";

    document.getElementById("btn-sair").addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });

    const tabsEl = document.getElementById("tabs-cargo");
    const gridEl = document.getElementById("grid-cards");

    const acessos = {
      "Dados do Usuário": [
        { label: "Ver perfil",     admin: true,  user: true  },
        { label: "Editar perfil",  admin: true,  user: true  },
        { label: "Ver histórico",  admin: true,  user: false },
      ],
      "Área Admin": [
        { label: "Ver todos usuários", admin: true, user: false },
        { label: "Relatórios",         admin: true, user: false },
        { label: "Configurações",      admin: true, user: false },
      ]
    };

    function renderCards(cargoAtivo) {
      gridEl.innerHTML = "";
      for (const [titulo, itens] of Object.entries(acessos)) {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<h2>${titulo}</h2>`;

        itens.forEach(item => {
          const temAcesso = cargoAtivo === "admin" ? item.admin : item.user;
          const div = document.createElement("div");
          div.className = "item";
          div.innerHTML = `
            <div class="dot ${temAcesso ? "dot-ok" : "dot-red"}"></div>
            <span class="${temAcesso ? "" : "bloq"}">${item.label}</span>
            <span class="tag ${temAcesso ? "tag-ok" : "tag-no"}">${temAcesso ? "OK" : "Bloqueado"}</span>
          `;
          card.appendChild(div);
        });

        gridEl.appendChild(card);
      }

      if (cargoAtivo === "admin") {
        renderListaUsuarios();
      } else {
        renderBloqueioAdmin();
      }
    }

    async function renderListaUsuarios() {
      const secao = document.createElement("div");
      secao.className = "card";
      secao.style.marginTop = "1rem";
      secao.innerHTML = `<h2>👥 Todos os Usuários Cadastrados</h2><div id="lista-usuarios"><p style="font-size:13px;color:#AB4D26;">Carregando...</p></div>`;
      gridEl.appendChild(secao);

      try {
        const snapUsers = await get(ref(db, "users"));
        const listaEl = document.getElementById("lista-usuarios");

        if (!snapUsers.exists()) {
          listaEl.innerHTML = `<p style="font-size:13px;color:#AB4D26;">Nenhum usuário encontrado.</p>`;
          return;
        }

        listaEl.innerHTML = "";
        snapUsers.forEach(child => {
          const u = child.val();
          const item = document.createElement("div");
          item.className = "item";
          item.innerHTML = `
            <div class="dot dot-ok"></div>
            <span>${u.email}</span>
            <span class="tag tag-ok">${u.cargo}</span>
          `;
          listaEl.appendChild(item);
        });

      } catch (e) {
        document.getElementById("lista-usuarios").innerHTML =
          `<p style="font-size:13px;color:#e53935;">❌ Acesso negado pelo Firebase.</p>`;
      }
    }

    function renderBloqueioAdmin() {
      const secao = document.createElement("div");
      secao.className = "card";
      secao.style.marginTop = "1rem";
      secao.style.borderLeft = "4px solid #e53935";
      secao.innerHTML = `
        <h2 style="color:#e53935;">🔒 Área Restrita</h2>
        <p style="font-size:13px;color:#a32d2d;margin-top:8px;">Você tentou acessar a lista de usuários, mas seu cargo <strong>não tem permissão</strong>. O Firebase bloqueou o acesso automaticamente pelas Security Rules.</p>
      `;
      gridEl.appendChild(secao);

      get(ref(db, "users")).then(() => {}).catch(() => {});
    }

    if (cargo === "admin") {
      tabsEl.innerHTML = `
        <button class="tbtn" id="tab-admin" style="background:#2E0727;color:#D99B36;">Ver como Admin</button>
        <button class="tbtn" id="tab-user"  style="background:#FDF3D4;color:#2E0727;opacity:0.7;">Ver como User</button>
      `;
      renderCards("admin");

      document.getElementById("tab-admin").addEventListener("click", () => {
        document.getElementById("tab-admin").style.cssText = "background:#2E0727;color:#D99B36;opacity:1;";
        document.getElementById("tab-user").style.cssText  = "background:#FDF3D4;color:#2E0727;opacity:0.7;";
        renderCards("admin");
      });
      document.getElementById("tab-user").addEventListener("click", () => {
        document.getElementById("tab-admin").style.cssText = "background:#FDF3D4;color:#2E0727;opacity:0.7;";
        document.getElementById("tab-user").style.cssText  = "background:#AB4D26;color:#FDF3D4;opacity:1;";
        renderCards("user");
      });

    } else {
      renderCards("user");
    }
  });
}