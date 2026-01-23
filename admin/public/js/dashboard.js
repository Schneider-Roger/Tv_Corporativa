(function () {
  const token = localStorage.getItem("tv_admin_token");
  if (!token) { window.location.href = "login.html"; return; }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.removeItem("tv_admin_token");
    localStorage.removeItem("tv_admin_email");
    window.location.href = "login.html";
  });

  // Toggle do submenu de Unidades
  const toggleBtn = document.getElementById('toggleUnidades');
  const submenu = document.getElementById('submenuUnidades');
  if (toggleBtn && submenu) {
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

  const API_BASE = "http://localhost:3000";
  const endpoints = {
    health: `${API_BASE}/api/health`,
    setores: `${API_BASE}/api/setores`,
    unidades: `${API_BASE}/api/unidades`,
    playlists: `${API_BASE}/api/playlists`,
    devices: `${API_BASE}/api/devices`
  };

  const apiDot = document.getElementById("apiDot");
  const apiStatusText = document.getElementById("apiStatusText");

  const kpiSetores = document.getElementById("kpiSetores");
  const kpiUnidades = document.getElementById("kpiUnidades");
  const kpiPlaylists = document.getElementById("kpiPlaylists");
  const kpiDevices = document.getElementById("kpiDevices");
  const kpiOnline = document.getElementById("kpiOnline");

  const devicesTbody = document.getElementById("devicesTbody");
  const devicesSub = document.getElementById("devicesSub");

  const sysApi = document.getElementById("sysApi");
  const sysBase = document.getElementById("sysBase");
  const sysUpdated = document.getElementById("sysUpdated");
  const btnRefresh = document.getElementById("btnRefresh");

  function setApiStatus(ok) {
    apiDot.classList.remove("ok", "err");
    apiDot.classList.add(ok ? "ok" : "err");
    apiStatusText.textContent = ok ? "API online" : "API offline";
    sysApi.textContent = ok ? "Online" : "Offline";
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function isOnline(lastHeartbeat) {
    if (!lastHeartbeat) return false;
    const t = new Date(lastHeartbeat).getTime();
    if (Number.isNaN(t)) return false;
    return ((Date.now() - t) / 1000) <= 60;
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function load() {
    sysBase.textContent = API_BASE;
    sysUpdated.textContent = "Carregando...";

    try {
      const health = await fetchJson(endpoints.health);
      setApiStatus(Boolean(health?.ok));
    } catch {
      setApiStatus(false);
      sysUpdated.textContent = new Date().toLocaleString();
      return;
    }

    try {
      const [setores, unidades, playlists, devices] = await Promise.all([
        fetchJson(endpoints.setores),
        fetchJson(endpoints.unidades),
        fetchJson(endpoints.playlists),
        fetchJson(endpoints.devices),
      ]);

      kpiSetores.textContent = Array.isArray(setores) ? setores.length : "0";
      kpiUnidades.textContent = Array.isArray(unidades) ? unidades.length : "0";
      kpiPlaylists.textContent = Array.isArray(playlists) ? playlists.length : "0";
      kpiDevices.textContent = Array.isArray(devices) ? devices.length : "0";

      const online = (Array.isArray(devices) ? devices : []).filter((d) => isOnline(d.ultimo_heartbeat)).length;
      kpiOnline.textContent = String(online);

      const recent = (Array.isArray(devices) ? devices : []).slice(0, 8);
      devicesSub.textContent = `Mostrando ${recent.length} de ${Array.isArray(devices) ? devices.length : 0}`;

      if (!recent.length) {
        devicesTbody.innerHTML = `<tr><td colspan="4" class="td-muted">Nenhum device cadastrado.</td></tr>`;
      } else {
        devicesTbody.innerHTML = recent.map((d) => {
          const on = isOnline(d.ultimo_heartbeat);
          return `
            <tr>
              <td>${escapeHtml(d.id)}</td>
              <td><strong>${escapeHtml(d.nome || "—")}</strong></td>
              <td>${escapeHtml(d.device_key)}</td>
              <td>${on ? `<span class="badge ok">Online</span>` : `<span class="badge off">Offline</span>`}</td>
            </tr>
          `;
        }).join("");
      }

      sysUpdated.textContent = new Date().toLocaleString();
    } catch (err) {
      console.error(err);
      sysUpdated.textContent = new Date().toLocaleString();
    }
  }

  btnRefresh.addEventListener("click", load);

  // Toggle do submenu de Unidades
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleUnidades');
    const submenu = document.getElementById('submenuUnidades');

    if (toggleBtn && submenu) {
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
  });

  load();
})();
