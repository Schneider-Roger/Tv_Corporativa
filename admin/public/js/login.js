(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMsg");
  const btn = document.getElementById("btnLogin");

  function setMsg(text, type) {
    msg.textContent = text || "";
    msg.classList.remove("error", "ok");
    if (type) msg.classList.add(type);
  }

  function setLoading(isLoading) {
    btn.disabled = !!isLoading;
    btn.textContent = isLoading ? "Entrando..." : "Entrar";
  }

  // Se já tiver "token", manda pro painel (quando existir)
  const token = localStorage.getItem("tv_admin_token");
  if (token) {
    // ajuste depois para dashboard.html
    // window.location.href = "index.html";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("");

    const email = String(document.getElementById("email").value || "").trim();
    const senha = String(document.getElementById("senha").value || "").trim();

    if (!email || !senha) {
      setMsg("Informe e-mail e senha.", "error");
      return;
    }

    setLoading(true);

    try {
      // MOCK: até o backend ter /api/auth/login
      // Depois vamos trocar por fetch real e salvar JWT.
      if (senha.length < 6) {
        setMsg("Senha inválida (mínimo 6 caracteres).", "error");
        return;
      }

      // Token fake só para liberar navegação do painel por enquanto
      localStorage.setItem("tv_admin_token", "mock-token");
      localStorage.setItem("tv_admin_email", email);

      setMsg("Login realizado. Redirecionando...", "ok");

      // ajuste depois para dashboard.html
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 600);
    } catch (err) {
      console.error(err);
      setMsg("Falha no login. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  });
})();
