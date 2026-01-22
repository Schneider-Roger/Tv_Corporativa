(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const token = localStorage.getItem("tv_admin_token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.removeItem("tv_admin_token");
    localStorage.removeItem("tv_admin_email");
    window.location.href = "login.html";
  });

  const apiDot = document.getElementById("apiDot");
  const apiStatusText = document.getElementById("apiStatusText");

  const uploadForm = document.getElementById("uploadForm");
  const fileInput = document.getElementById("fileInput");
  const btnUpload = document.getElementById("btnUpload");
  const btnReload = document.getElementById("btnReload");
  const uploadMsg = document.getElementById("uploadMsg");

  const tbody = document.getElementById("tbodyMidias");
  const subTotal = document.getElementById("subTotal");
  const tableMsg = document.getElementById("tableMsg");
  const searchInput = document.getElementById("searchInput");

  const API_BASE = "http://localhost:3000";
  const HEALTH_URL = `${API_BASE}/api/health`;
  const LIST_URL = `${API_BASE}/api/midias`;
  const UPLOAD_URL = `${API_BASE}/api/midias/upload`;
  const UPLOADS_BASE = `${API_BASE}/uploads`;

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

  function formatBytes(n) {
    const bytes = Number(n || 0);
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  }

  function formatDateTime(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString("pt-BR");
  }

  function applyFilter() {
    const q = String(searchInput.value || "").trim().toLowerCase();
    const filtered = !q
      ? cache
      : cache.filter((m) => String(m.filename || "").toLowerCase().includes(q));

    subTotal.textContent = `Total: ${filtered.length}`;
    renderRows(filtered);
  }

  function renderRows(rows) {
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="td-muted">Nenhum arquivo encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows
      .map((m) => {
        const file = m.filename;
        const url = `${UPLOADS_BASE}/${encodeURIComponent(file)}`;
        return `
          <tr>
            <td>
              <div class="file-row">
                <div class="file-name">${escapeHtml(file)}</div>
                <a class="file-link" href="${url}" target="_blank" rel="noopener">Abrir</a>
              </div>
            </td>
            <td>${escapeHtml(formatBytes(m.size_bytes))}</td>
            <td>${escapeHtml(formatDateTime(m.modified_at))}</td>
            <td>
              <div class="row-actions">
                <button class="btn btn-secondary btn-sm" data-copy="${escapeHtml(url)}">Copiar URL</button>
                <button class="btn btn-danger btn-sm" data-del="${escapeHtml(file)}">Excluir</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    // bind actions
    tbody.querySelectorAll("button[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const url = btn.getAttribute("data-copy");
        try {
          await navigator.clipboard.writeText(url);
          tableMsg.textContent = "URL copiada para a área de transferência.";
        } catch {
          tableMsg.textContent = "Não foi possível copiar a URL.";
        }
      });
    });

    tbody.querySelectorAll("button[data-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const file = btn.getAttribute("data-del");
        if (!confirm(`Excluir "${file}"?`)) return;
        await deleteFile(file);
      });
    });
  }

  async function loadList() {
    tableMsg.textContent = "";
    subTotal.textContent = "Carregando...";
    tbody.innerHTML = `<tr><td colspan="4" class="td-muted">Carregando...</td></tr>`;

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
      tableMsg.textContent = "Falha ao carregar mídias. Verifique se a rota /api/midias existe.";
      subTotal.textContent = "—";
      tbody.innerHTML = `<tr><td colspan="4" class="td-muted">Erro ao carregar.</td></tr>`;
    }
  }

  function setUploadMsg(text, type) {
    uploadMsg.textContent = text || "";
    uploadMsg.classList.remove("error", "ok");
    if (type) uploadMsg.classList.add(type);
  }

  async function uploadFile(file) {
    setUploadMsg("");
    if (!file) {
      setUploadMsg("Selecione um arquivo.", "error");
      return;
    }

    btnUpload.disabled = true;
    btnUpload.textContent = "Enviando...";

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(UPLOAD_URL, { method: "POST", body: form });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.message || `Falha no upload (HTTP ${res.status}).`;
        throw new Error(msg);
      }

      setUploadMsg("Upload concluído com sucesso.", "ok");
      fileInput.value = "";
      await loadList();
    } catch (err) {
      console.error(err);
      setUploadMsg(err.message || "Falha no upload.", "error");
    } finally {
      btnUpload.disabled = false;
      btnUpload.textContent = "Enviar";
    }
  }

  async function deleteFile(filename) {
    try {
      tableMsg.textContent = "Excluindo...";
      const res = await fetch(`${LIST_URL}/${encodeURIComponent(filename)}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || `Falha ao excluir (HTTP ${res.status}).`);
      tableMsg.textContent = "Arquivo excluído.";
      await loadList();
    } catch (err) {
      console.error(err);
      tableMsg.textContent = err.message || "Falha ao excluir arquivo.";
    }
  }

  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const file = fileInput.files && fileInput.files[0];
    uploadFile(file);
  });

  btnReload.addEventListener("click", loadList);
  searchInput.addEventListener("input", applyFilter);

  loadList();
})();
