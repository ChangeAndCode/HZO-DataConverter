document.addEventListener("DOMContentLoaded", () => {
  const typeSelect = document.getElementById("adminFileType");
  const panel = document.getElementById("adminFilesPanel");
  const tableBody = document.querySelector("#adminFilesTable tbody");

  if (!typeSelect || !panel || !tableBody) return;

  const userCache = new Map();

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  const getFileName = (job) => {
    if (job && job.convertedFilePath) {
      const parts = String(job.convertedFilePath).split(/[/\\]/);
      return parts[parts.length - 1] || "-";
    }
    return job && job.fileName ? job.fileName : "-";
  };

  const renderEmpty = (message) => {
    tableBody.innerHTML = "";
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "no-jobs";
    cell.textContent = message;
    row.appendChild(cell);
    tableBody.appendChild(row);
  };

  const renderRows = (jobs) => {
    tableBody.innerHTML = "";

    if (!jobs.length) {
      renderEmpty("No hay informacion para este tipo.");
      return;
    }

    jobs.forEach((job) => {
      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      nameCell.textContent = getFileName(job);

      const updatedCell = document.createElement("td");
      updatedCell.textContent = formatDate(job.completedAt || job.createdAt);

      const userCell = document.createElement("td");
      const userLabel = userCache.get(job.userId) || job.userId || "N/A";
      userCell.textContent = userLabel;

      const actionsCell = document.createElement("td");
      const actionsWrap = document.createElement("div");
      actionsWrap.className = "admin-actions";

      const updateBtn = document.createElement("button");
      updateBtn.type = "button";
      updateBtn.textContent = "Actualizar";
      updateBtn.addEventListener("click", () => {
        console.log("Actualizar no implementado", job);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "row-remove-btn";
      deleteBtn.textContent = "Borrar";
      deleteBtn.addEventListener("click", () => {
        console.log("Borrar no implementado", job);
      });

      actionsWrap.appendChild(updateBtn);
      actionsWrap.appendChild(deleteBtn);
      actionsCell.appendChild(actionsWrap);

      row.appendChild(nameCell);
      row.appendChild(updatedCell);
      row.appendChild(userCell);
      row.appendChild(actionsCell);

      tableBody.appendChild(row);
    });
  };

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) return;
      const users = await response.json();
      if (!Array.isArray(users)) return;
      users.forEach((user) => {
        if (!user || !user.id) return;
        const label = user.displayName || user.email || user.id;
        userCache.set(user.id, label);
      });
    } catch (error) {
      console.warn("No se pudo cargar el catalogo de usuarios", error);
    }
  };

  const loadJobsForType = async (docType) => {
    panel.classList.remove("hidden");
    if (!docType) {
      renderEmpty("Seleccione un tipo de archivo.");
      return;
    }

    renderEmpty("Cargando...");

    try {
      const response = await fetch("/api/conversion-jobs?page=1&limit=200");
      if (!response.ok) {
        renderEmpty("Error al cargar los archivos.");
        return;
      }
      const data = await response.json();
      const jobs = Array.isArray(data.jobs) ? data.jobs : [];
      const filtered = jobs.filter(
        (job) => job && job.conversionOptions && job.conversionOptions.documentType === docType
      );
      renderRows(filtered);
    } catch (error) {
      console.error("Error loading jobs:", error);
      renderEmpty("Error al cargar los archivos.");
    }
  };

  panel.classList.remove("hidden");
  renderEmpty("Seleccione un tipo de archivo.");
  loadUsers();

  typeSelect.addEventListener("change", (e) => {
    loadJobsForType(e.target.value);
  });

  if (typeSelect.value) {
    loadJobsForType(typeSelect.value);
  }
});
