document.addEventListener("DOMContentLoaded", () => {
  const typeSelect = document.getElementById("adminFileType");
  const panel = document.getElementById("adminFilesPanel");
  const tableBody = document.querySelector("#adminFilesTable tbody");
  const deleteModal = document.getElementById("deleteModal");
  const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");
  const deleteCancelBtn = document.getElementById("deleteCancelBtn");

  // Filtros por columna
  const filterNombre = document.getElementById("filterNombre");
  const filterNomenclatura = document.getElementById("filterNomenclatura");
  const filterFecha = document.getElementById("filterFecha");
  const filterUsuario = document.getElementById("filterUsuario");

  let filesList = [];

  function applyColumnFilters() {
    let filtered = filesList;
    if (filterNombre && filterNombre.value.trim() !== "") {
      const val = filterNombre.value.trim().toLowerCase();
      filtered = filtered.filter((file) => {
        return (
          (file.adminFileName &&
            String(file.adminFileName).toLowerCase().includes(val)) ||
          (file.fileName && String(file.fileName).toLowerCase().includes(val))
        );
      });
    }
    if (filterNomenclatura && filterNomenclatura.value.trim() !== "") {
      const val = filterNomenclatura.value.trim().toLowerCase();
      filtered = filtered.filter((file) => {
        return (
          (file.lastDownloadedName &&
            String(file.lastDownloadedName).toLowerCase().includes(val)) ||
          (file.nomenclature &&
            String(file.nomenclature).toLowerCase().includes(val))
        );
      });
    }
    if (filterFecha && filterFecha.value.trim() !== "") {
      const val = filterFecha.value.trim().toLowerCase();
      filtered = filtered.filter((file) => {
        const created = file.createdAt
          ? formatDate(file.createdAt).toLowerCase()
          : "";
        const updated = file.updatedAt
          ? formatDate(file.updatedAt).toLowerCase()
          : "";
        return created.includes(val) || updated.includes(val);
      });
    }
    if (filterUsuario && filterUsuario.value.trim() !== "") {
      const val = filterUsuario.value.trim().toLowerCase();
      filtered = filtered.filter((file) => {
        const user = file.createdBy || file.userId || "";
        const userLabel = userCache.get(user) || user;
        return String(userLabel).toLowerCase().includes(val);
      });
    }
    if (
      filtered.length &&
      (filtered[0].adminFileName || filtered[0].lastDownloadedName)
    ) {
      renderDocuments(filtered);
    } else {
      renderRows(filtered);
    }
  }

  [filterNombre, filterNomenclatura, filterFecha, filterUsuario].forEach(
    (input) => {
      if (input) {
        input.addEventListener("input", applyColumnFilters);
      }
    },
  );

  if (!typeSelect || !panel || !tableBody) return;
  let currentDocType = "";
  let pendingDeleteId = "";
  let usersLoaded = false;

  const userCache = new Map();

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  const getFileName = (job) => {
    const customName =
      job &&
      job.conversionOptions &&
      typeof job.conversionOptions.displayName === "string"
        ? job.conversionOptions.displayName.trim()
        : "";
    if (customName) return customName;
    if (job && job.convertedFilePath) {
      const parts = String(job.convertedFilePath).split(/[/\\]/);
      return parts[parts.length - 1] || "-";
    }
    return job && job.fileName ? job.fileName : "-";
  };

  const getAdminDocName = (doc) => {
    if (doc && doc.adminFileName) return doc.adminFileName;
    return doc && doc._id ? String(doc._id) : "-";
  };

  const renderEmpty = (message) => {
    tableBody.innerHTML = "";
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
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

  const renderDocuments = (docs, docType) => {
    filesList = docs; // <-- Actualiza la lista global para los filtros
    tableBody.innerHTML = "";
    if (!docs.length) {
      renderEmpty("No hay informacion para este tipo.");
      return;
    }
    docs.forEach((doc) => {
      const row = document.createElement("tr");
      const nameCell = document.createElement("td");
      nameCell.textContent = getAdminDocName(doc);
      const nomenclatureCell = document.createElement("td");
      nomenclatureCell.textContent = doc.lastDownloadedName || "-";
      const updatedCell = document.createElement("td");
      updatedCell.textContent = formatDate(doc.updatedAt || doc.createdAt);
      const userCell = document.createElement("td");
      const userId = doc.updatedBy
        ? String(doc.updatedBy)
        : doc.createdBy
          ? String(doc.createdBy)
          : "";
      const userLabel = userCache.get(userId) || userId || "N/A";
      userCell.textContent = userLabel;
      const actionsCell = document.createElement("td");
      const actionsWrap = document.createElement("div");
      actionsWrap.className = "admin-actions";
      const downloadBtn = document.createElement("button");
      downloadBtn.type = "button";
      downloadBtn.className = "admin-action-btn download-btn";
      downloadBtn.title = "Descargar";
      downloadBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4v8m0 0l-4-4m4 4l4-4"/><rect x="4" y="16" width="12" height="2" rx="1"/></svg>`;
      downloadBtn.addEventListener("click", () => {
        window.location.href = `/api/files/admin-files/${doc._id}/download?type=${docType}`;
      });
      const updateBtn = document.createElement("button");
      updateBtn.type = "button";
      updateBtn.className = "admin-action-btn update-btn";
      updateBtn.title = "Actualizar";
      updateBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17.25V21h3.75l11.06-11.06a1.06 1.06 0 0 0 0-1.5l-2.25-2.25a1.06 1.06 0 0 0-1.5 0L3 17.25z"/></svg>`;
      updateBtn.addEventListener("click", () => {
        window.location.href = `/file-creation?edit=${doc._id}&type=${docType}`;
      });
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "admin-action-btn delete-btn";
      deleteBtn.title = "Borrar";
      deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="14" height="11" rx="2"/><path d="M8 9v5m4-5v5M5 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/></svg>`;
      deleteBtn.addEventListener("click", () => {
        pendingDeleteId = doc._id;
        if (deleteModal) deleteModal.classList.remove("hidden");
      });
      actionsWrap.style.display = "flex";
      actionsWrap.style.gap = "4px";
      actionsWrap.appendChild(downloadBtn);
      actionsWrap.appendChild(updateBtn);
      actionsWrap.appendChild(deleteBtn);
      actionsCell.appendChild(actionsWrap);
      row.appendChild(nameCell);
      row.appendChild(nomenclatureCell);
      row.appendChild(updatedCell);
      row.appendChild(userCell);
      row.appendChild(actionsCell);
      tableBody.appendChild(row);
    });
  };

  const loadUsers = async () => {
    if (usersLoaded) return;
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        usersLoaded = false;
        return;
      }
      const users = await response.json();
      if (!Array.isArray(users)) {
        usersLoaded = false;
        return;
      }
      users.forEach((user) => {
        if (!user || !user.id) return;
        const label = user.displayName || user.email || user.id;
        userCache.set(user.id, label);
      });
      usersLoaded = true;
    } catch (error) {
      usersLoaded = false;
      console.warn("No se pudo cargar el catalogo de usuarios", error);
    }
  };

  const loadJobsForType = async (docType) => {
    panel.classList.remove("hidden");
    currentDocType = docType || "";
    if (!docType) {
      renderEmpty("Seleccione un tipo de archivo.");
      return;
    }

    renderEmpty("Cargando...");

    if (docType === "finishedProduct") {
      try {
        await loadUsers();
        const response = await fetch(
          "/api/files/admin-files?type=finishedProduct&limit=200",
        );
        if (!response.ok) {
          renderEmpty("Error al cargar los archivos.");
          return;
        }
        const data = await response.json();
        const docs = Array.isArray(data.documents) ? data.documents : [];
        renderDocuments(docs, docType);
      } catch (error) {
        console.error("Error loading docs:", error);
        renderEmpty("Error al cargar los archivos.");
      }
      return;
    }

    if (docType === "billOfMaterials") {
      try {
        await loadUsers();
        const response = await fetch(
          "/api/files/admin-files?type=billOfMaterials&limit=200",
        );
        if (!response.ok) {
          renderEmpty("Error al cargar los archivos.");
          return;
        }
        const data = await response.json();
        const docs = Array.isArray(data.documents) ? data.documents : [];
        renderDocuments(docs, docType);
      } catch (error) {
        console.error("Error loading docs:", error);
        renderEmpty("Error al cargar los archivos.");
      }
      return;
    }

    if (docType === "rawMaterial") {
      try {
        await loadUsers();
        const response = await fetch(
          "/api/files/admin-files?type=rawMaterial&limit=200",
        );
        if (!response.ok) {
          renderEmpty("Error al cargar los archivos.");
          return;
        }
        const data = await response.json();
        const docs = Array.isArray(data.documents) ? data.documents : [];
        renderDocuments(docs, docType);
      } catch (error) {
        console.error("Error loading docs:", error);
        renderEmpty("Error al cargar los archivos.");
      }
      return;
    }

    if (docType === "splScrap") {
      try {
        await loadUsers();
        const response = await fetch(
          "/api/files/admin-files?type=splScrap&limit=200",
        );
        if (!response.ok) {
          renderEmpty("Error al cargar los archivos.");
          return;
        }
        const data = await response.json();
        const docs = Array.isArray(data.documents) ? data.documents : [];
        renderDocuments(docs, docType);
      } catch (error) {
        console.error("Error loading docs:", error);
        renderEmpty("Error al cargar los archivos.");
      }
      return;
    }

    renderEmpty("Este tipo aun no esta habilitado.");
  };

  panel.classList.remove("hidden");
  renderEmpty("Seleccione un tipo de archivo.");
  loadUsers();

  typeSelect.addEventListener("change", (e) => {
    loadJobsForType(e.target.value);
  });

  const urlParams = new URLSearchParams(window.location.search);
  const preselectedType = urlParams.get("type");
  if (
    preselectedType &&
    typeSelect.querySelector(`option[value="${preselectedType}"]`)
  ) {
    typeSelect.value = preselectedType;
  }

  if (typeSelect.value) {
    loadJobsForType(typeSelect.value);
  }

  if (deleteCancelBtn) {
    deleteCancelBtn.addEventListener("click", () => {
      pendingDeleteId = "";
      if (deleteModal) deleteModal.classList.add("hidden");
    });
  }

  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener("click", () => {
      if (!pendingDeleteId) return;
      deleteConfirmBtn.disabled = true;
      fetch(
        `/api/files/admin-files/${pendingDeleteId}?type=${currentDocType}`,
        {
          method: "DELETE",
        },
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("No se pudo borrar el archivo.");
          }
          return response.json();
        })
        .then(() => {
          if (deleteModal) deleteModal.classList.add("hidden");
          pendingDeleteId = "";
          loadJobsForType(currentDocType || "finishedProduct");
        })
        .catch((error) => {
          console.error("Error deleting doc:", error);
        })
        .finally(() => {
          deleteConfirmBtn.disabled = false;
        });
    });
  }

  if (deleteModal) {
    deleteModal.addEventListener("click", (e) => {
      if (e.target === deleteModal) {
        pendingDeleteId = "";
        deleteModal.classList.add("hidden");
      }
    });
  }
});
