(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const token = localStorage.getItem("tv_admin_token");
  if (!token) { window.location.href = "login.html"; return; }

  document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.removeItem("tv_admin_token");
    localStorage.removeItem("tv_admin_email");
    window.location.href = "login.html";
  });

  const apiDot = document.getElementById("apiDot");
  const apiStatusText = document.getElementById("apiStatusText");

  const formCreate = document.getElementById("formCreate");
  const nome = document.getElementById("nome");
  const descricao = document.getElementById("descricao");
  const btnCreate = document.getElementById("btnCreate");
  const createMsg = document.getElementById("createMsg");

  const tbody = document.getElementById("tbody");
  const subTotal = document.getElementById("subTotal");
  const tableMsg = document.getElementById("tableMsg");
  const searchInput = document.getElementById("searchInput");
  const btnReload = document.getElementById("btnReload");

  const API_BASE = "http://localhost:3000";
  const HEALTH_URL = `${API_BASE}/api/health`;
  const LIST_URL = `${API_BASE}/api/playlists`;

  let cache = [];

  function setApiStatus(ok) {
    apiDot.classList.remove("ok", "err");
    apiDot.classList.add(ok ? "ok" : "err");
    apiStatusText.textContent = ok ? "API online" : "API offline";
  }

  async function checkHealth() {
    try {
      const res = await fetch(HEALTH_URL);
      setApiStatus(res.ok);
    } catch {
      setApiStatus(false);
    }
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setCreateMsg(text, type) {
    createMsg.textContent = text || "";
    createMsg.classList.remove("ok", "error");
    if (type) createMsg.classList.add(type);
  }

  function render(rows) {
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="td-muted">Nenhuma playlist encontrada.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map((p) => `
      <tr>
        <td>${escapeHtml(p.id)}</td>
        <td><strong>${escapeHtml(p.nome)}</strong></td>
        <td>${escapeHtml(p.descricao || "—")}</td>
        <td>${escapeHtml(p.itens)}</td>
        <td>
          <div class="row-actions">
            <a class="btn btn-secondary btn-sm" href="playlist-editor.html?id=${encodeURIComponent(p.id)}">Editar</a>
            <button class="btn btn-danger btn-sm" data-del="${escapeHtml(p.id)}">Excluir</button>
          </div>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll("button[data-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-del");
        if (!confirm(`Excluir playlist #${id}? (itens serão removidos)`)) return;
        await excluir(id);
      });
    });
  }

  function applyFilter() {
    const q = String(searchInput.value || "").trim().toLowerCase();
    const filtered = !q ? cache : cache.filter((p) => String(p.nome || "").toLowerCase().includes(q));
    subTotal.textContent = `Total: ${filtered.length}`;
    render(filtered);
  }

  async function load() {
    tableMsg.textContent = "";
    subTotal.textContent = "Carregando...";
    tbody.innerHTML = `<tr><td colspan="5" class="td-muted">Carregando...</td></tr>`;

    try {
      await checkHealth();
      const res = await fetch(LIST_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cache = Array.isArray(data) ? data : [];
      tableMsg.textContent = "Lista atualizada.";
      applyFilter();
    } catch (err) {
      console.error(err);
      tableMsg.textContent = "Falha ao carregar playlists.";
      subTotal.textContent = "—";
      tbody.innerHTML = `<tr><td colspan="5" class="td-muted">Erro ao carregar.</td></tr>`;
    }
  }

  async function criarPlaylist(payload) {
    btnCreate.disabled = true;
    btnCreate.textContent = "Criando...";
    try {
      const res = await fetch(LIST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || `Falha (HTTP ${res.status})`);

      setCreateMsg("Playlist criada com sucesso.", "ok");
      nome.value = "";
      descricao.value = "";
      await load();
    } catch (err) {
      console.error(err);
      setCreateMsg(err.message || "Falha ao criar playlist.", "error");
    } finally {
      btnCreate.disabled = false;
      btnCreate.textContent = "Criar";
    }
  }

  async function excluir(id) {
    try {
      tableMsg.textContent = "Excluindo...";
      const res = await fetch(`${LIST_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || `Falha (HTTP ${res.status})`);
      tableMsg.textContent = "Playlist excluída.";
      await load();
    } catch (err) {
      console.error(err);
      tableMsg.textContent = err.message || "Falha ao excluir playlist.";
    }
  }

  formCreate.addEventListener("submit", (e) => {
    e.preventDefault();
    setCreateMsg("");
    const n = String(nome.value || "").trim();
    if (!n) { setCreateMsg("Informe o nome.", "error"); return; }
    criarPlaylist({ nome: n, descricao: String(descricao.value || "").trim() || null });
  });

  searchInput.addEventListener("input", applyFilter);
  btnReload.addEventListener("click", load);

  load();
})();
