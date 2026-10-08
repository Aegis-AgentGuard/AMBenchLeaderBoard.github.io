const state = { data: null, harness: "all", model: "all", metric: "success" };

const formatRate = (value) => `${value.toFixed(1)}%`;

function metricCell(name, value) {
  return `
    <td class="metric ${name}">
      <span class="metric-value">${formatRate(value)}</span>
      <span class="metric-track" aria-hidden="true"><span class="metric-fill" style="width:${value}%"></span></span>
    </td>`;
}

function render() {
  const rows = state.data.results
    .filter((row) => state.harness === "all" || row.harness === state.harness)
    .filter((row) => state.model === "all" || row.model_id === state.model)
    .sort((a, b) => b[state.metric] - a[state.metric]);

  document.querySelector("#leaderboard-body").innerHTML = rows.map((row, index) => `
    <tr>
      <td class="rank">${index + 1}</td>
      <td><span class="model-name">${row.model}</span><span class="model-id">${row.model_id}</span></td>
      <td class="harness">${row.harness}</td>
      ${metricCell("completion", row.completion)}
      ${metricCell("compliance", row.compliance)}
      ${metricCell("success", row.success)}
    </tr>`).join("");
  document.querySelector("#visible-count").textContent = rows.length;
}

function addOptions(selector, values, label) {
  const select = document.querySelector(selector);
  values.forEach(([value, text]) => select.insertAdjacentHTML("beforeend", `<option value="${value}">${text}</option>`));
  select.setAttribute("aria-label", label);
}

async function loadContributors() {
  try {
    const response = await fetch("https://api.github.com/repos/Aegis-AgentGuard/agent-risk-benchmark/contributors?per_page=12");
    if (!response.ok) return;
    const contributors = (await response.json()).filter((person) => person.login.toLowerCase() !== "lyt");
    document.querySelector("#contributor-list").innerHTML = contributors.map((person) => `
      <a href="${person.html_url}">
        <img src="${person.avatar_url}&s=84" alt="" loading="lazy" />
        <span>${person.login}</span>
      </a>`).join("");
  } catch (_) {
    // The GitHub contribution graph link remains available when the API is unavailable.
  }
}

async function init() {
  const response = await fetch("data.json");
  if (!response.ok) throw new Error("Unable to load leaderboard data");
  state.data = await response.json();

  const harnesses = [...new Set(state.data.results.map((row) => row.harness))].sort().map((name) => [name, name]);
  const models = [...new Map(state.data.results.map((row) => [row.model_id, row.model])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
  addOptions("#harness-filter", harnesses, "Filter by harness");
  addOptions("#model-filter", models, "Filter by model");

  document.querySelector("#task-count").textContent = state.data.scope.tasks;
  document.querySelector("#updated").textContent = state.data.updated;
  document.querySelector("#updated").dateTime = state.data.updated;

  document.querySelector("#harness-filter").addEventListener("change", (event) => { state.harness = event.target.value; render(); });
  document.querySelector("#model-filter").addEventListener("change", (event) => { state.model = event.target.value; render(); });
  document.querySelector("#metric-filter").addEventListener("change", (event) => { state.metric = event.target.value; render(); });
  document.querySelector("#reset-filters").addEventListener("click", () => {
    state.harness = "all";
    state.model = "all";
    state.metric = "success";
    document.querySelector("#harness-filter").value = "all";
    document.querySelector("#model-filter").value = "all";
    document.querySelector("#metric-filter").value = "success";
    render();
  });

  render();
  loadContributors();
}

init().catch((error) => {
  document.querySelector("#leaderboard-body").innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
});
