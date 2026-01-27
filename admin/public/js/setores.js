(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Proteção simples (mock). Depois substituímos por JWT real.
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

  // Toggle do submenu de Unidades
  const toggleBtn = document.getElementById('toggleUnidades');
  const submenu = document.getElementById('submenuUnidades');
  if (toggleBtn && submenu) {
    // Expandir por padrão
    submenu.classList.add('expanded');
    toggleBtn.classList.add('expanded');
    
    toggleBtn.addEventListener('click', () => {
      const isExpanded = submenu.classList.contains('expanded');
      if (isExpanded) {
        submenu.classList.remove('expanded');
        toggleBtn.classList.remove('expanded');
      } else {
        submenu.classList.add('expanded');
        toggleBtn.classList.add('expanded');
      }
    });
  }

  const apiDot = document.getElementById("apiDot");
  const apiStatusText = document.getElementById("apiStatusText");

  const tbody = document.getElementById("tbodySetores");
  const subTotal = document.getElementById("subTotal");
  const tableMsg = document.getElementById("tableMsg");
  const searchInput = document.getElementById("searchInput");
  const btnReload = document.getElementById("btnReload");

  const API_BASE = "http://localhost:3000"; // depois colocamos em config
  const HEALTH_URL = `${API_BASE}/api/health`;
  const SETORES_URL = `${API_BASE}/api/setores`;

  // Formulário de criação de setor
  const formCreate = document.getElementById("formCreate");
  const createMsg = document.getElementById("createMsg");
  if (formCreate) {
    formCreate.addEventListener("submit", async (e) => {
      e.preventDefault();
      createMsg.textContent = "";
      const formData = new FormData(formCreate);
      const nome = formData.get("nome");
      const descricao = formData.get("descricao");
      const ativo = formData.get("ativo") === "1" ? 1 : 0;
      try {
        const res = await fetch(SETORES_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, descricao, ativo })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          createMsg.textContent = err.message || `Erro ao criar setor (HTTP ${res.status})`;
          createMsg.className = "form-msg form-msg-err";
          return;
        }
        createMsg.textContent = "Setor criado com sucesso!";
        createMsg.className = "form-msg form-msg-ok";
        formCreate.reset();
        loadSetores();
      } catch (err) {
        createMsg.textContent = "Erro de rede ao criar setor.";
        createMsg.className = "form-msg form-msg-err";
      }
    });
  }

  let setoresCache = [];

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

  function formatDateTime(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString("pt-BR");
  }

  function badgeAtivo(ativo) {
    const isOn = Number(ativo) === 1;
    return `<span class="badge ${isOn ? "ok" : "off"}">${isOn ? "Ativo" : "Inativo"}</span>`;
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderRows(rows) {
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="td-muted">Nenhum setor encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows
      .map((s) => {
        return `
          <tr>
            <td>${escapeHtml(s.id)}</td>
            <td><strong>${escapeHtml(s.nome)}</strong></td>
            <td>${escapeHtml(s.descricao || "—")}</td>
            <td>${badgeAtivo(s.ativo)}</td>
            <td>${escapeHtml(formatDateTime(s.criado_em))}</td>
            <td>${escapeHtml(formatDateTime(s.atualizado_em))}</td>
            <td><button class="btn btn-danger btn-sm btn-excluir-setor" data-id="${escapeHtml(s.id)}">Excluir</button></td>
          </tr>
        `;
      })
      .join("");

    // Adiciona evento aos botões de exclusão
    document.querySelectorAll('.btn-excluir-setor').forEach(btn => {
      btn.addEventListener('click', async function () {
        const id = this.getAttribute('data-id');
        if (!id || !confirm('Deseja realmente excluir este setor?')) return;
        try {
          const res = await fetch(`${SETORES_URL}/${id}`, { method: 'DELETE' });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            tableMsg.textContent = err.message || `Erro ao excluir setor (HTTP ${res.status})`;
            tableMsg.className = "table-msg table-msg-err";
            return;
          }
          tableMsg.textContent = "Setor excluído com sucesso.";
          tableMsg.className = "table-msg table-msg-ok";
          loadSetores();
        } catch (err) {
          tableMsg.textContent = "Erro de rede ao excluir setor.";
          tableMsg.className = "table-msg table-msg-err";
        }
      });
    });
  }

  function applyFilter() {
    const q = String(searchInput.value || "").trim().toLowerCase();

    const filtered = !q
      ? setoresCache
      : setoresCache.filter((s) => {
          const id = String(s.id ?? "").toLowerCase();
          const nome = String(s.nome ?? "").toLowerCase();
          const desc = String(s.descricao ?? "").toLowerCase();
          return id.includes(q) || nome.includes(q) || desc.includes(q);
        });

    subTotal.textContent = `Total: ${filtered.length}`;
    renderRows(filtered);
  }

  async function loadSetores() {
    tableMsg.textContent = "";
    subTotal.textContent = "Carregando...";
    tbody.innerHTML = `<tr><td colspan="6" class="td-muted">Carregando...</td></tr>`;

    try {
      await checkHealth();

      const res = await fetch(SETORES_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setoresCache = Array.isArray(data) ? data : [];

      tableMsg.textContent = "Dados carregados com sucesso.";
      applyFilter();
    } catch (err) {
      console.error(err);
      tableMsg.textContent = "Falha ao carregar setores. Verifique se o backend está rodando.";
      subTotal.textContent = "—";
      tbody.innerHTML = `<tr><td colspan="6" class="td-muted">Erro ao carregar.</td></tr>`;
    }
  }

  searchInput.addEventListener("input", applyFilter);
  btnReload.addEventListener("click", loadSetores);

  // Inicial
  loadSetores();
})();
