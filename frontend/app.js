const API_BASE = "/api";
let token = localStorage.getItem("token") || "";
let currentUser = null;

const loginView = document.getElementById("login-view");
const managerView = document.getElementById("manager-view");
const operatorView = document.getElementById("operator-view");
const userInfo = document.getElementById("user-info");

function today() {
  return new Date().toISOString().slice(0, 10);
}

document.getElementById("manager-day").value = today();
document.getElementById("operator-day").value = today();

async function request(url, options = {}) {
  const headers = options.headers || {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!headers["Content-Type"] && options.body) headers["Content-Type"] = "application/json";
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Errore inatteso");
  }
  return data;
}

function setView() {
  loginView.classList.add("hidden");
  managerView.classList.add("hidden");
  operatorView.classList.add("hidden");

  if (!currentUser) {
    loginView.classList.remove("hidden");
    userInfo.textContent = "";
    return;
  }

  userInfo.textContent = `${currentUser.full_name} (${currentUser.role})`;
  if (["service_manager", "team_leader"].includes(currentUser.role)) {
    managerView.classList.remove("hidden");
  } else {
    operatorView.classList.remove("hidden");
  }
}

async function loadMe() {
  if (!token) return;
  try {
    currentUser = await request(`${API_BASE}/auth/me`);
    setView();
    if (currentUser.role === "operator") {
      await loadOperatorTasks();
    }
  } catch {
    token = "";
    currentUser = null;
    localStorage.removeItem("token");
    setView();
  }
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const result = await request(`${API_BASE}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    token = result.access_token;
    currentUser = result.user;
    localStorage.setItem("token", token);
    setView();
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById("activity-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    title: document.getElementById("a-title").value,
    description: document.getElementById("a-description").value,
    kind: document.getElementById("a-kind").value,
    frequency: document.getElementById("a-frequency").value,
    reference_date: document.getElementById("a-reference-date").value || null,
    specific_date: document.getElementById("a-specific-date").value || null,
    start_date: document.getElementById("a-start-date").value || null,
    end_date: document.getElementById("a-end-date").value || null,
    recurring_every_days: Number(document.getElementById("a-every-days").value || 1),
  };
  try {
    await request(`${API_BASE}/activities`, { method: "POST", body: JSON.stringify(payload) });
    alert("Attività creata");
  } catch (error) {
    alert(error.message);
  }
});

async function loadDailyActivities() {
  const date = document.getElementById("manager-day").value;
  const activities = await request(`${API_BASE}/activities/daily?day=${date}`);
  const operators = await request(`${API_BASE}/users`);
  const container = document.getElementById("day-activities");

  if (activities.length === 0) {
    container.innerHTML = "<p>Nessuna attività prevista.</p>";
    return;
  }

  container.innerHTML = "";
  activities.forEach((activity) => {
    const block = document.createElement("div");
    block.className = "task-item";
    const options = operators.map((u) => `<option value="${u.id}">${u.full_name}</option>`).join("");
    block.innerHTML = `
      <h4>${activity.title}</h4>
      <p>${activity.description || "-"}</p>
      <label>Assegna operatori</label>
      <select multiple id="assign-${activity.id}">${options}</select>
      <button data-activity-id="${activity.id}">Salva assegnazioni</button>
    `;
    block.querySelector("button").addEventListener("click", async () => {
      const selected = Array.from(block.querySelector("select").selectedOptions).map((o) => Number(o.value));
      if (selected.length === 0) {
        alert("Seleziona almeno un operatore");
        return;
      }
      await request(`${API_BASE}/assignments`, {
        method: "POST",
        body: JSON.stringify({ activity_id: activity.id, user_ids: selected, assignment_date: date }),
      });
      alert("Assegnazioni registrate");
    });
    container.appendChild(block);
  });
}

document.getElementById("load-day-activities").addEventListener("click", async () => {
  try {
    await loadDailyActivities();
  } catch (error) {
    alert(error.message);
  }
});

async function loadOperatorTasks() {
  const date = document.getElementById("operator-day").value;
  const tasks = await request(`${API_BASE}/operator/tasks?day=${date}`);
  const container = document.getElementById("operator-tasks");

  if (tasks.length === 0) {
    container.innerHTML = "<p class='card'>Nessuna attività assegnata.</p>";
    return;
  }

  container.innerHTML = "";
  for (const task of tasks) {
    const block = document.createElement("div");
    block.className = "card";
    block.innerHTML = `
      <h3>${task.activity.title}</h3>
      <p>${task.activity.description || "-"}</p>
      <p><strong>Ultimo esito:</strong> ${task.latest_status || "N/D"} ${task.latest_timestamp ? `(${task.latest_timestamp})` : ""}</p>
      <label>Esito
        <select id="status-${task.id}">
          <option value="OK">OK</option>
          <option value="KO">KO</option>
        </select>
      </label>
      <label>Note <textarea id="notes-${task.id}"></textarea></label>
      <button id="exec-${task.id}">Conferma</button>
      <details><summary>Storico</summary><div id="logs-${task.id}">Caricamento...</div></details>
    `;
    block.querySelector(`#exec-${task.id}`).addEventListener("click", async () => {
      const status = block.querySelector(`#status-${task.id}`).value;
      const notes = block.querySelector(`#notes-${task.id}`).value;
      await request(`${API_BASE}/executions`, {
        method: "POST",
        body: JSON.stringify({ assignment_id: task.id, status, notes }),
      });
      alert("Esecuzione registrata");
      await loadOperatorTasks();
    });

    container.appendChild(block);
    loadLogs(task.id);
  }
}

async function loadLogs(assignmentId) {
  const logs = await request(`${API_BASE}/assignments/${assignmentId}/logs`);
  const node = document.getElementById(`logs-${assignmentId}`);
  if (logs.length === 0) {
    node.textContent = "Nessuna esecuzione registrata";
    return;
  }
  node.innerHTML = logs
    .map(
      (log) =>
        `<p><strong>${log.status}</strong> - ${log.executed_by.full_name} - ${new Date(log.created_at).toLocaleString()}<br/>${log.notes || ""}</p>`
    )
    .join("");
}

document.getElementById("load-operator-tasks").addEventListener("click", async () => {
  try {
    await loadOperatorTasks();
  } catch (error) {
    alert(error.message);
  }
});

setView();
loadMe();
