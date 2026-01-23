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

  const formCreate = document.getElementById("formCreate");
  const nome = document.getElementById("nome");
  const cidade = document.getElementById("cidade");
  const tipo = document.getElementById("tipo");
  const setor_id = document.getElementById("setor_id");
  const ativoInputs = document.getElementsByName("ativo");
  const btnCreate = document.getElementById("btnCreate");
  const createMsg = document.getElementById("createMsg");

  const tbody = document.getElementById("tbodyUnidades");
  const subTotal = document.getElementById("subTotal");
  const tableMsg = document.getElementById("tableMsg");
  const searchInput = document.getElementById("searchInput");
  const btnReload = document.getElementById("btnReload");

  const API_BASE = "http://localhost:3000";
  const HEALTH_URL = `${API_BASE}/api/health`;
  const UNIDADES_URL = `${API_BASE}/api/unidades`;
  const SETORES_URL = `${API_BASE}/api/setores`;

  // Carregar setores para o dropdown
  async function loadSetores() {
    try {
      const res = await fetch(SETORES_URL);
      if (res.ok) {
        const setores = await res.json();
        setor_id.innerHTML = '<option value="">Selecione um setor</option>';
        setores.forEach(s => {
          const option = document.createElement('option');
          option.value = s.id;
          option.textContent = s.nome;
          setor_id.appendChild(option);
        });
      }
    } catch (err) {
      console.error("Erro ao carregar setores:", err);
    }
  }

  // Handler para criar unidade
  formCreate.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nomeValue = nome.value.trim();
    if (!nomeValue) {
      showCreateMsg("Nome é obrigatório.", "error");
      return;
    }

    const cidadeValue = cidade.value.trim() || null;
    const tipoValue = tipo.value.trim() || null; // Disabled, so null
    const setorIdValue = setor_id.value ? Number(setor_id.value) : null;
    const ativoValue = Array.from(ativoInputs).find(r => r.checked)?.value === "1";

    btnCreate.disabled = true;
    btnCreate.textContent = "Criando...";

    try {
      const res = await fetch(UNIDADES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeValue,
          cidade: cidadeValue,
          tipo: tipoValue,
          setor_id: setorIdValue,
          ativo: ativoValue
        }),
      });

      if (res.ok) {
        showCreateMsg("Unidade criada com sucesso!", "success");
        formCreate.reset();
        loadUnidades(); // Recarregar lista
      } else {
        const data = await res.json();
        showCreateMsg(data.message || "Erro ao criar unidade.", "error");
      }
    } catch (err) {
      console.error("Erro ao criar unidade:", err);
      showCreateMsg("Erro de rede. Tente novamente.", "error");
    } finally {
      btnCreate.disabled = false;
      btnCreate.textContent = "Criar Unidade";
    }
  });

  function showCreateMsg(text, type) {
    createMsg.textContent = text;
    createMsg.className = `form-msg ${type}`;
  }

  let unidadesCache = [];

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
      tbody.innerHTML = `<tr><td colspan="8" class="td-muted">Nenhuma unidade encontrada.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows
      .map((u) => `
        <tr>
          <td>${escapeHtml(u.id)}</td>
          <td><strong>${escapeHtml(u.nome)}</strong></td>
          <td>${escapeHtml(u.cidade || "—")}</td>
          <td>${escapeHtml(u.tipo || "—")}</td>
          <td>${escapeHtml(u.setor_nome || "—")}</td>
          <td>${badgeAtivo(u.ativo)}</td>
          <td>${escapeHtml(formatDateTime(u.criado_em))}</td>
          <td>${escapeHtml(formatDateTime(u.atualizado_em))}</td>
        </tr>
      `)
      .join("");
  }

  function applyFilter() {
    const q = String(searchInput.value || "").trim().toLowerCase();

    const filtered = !q
      ? unidadesCache
      : unidadesCache.filter((u) => {
          const id = String(u.id ?? "").toLowerCase();
          const nome = String(u.nome ?? "").toLowerCase();
          const cid = String(u.cidade ?? "").toLowerCase();
          const tip = String(u.tipo ?? "").toLowerCase();
          const set = String(u.setor_nome ?? "").toLowerCase();
          return id.includes(q) || nome.includes(q) || cid.includes(q) || tip.includes(q) || set.includes(q);
        });

    subTotal.textContent = `Total: ${filtered.length}`;
    renderRows(filtered);
  }

  async function loadUnidades() {
    tableMsg.textContent = "";
    subTotal.textContent = "Carregando...";
    tbody.innerHTML = `<tr><td colspan="8" class="td-muted">Carregando...</td></tr>`;

    try {
      await checkHealth();

      const res = await fetch(UNIDADES_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      unidadesCache = Array.isArray(data) ? data : [];

      tableMsg.textContent = "Dados carregados com sucesso.";
      applyFilter();
    } catch (err) {
      console.error(err);
      tableMsg.textContent = "Falha ao carregar unidades. Verifique se o backend está rodando e se a rota /api/unidades existe.";
      subTotal.textContent = "—";
      tbody.innerHTML = `<tr><td colspan="6" class="td-muted">Erro ao carregar.</td></tr>`;
    }
  }

  searchInput.addEventListener("input", applyFilter);
  btnReload.addEventListener("click", loadUnidades);

  loadSetores();
  loadUnidades();
})();
