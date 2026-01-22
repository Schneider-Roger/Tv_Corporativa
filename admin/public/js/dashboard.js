(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Proteção simples (mock). Depois substituímos por JWT real.
  const token = localStorage.getItem("tv_admin_token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const btnLogout = document.getElementById("btnLogout");
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("tv_admin_token");
    localStorage.removeItem("tv_admin_email");
    window.location.href = "login.html";
  });

  const apiDot = document.getElementById("apiDot");
  const apiStatusText = document.getElementById("apiStatusText");

  const cardApiStatus = document.getElementById("cardApiStatus");
  const cardApiSub = document.getElementById("cardApiSub");
  const cardEnv = document.getElementById("cardEnv");
  const cardLastCheck = document.getElementById("cardLastCheck");

  const API_BASE = "http://localhost:3000"; // ajuste depois (ex.: via config)
  const HEALTH_URL = `${API_BASE}/api/health`;

  function setStatus(ok, text, sub) {
    apiDot.classList.remove("ok", "err");
    apiDot.classList.add(ok ? "ok" : "err");

    apiStatusText.textContent = text;
    cardApiStatus.textContent = ok ? "Online" : "Offline";
    cardApiSub.textContent = sub || "—";
  }

  function setLastCheck() {
    const now = new Date();
    cardLastCheck.textContent = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  async function checkHealth() {
    setLastCheck();

    try {
      const res = await fetch(HEALTH_URL, { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Seu health pode retornar texto ou json; tentamos os dois
      let data = null;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      // Tentativa de detectar env no payload (se existir)
      const env =
        (data && typeof data === "object" && (data.env || data.NODE_ENV)) ||
        "—";

      cardEnv.textContent = env;

      setStatus(true, "API online", `GET ${HEALTH_URL}`);
    } catch (err) {
      console.error("Health check falhou:", err);
      cardEnv.textContent = "—";
      setStatus(false, "API offline", `Falha em ${HEALTH_URL}`);
    }
  }

  // Primeira checagem + interval
  checkHealth();
  setInterval(checkHealth, 15000);
})();
