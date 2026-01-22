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

  const title = document.getElementById("title");
  const msg = document.getElementById("msg");
  const tableMsg = document.getElementById("tableMsg");
  const subTotal = document.getElementById("subTotal");

  const formAdd = document.getElementById("formAdd");
  const mediaSelect = document.getElementById("mediaSelect");
  const duracao = document.getElementById("duracao");
  const btnAdd = document.getElementById("btnAdd");
  const btnRefresh = document.getElementById("btnRefresh");
  const btnSaveOrder = document.getElementById("btnSaveOrder");

  const tbody = document.getElementById("tbody");

  const API_BASE = "http://localhost:3000";
  const HEALTH_URL = `${API_BASE}/api/health`;
  const MIDIAS_URL = `${API_BASE}/api/midias`;
  const PLAYLISTS_URL = `${API_BASE}/api/playlists`;

  const params = new URLSearchParams(window.location.search);
  const playlistId = Number(params.get("id"));

  if (!Number.isFinite(playlistId)) {
    alert("ID de playlist inválido.");
    window.location.href = "playlists.html";
    return;
  }

  let playlist = null;
  let itens = [];
  let midias = [];

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

  function setMsg(el, text, type) {
    el.textContent = text || "";
    el.classList.remove("ok", "error");
    if (type) el.classList.add(type);
  }

  function renderMediaSelect() {
    if (!midias.length) {
      mediaSelect.innerHTML = `<option value="">Nenhuma mídia encontrada (envie em Mídias)</option>`;
      return;
    }

    mediaSelect.innerHTML = midias
      .map((m) => `<option value="${escapeHtml(m.filename)}">${escapeHtml(m.filename)}</option>`)
      .join("");
  }

  function moveItem(index, dir) {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= itens.length) return;
    const tmp = itens[index];
    itens[index] = itens[newIndex];
    itens[newIndex] = tmp;
    renderItens();
  }

  function renderItens() {
    subTotal.textContent = `Total: ${itens.length}`;

    if (!itens.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="td-muted">Nenhum item na playlist.</td></tr>`;
      return;
    }

    tbody.innerHTML = itens.map((it, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${escapeHtml(it.filename)}</strong></td>
        <td>${escapeHtml(it.tipo)}</td>
        <td>${it.duracao_seg ? escapeHtml(it.duracao_seg + "s") : "—"}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-secondary btn-sm" data-up="${idx}">↑</button>
            <button class="btn btn-secondary btn-sm" data-down="${idx}">↓</button>
            <button class="btn btn-danger btn-sm" data-del="${escapeHtml(it.id)}">Excluir</button>
          </div>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll("button[data-up]").forEach((b) =>
      b.addEventListener("click", () => moveItem(Number(b.getAttribute("data-up")), -1))
    );
    tbody.querySelectorAll("button[data-down]").forEach((b) =>
      b.addEventListener("click", () => moveItem(Number(b.getAttribute("data-down")), +1))
    );
    tbody.querySelectorAll("button[data-del]").forEach((b) =>
      b.addEventListener("click", async () => {
        const itemId = b.getAttribute("data-del");
        if (!confirm("Excluir este item?")) return;
        await removerItem(itemId);
      })
    );
  }

  async function loadPlaylist() {
    const res = await fetch(`${PLAYLISTS_URL}/${playlistId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    playlist = data;
    itens = Array.isArray(data.itens) ? data.itens.slice() : [];
    title.textContent = `Editor • ${playlist.nome} (#${playlist.id})`;
    renderItens();
  }

  async function loadMidias() {
    const res = await fetch(MIDIAS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    midias = Array.isArray(data) ? data : [];
    renderMediaSelect();
  }

  async function adicionarItem(filename, dur) {
    btnAdd.disabled = true;
    btnAdd.textContent = "Adicionando...";
    try {
      const res = await fetch(`${PLAYLISTS_URL}/${playlistId}/itens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, duracao_seg: dur }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || `Falha (HTTP ${res.status})`);
      setMsg(msg, "Item adicionado.", "ok");
      await loadPlaylist();
    } catch (e) {
      console.error(e);
      setMsg(msg, e.message || "Falha ao adicionar item.", "error");
    } finally {
      btnAdd.disabled = false;
      btnAdd.textContent = "Adicionar";
    }
  }

  async function removerItem(itemId) {
    try {
      tableMsg.textContent = "Excluindo item...";
      const res = await fetch(`${PLAYLISTS_URL}/${playlistId}/itens/${encodeURIComponent(itemId)}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || `Falha (HTTP ${res.status})`);
      tableMsg.textContent = "Item excluído.";
      await loadPlaylist();
    } catch (e) {
      console.error(e);
      tableMsg.textContent = e.message || "Falha ao excluir item.";
    }
  }

  async function salvarOrdem() {
    try {
      btnSaveOrder.disabled = true;
      btnSaveOrder.textContent = "Salvando...";
      tableMsg.textContent = "";

      const order = itens.map((it) => it.id);

      const res = await fetch(`${PLAYLISTS_URL}/${playlistId}/itens/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || `Falha (HTTP ${res.status})`);

      tableMsg.textContent = "Ordem salva.";
      await loadPlaylist();
    } catch (e) {
      console.error(e);
      tableMsg.textContent = e.message || "Falha ao salvar ordem.";
    } finally {
      btnSaveOrder.disabled = false;
      btnSaveOrder.textContent = "Salvar ordem";
    }
  }

  formAdd.addEventListener("submit", (e) => {
    e.preventDefault();
    setMsg(msg, "");

    const filename = String(mediaSelect.value || "").trim();
    if (!filename) { setMsg(msg, "Selecione uma mídia.", "error"); return; }

    const dur = Math.max(1, Number(duracao.value || 10));
    adicionarItem(filename, dur);
  });

  btnRefresh.addEventListener("click", async () => {
    setMsg(msg, "");
    try {
      await Promise.all([loadMidias(), loadPlaylist()]);
      setMsg(msg, "Atualizado.", "ok");
    } catch (e) {
      console.error(e);
      setMsg(msg, "Falha ao atualizar.", "error");
    }
  });

  btnSaveOrder.addEventListener("click", salvarOrdem);

  (async function init() {
    try {
      await checkHealth();
      await loadMidias();
      await loadPlaylist();
    } catch (e) {
      console.error(e);
      alert("Falha ao carregar o editor. Verifique backend e rotas.");
      window.location.href = "playlists.html";
    }
  })();
})();
