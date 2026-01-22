(() => {
  const API_BASE = "http://localhost:3000/api";
  const tableBody = document.getElementById("devicesTable");
  const searchInput = document.getElementById("searchInput");

  const totalEl = document.getElementById("totalDevices");
  const onlineEl = document.getElementById("onlineDevices");
  const offlineEl = document.getElementById("offlineDevices");

  document.getElementById("year").textContent = new Date().getFullYear();

  document.getElementById("btnLogout").onclick = () => {
    localStorage.clear();
    location.href = "login.html";
  };

  document.getElementById("btnRefresh").onclick = loadDevices;

  let devices = [];

  function isOnline(lastHeartbeat) {
    if (!lastHeartbeat) return false;
    return (Date.now() - new Date(lastHeartbeat).getTime()) <= 60000;
  }

  function render(list) {
    tableBody.innerHTML = "";

    if (!list.length) {
      tableBody.innerHTML = `
        <tr><td colspan="5" class="td-muted">Nenhum device encontrado</td></tr>
      `;
      return;
    }

    list.forEach(d => {
      const online = isOnline(d.ultimo_heartbeat);

      tableBody.innerHTML += `
        <tr>
          <td>${d.id}</td>
          <td><strong>${d.nome || "-"}</strong></td>
          <td>${d.device_key}</td>
          <td>
            <span class="badge ${online ? "online" : "offline"}">
              ${online ? "Online" : "Offline"}
            </span>
          </td>
          <td>${d.ultimo_heartbeat ? new Date(d.ultimo_heartbeat).toLocaleString() : "-"}</td>
        </tr>
      `;
    });
  }

  function updateCounters() {
    totalEl.textContent = devices.length;
    const online = devices.filter(d => isOnline(d.ultimo_heartbeat)).length;
    onlineEl.textContent = online;
    offlineEl.textContent = devices.length - online;
  }

  async function loadDevices() {
    tableBody.innerHTML = `<tr><td colspan="5" class="td-muted">Carregando...</td></tr>`;

    try {
      const res = await fetch(`${API_BASE}/devices`);
      devices = await res.json();
      updateCounters();
      render(devices);
    } catch (err) {
      console.error(err);
      tableBody.innerHTML = `
        <tr><td colspan="5" class="td-muted">Erro ao carregar devices</td></tr>
      `;
    }
  }

  searchInput.addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    const filtered = devices.filter(d =>
      d.nome?.toLowerCase().includes(q) ||
      d.device_key?.toLowerCase().includes(q)
    );
    render(filtered);
  });

  loadDevices();
})();
