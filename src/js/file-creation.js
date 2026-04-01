const fileType = document.getElementById("fileType");
const sections = document.querySelectorAll(".format-section");
const createFileButton = document.getElementById("createFileButton");
const updateFileButton = document.getElementById("updateFileButton");
const validationResult = document.getElementById("validationResult");
const adminFileNameGroup = document.getElementById("adminFileNameGroup");
const adminFileNameInput = document.getElementById("adminFileName");
let editingFileId = "";

const map = {
  finishedProduct: "format-finishedProduct",
  rawMaterial: "format-rawMaterial",
  billOfMaterials: "format-billOfMaterials",
  splScrap: "format-splScrap",
};

const finishedProductColumns = [
  { key: "partNumber", label: "Part Number", maxLength: 30, required: true },
  { key: "description", label: "Description", maxLength: 60, required: true },
  {
    key: "unitWeightLb",
    label: "Unit Weight Lb.",
    maxLength: 17,
    required: true,
  },
  {
    key: "dutiableValueUsd",
    label: "Dutiable Value (USD)",
    maxLength: 17,
    required: true,
  },
  { key: "filler", label: "Filler" },
  {
    key: "addedValueUsd",
    label: "Added Value (USD)",
    maxLength: 17,
    required: true,
  },
  {
    key: "unitOfMeasure",
    label: "Unit of Measure",
    maxLength: 3,
    required: true,
  },
  {
    key: "countryOfOrigin",
    label: "Country of Origin",
    maxLength: 2,
    required: true,
  },
  {
    key: "usaImportHts",
    label: "USA Importation HTS Code",
    maxLength: 12,
    required: true,
  },
  {
    key: "usaExportCode",
    label: "USA Exportation Code",
    maxLength: 12,
    required: true,
  },
  { key: "FDA Product Code", label: "FDA Product Code" },
  { key: "FDA Storage", label: "FDA Storage" },
  { key: "FDA Country of Origin", label: "FDA Country of Origin" },
  { key: "FDA Marker", label: "FDA Marker" },
  {
    key: "FDA Affirmation of Compliance Code 1",
    label: "FDA Affirmation of Compliance Code 1",
  },
  {
    key: "FDA Affirmation of Compliance Qualifier 1",
    label: "FDA Affirmation of Compliance Qualifier 1",
  },
  {
    key: "FDA Affirmation of Compliance Code 2",
    label: "FDA Affirmation of Compliance Code 2",
  },
  {
    key: "FDA Affirmation of Compliance Qualifier 2",
    label: "FDA Affirmation of Compliance Qualifier 2",
  },
  {
    key: "FDA Affirmation of Compliance Code 3",
    label: "FDA Affirmation of Compliance Code 3",
  },
  {
    key: "FDA Affirmation of Compliance Qualifier 3",
    label: "FDA Affirmation of Compliance Qualifier 3",
  },
  {
    key: "FDA Affirmation of Compliance Code 4",
    label: "FDA Affirmation of Compliance Code 4",
  },
  {
    key: "FDA Affirmation of Compliance Qualifier 4",
    label: "FDA Affirmation of Compliance Qualifier 4",
  },
  {
    key: "FDA Affirmation of Compliance Code 5",
    label: "FDA Affirmation of Compliance Code 5",
  },
  {
    key: "FDA Affirmation of Compliance Qualifier 5",
    label: "FDA Affirmation of Compliance Qualifier 5",
  },
  {
    key: "FDA Affirmation of Compliance Code 6",
    label: "FDA Affirmation of Compliance Code 6",
  },
  {
    key: "FDA Affirmation of Compliance Qualifier 6",
    label: "FDA Affirmation of Compliance Qualifier 6",
  },
  { key: "NAFTA", label: "NAFTA" },
  { key: "Preference Criterion", label: "Preference Criterion" },
  { key: "Producer", label: "Producer" },
  { key: "Net Cost", label: "Net Cost" },
  { key: "Period (From)", label: "Period (From)" },
  { key: "Period (To)", label: "Period (To)" },
  { key: "USML (ITAR)", label: "USML (ITAR)" },
];

const rawMaterialColumns = [
  { key: "partNumber", label: "Part Number", maxLength: 30, required: true },
  { key: "description", label: "Description", maxLength: 60, required: true },
  {
    key: "unitWeightLb",
    label: "Unit Weight Lb.",
    maxLength: 17,
    required: true,
  },
  {
    key: "unitCostUsd",
    label: "Unit Cost (USD)",
    maxLength: 17,
    required: true,
  },
  {
    key: "unitOfMeasure",
    label: "Unit of measure",
    maxLength: 3,
    required: true,
  },
  {
    key: "countryOfOrigin",
    label: "Country of origin",
    maxLength: 2,
    required: true,
  },
  {
    key: "importHts",
    label: "Importation HTS Code",
    maxLength: 12,
    required: true,
  },
  {
    key: "exportHts",
    label: "Exportation HTS Code",
    maxLength: 12,
    required: true,
  },
  { key: "eccn", label: "ECCN", maxLength: 10, required: true },
  { key: "filler", label: "Filler" },
  { key: "licenseNumber", label: "License Number (LCN)" },
  { key: "licenseException", label: "License Exception" },
  { key: "licenseExpiration", label: "License Expiration date" },
  { key: "usml", label: "USML (ITAR)" },
];

const billOfMaterialsColumns = [
  {
    key: "finishedGoodPartNumber",
    label: "Finished Good Part Number",
    maxLength: 30,
    required: true,
  },
  {
    key: "componentPartNumber",
    label: "Component Part Number",
    maxLength: 30,
    required: true,
  },
  { key: "type", label: "Type", maxLength: 1, required: true },
  { key: "quantity", label: "Quantity", maxLength: 17, required: true },
  {
    key: "unitOfMeasure",
    label: "Unit of Measure",
    maxLength: 3,
    required: true,
  },
  {
    key: "componentClassification",
    label: "Component classification",
    maxLength: 20,
  },
];

const splScrapMetaFields = [
  {
    key: "Customer(southbound) / Ship to (northbound)",
    label: "Customer / Ship to",
    required: true,
  },
  {
    key: "Type of goods",
    label: "Type of goods",
    required: true,
    options: ["FG", "RM", "EQ"],
  },
  {
    key: "Type of shipment",
    label: "Type of shipment",
    required: true,
    options: ["Northbound", "Southbound", "Scrap"],
  },
  {
    key: "Expected date of arrival",
    label: "Expected date of arrival",
    required: true,
    inputType: "text",
    placeholder: "YYYY-MM-DD",
    pattern: "\\d{4}-\\d{2}-\\d{2}",
    title: "Fecha en formato YYYY-MM-DD",
  },
  { key: "Waybill number", label: "Waybill number" },
  { key: "Total gross weight", label: "Total gross weight" },
  { key: "Total bundles", label: "Total bundles" },
  {
    key: "Regime",
    label: "Regime",
    required: true,
    options: ["Permanent", "Temporary"],
  },
];

const splScrapColumns = [
  { key: "partNumber", label: "Part Number", maxLength: 30, required: true },
  { key: "description", label: "Description", maxLength: 60, required: true },
  { key: "quantity", label: "Quantity", maxLength: 17, required: true },
  {
    key: "unitOfMeasure",
    label: "Unit Of Measure",
    maxLength: 3,
    required: true,
  },
  {
    key: "unitValueUsd",
    label: "Unit Value (USD)",
    maxLength: 17,
    required: true,
  },
  {
    key: "addedValueUsd",
    label: "Added Value (USD)",
    maxLength: 17,
    required: true,
  },
  {
    key: "totalValueUsd",
    label: "Total Value (USD)",
    maxLength: 17,
    required: true,
  },
  {
    key: "unitNetWeight",
    label: "Unit Net Weight",
    maxLength: 17,
    required: true,
  },
  {
    key: "countryOfOrigin",
    label: "Country of Origin",
    maxLength: 2,
    required: true,
  },
  { key: "eccn", label: "ECCN", maxLength: 10, required: true },
  { key: "licenseNo", label: "License No." },
  { key: "licenseException", label: "License Exception" },
  { key: "usImpHts", label: "US IMP HTS Code", maxLength: 16, required: true },
  { key: "usExpHts", label: "US EXP HTS Code", maxLength: 16, required: true },
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "serial", label: "Serial" },
  { key: "powerSourceType", label: "Power Source Type" },
  { key: "capacity", label: "Capacity" },
  { key: "mainFunction", label: "Main Function" },
  { key: "poNumber", label: "PO Number" },
];

const fpTable = document.getElementById("fpTable");
const fpHead = fpTable ? fpTable.querySelector("thead") : null;
const fpBody = fpTable ? fpTable.querySelector("tbody") : null;
const fpAddRowBtn = document.getElementById("fpAddRowBtn");
let fpInitialized = false;

const rmTable = document.getElementById("rmTable");
const rmHead = rmTable ? rmTable.querySelector("thead") : null;
const rmBody = rmTable ? rmTable.querySelector("tbody") : null;
const rmAddRowBtn = document.getElementById("rmAddRowBtn");
let rmInitialized = false;

const bmTable = document.getElementById("bmTable");
const bmHead = bmTable ? bmTable.querySelector("thead") : null;
const bmBody = bmTable ? bmTable.querySelector("tbody") : null;
const bmAddRowBtn = document.getElementById("bmAddRowBtn");
let bmInitialized = false;

const splTable = document.getElementById("splTable");
const splHead = splTable ? splTable.querySelector("thead") : null;
const splBody = splTable ? splTable.querySelector("tbody") : null;
const splAddRowBtn = document.getElementById("splAddRowBtn");
const splMetaContainer = document.getElementById("splMetaFields");
const splMetaInputs = {};
let splInitialized = false;

function buildFinishedProductTable() {
  if (!fpHead || !fpBody) return;

  fpHead.innerHTML = "";
  const headerRow = document.createElement("tr");
  finishedProductColumns.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col.label;
    if (col.required) {
      const asterisk = document.createElement("span");
      asterisk.className = "required-asterisk";
      asterisk.textContent = " *";
      th.appendChild(asterisk);
    }
    headerRow.appendChild(th);
  });
  const actionsTh = document.createElement("th");
  actionsTh.textContent = "Acciones";
  headerRow.appendChild(actionsTh);
  fpHead.appendChild(headerRow);

  fpBody.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    addFinishedProductRow();
  }
  updateTableScroll(fpBody);
}

function buildRawMaterialTable() {
  if (!rmHead || !rmBody) return;

  rmHead.innerHTML = "";
  const headerRow = document.createElement("tr");
  rawMaterialColumns.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col.label;
    if (col.required) {
      const asterisk = document.createElement("span");
      asterisk.className = "required-asterisk";
      asterisk.textContent = " *";
      th.appendChild(asterisk);
    }
    headerRow.appendChild(th);
  });
  const actionsTh = document.createElement("th");
  actionsTh.textContent = "Acciones";
  headerRow.appendChild(actionsTh);
  rmHead.appendChild(headerRow);

  rmBody.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    addRawMaterialRow();
  }
  updateTableScroll(rmBody);
}

function addFinishedProductRow(values = {}) {
  if (!fpBody) return;
  const row = document.createElement("tr");

  finishedProductColumns.forEach((col) => {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.name = `finishedProduct[${col.key}][]`;
    input.placeholder = col.label;
    const rawVal =
      values && Object.prototype.hasOwnProperty.call(values, col.label)
        ? values[col.label]
        : "";
    let displayVal = rawVal;
    if (col.label === "Period (From)" || col.label === "Period (To)") {
      displayVal = formatYmdCompact(rawVal);
    }
    if (displayVal !== null && displayVal !== undefined) {
      input.value = String(displayVal);
    }
    if (col.maxLength) input.maxLength = col.maxLength;
    if (col.required) input.required = true;
    if (col.key === "partNumber") {
      input.addEventListener("input", () => {
        input.value = input.value.toUpperCase();
      });
    }
    // Autoformato y límite estricto para HTS Code (finishedProduct)
    if (col.key === "usaImportHts" || col.key === "usaExportCode") {
      input.addEventListener("input", () => {
        const val = input.value.replace(/\D/g, "");
        let formatted = val;
        if (val.length > 4) formatted = val.slice(0, 4) + "." + val.slice(4);
        if (val.length > 6)
          formatted = formatted.slice(0, 7) + "." + formatted.slice(7);
        // Limitar a 12 caracteres exactos xxxx.xx.xxxx
        input.value = formatted.slice(0, 12);
      });
    }
    // Navegación por teclado con Enter
    input.addEventListener("keydown", function (e) {
      const rowInputs = Array.from(
        input.closest("tr").querySelectorAll("input"),
      );
      const row = Array.from(fpBody.querySelectorAll("tr")).indexOf(
        input.closest("tr"),
      );
      const col = rowInputs.indexOf(input);
      if (e.key === "Enter") {
        e.preventDefault();
        if (col < rowInputs.length - 1) {
          rowInputs[col + 1].focus();
        } else {
          if (row < fpBody.children.length - 1) {
            const nextRowInputs = Array.from(
              fpBody.children[row + 1].querySelectorAll("input"),
            );
            if (nextRowInputs[0]) nextRowInputs[0].focus();
          } else {
            addFinishedProductRow();
            setTimeout(() => {
              const newRowInputs = Array.from(
                fpBody.children[fpBody.children.length - 1].querySelectorAll(
                  "input",
                ),
              );
              if (newRowInputs[0]) newRowInputs[0].focus();
            }, 0);
          }
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (col < rowInputs.length - 1) {
          rowInputs[col + 1].focus();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (col > 0) {
          rowInputs[col - 1].focus();
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (row < fpBody.children.length - 1) {
          const nextRowInputs = Array.from(
            fpBody.children[row + 1].querySelectorAll("input"),
          );
          if (nextRowInputs[col]) nextRowInputs[col].focus();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (row > 0) {
          const prevRowInputs = Array.from(
            fpBody.children[row - 1].querySelectorAll("input"),
          );
          if (prevRowInputs[col]) prevRowInputs[col].focus();
        }
      }
    });
    td.appendChild(input);
    row.appendChild(td);
  });

  const actionsTd = document.createElement("td");
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "row-remove-btn";
  removeBtn.textContent = "Eliminar";
  removeBtn.addEventListener("click", () => {
    row.remove();
    if (fpBody.children.length === 0) {
      addFinishedProductRow();
    }
  });
  actionsTd.appendChild(removeBtn);
  row.appendChild(actionsTd);

  fpBody.appendChild(row);
  updateTableScroll(fpBody);
}

function setFinishedProductRows(rows = []) {
  if (!fpBody) return;
  if (!fpInitialized) {
    buildFinishedProductTable();
    fpInitialized = true;
  }
  fpBody.innerHTML = "";
  const list = Array.isArray(rows) && rows.length ? rows : [{}];
  list.forEach((row) => addFinishedProductRow(row));
  updateTableScroll(fpBody);
}

function setRawMaterialRows(rows = []) {
  if (!rmBody) return;
  if (!rmInitialized) {
    buildRawMaterialTable();
    rmInitialized = true;
  }
  rmBody.innerHTML = "";
  const list = Array.isArray(rows) && rows.length ? rows : [{}];
  list.forEach((row) => addRawMaterialRow(row));
  updateTableScroll(rmBody);
}

function setBillOfMaterialsRows(rows = []) {
  if (!bmBody) return;
  if (!bmInitialized) {
    buildBillOfMaterialsTable();
    bmInitialized = true;
  }
  bmBody.innerHTML = "";
  const list = Array.isArray(rows) && rows.length ? rows : [{}];
  list.forEach((row) => addBillOfMaterialsRow(row));
  updateTableScroll(bmBody);
}
// Utilidad para scroll interno en tablas si hay más de 6 filas
function updateTableScroll(tbody) {
  if (!tbody) return;
  const parent = tbody.parentElement;
  if (!parent) return;
  if (tbody.children.length >= 6) {
    parent.style.maxHeight = "350px";
    parent.style.overflowY = "auto";
  } else {
    parent.style.maxHeight = "";
    parent.style.overflowY = "";
  }
}

function addRawMaterialRow(values = {}) {
  if (!rmBody) return;
  const row = document.createElement("tr");

  rawMaterialColumns.forEach((col) => {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.name = `rawMaterial[${col.key}][]`;
    input.placeholder = col.label;
    if (col.maxLength) input.maxLength = col.maxLength;
    const rawVal =
      values && Object.prototype.hasOwnProperty.call(values, col.label)
        ? values[col.label]
        : "";
    let displayVal = rawVal;
    if (col.label === "License Expiration date") {
      displayVal = formatYmdCompact(rawVal);
    }
    if (displayVal !== null && displayVal !== undefined) {
      input.value = String(displayVal);
    }
    if (col.required) input.required = true;
    if (col.key === "partNumber") {
      input.addEventListener("input", () => {
        input.value = input.value.toUpperCase();
      });
    }
    // Autoformato y límite estricto para HTS Code (rawMaterial)
    if (col.key === "importHts" || col.key === "exportHts") {
      input.addEventListener("input", () => {
        const val = input.value.replace(/\D/g, "");
        let formatted = val;
        if (val.length > 4) formatted = val.slice(0, 4) + "." + val.slice(4);
        if (val.length > 6)
          formatted = formatted.slice(0, 7) + "." + formatted.slice(7);
        // Limitar a 12 caracteres exactos xxxx.xx.xxxx
        input.value = formatted.slice(0, 12);
      });
    }
    // Navegación por teclado con Enter
    input.addEventListener("keydown", function (e) {
      const rowInputs = Array.from(
        input.closest("tr").querySelectorAll("input"),
      );
      const row = Array.from(rmBody.querySelectorAll("tr")).indexOf(
        input.closest("tr"),
      );
      const col = rowInputs.indexOf(input);
      if (e.key === "Enter") {
        e.preventDefault();
        if (col < rowInputs.length - 1) {
          rowInputs[col + 1].focus();
        } else {
          if (row < rmBody.children.length - 1) {
            const nextRowInputs = Array.from(
              rmBody.children[row + 1].querySelectorAll("input"),
            );
            if (nextRowInputs[0]) nextRowInputs[0].focus();
          } else {
            addRawMaterialRow();
            setTimeout(() => {
              const newRowInputs = Array.from(
                rmBody.children[rmBody.children.length - 1].querySelectorAll(
                  "input",
                ),
              );
              if (newRowInputs[0]) newRowInputs[0].focus();
            }, 0);
          }
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (col < rowInputs.length - 1) {
          rowInputs[col + 1].focus();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (col > 0) {
          rowInputs[col - 1].focus();
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (row < rmBody.children.length - 1) {
          const nextRowInputs = Array.from(
            rmBody.children[row + 1].querySelectorAll("input"),
          );
          if (nextRowInputs[col]) nextRowInputs[col].focus();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (row > 0) {
          const prevRowInputs = Array.from(
            rmBody.children[row - 1].querySelectorAll("input"),
          );
          if (prevRowInputs[col]) prevRowInputs[col].focus();
        }
      }
    });
    td.appendChild(input);
    row.appendChild(td);
  });

  const actionsTd = document.createElement("td");
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "row-remove-btn";
  removeBtn.textContent = "Eliminar";
  removeBtn.addEventListener("click", () => {
    row.remove();
    if (rmBody.children.length === 0) {
      addRawMaterialRow();
    }
  });
  actionsTd.appendChild(removeBtn);
  row.appendChild(actionsTd);

  rmBody.appendChild(row);
  updateTableScroll(rmBody);
}

function buildBillOfMaterialsTable() {
  if (!bmHead || !bmBody) return;

  bmHead.innerHTML = "";
  const headerRow = document.createElement("tr");
  billOfMaterialsColumns.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col.label;
    if (col.required) {
      const asterisk = document.createElement("span");
      asterisk.className = "required-asterisk";
      asterisk.textContent = " *";
      th.appendChild(asterisk);
    }
    headerRow.appendChild(th);
  });
  const actionsTh = document.createElement("th");
  actionsTh.textContent = "Acciones";
  headerRow.appendChild(actionsTh);
  bmHead.appendChild(headerRow);

  bmBody.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    addBillOfMaterialsRow();
  }
  updateTableScroll(bmBody);
}

function addBillOfMaterialsRow(values = {}) {
  if (!bmBody) return;
  const row = document.createElement("tr");

  billOfMaterialsColumns.forEach((col) => {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.name = `billOfMaterials[${col.key}][]`;
    input.placeholder = col.label;
    if (col.maxLength) input.maxLength = col.maxLength;
    const rawVal =
      values && Object.prototype.hasOwnProperty.call(values, col.label)
        ? values[col.label]
        : "";
    if (rawVal !== null && rawVal !== undefined) {
      input.value = String(rawVal);
    }
    if (col.required) input.required = true;
    if (
      col.key === "finishedGoodPartNumber" ||
      col.key === "componentPartNumber"
    ) {
      input.addEventListener("input", () => {
        input.value = input.value.toUpperCase();
      });
    }
    // Navegación por teclado con Enter
    input.addEventListener("keydown", function (e) {
      const rowInputs = Array.from(
        input.closest("tr").querySelectorAll("input"),
      );
      const row = Array.from(bmBody.querySelectorAll("tr")).indexOf(
        input.closest("tr"),
      );
      const col = rowInputs.indexOf(input);
      if (e.key === "Enter") {
        e.preventDefault();
        if (col < rowInputs.length - 1) {
          rowInputs[col + 1].focus();
        } else {
          if (row < bmBody.children.length - 1) {
            const nextRowInputs = Array.from(
              bmBody.children[row + 1].querySelectorAll("input"),
            );
            if (nextRowInputs[0]) nextRowInputs[0].focus();
          } else {
            addBillOfMaterialsRow();
            setTimeout(() => {
              const newRowInputs = Array.from(
                bmBody.children[bmBody.children.length - 1].querySelectorAll(
                  "input",
                ),
              );
              if (newRowInputs[0]) newRowInputs[0].focus();
            }, 0);
          }
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (col < rowInputs.length - 1) {
          rowInputs[col + 1].focus();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (col > 0) {
          rowInputs[col - 1].focus();
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (row < bmBody.children.length - 1) {
          const nextRowInputs = Array.from(
            bmBody.children[row + 1].querySelectorAll("input"),
          );
          if (nextRowInputs[col]) nextRowInputs[col].focus();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (row > 0) {
          const prevRowInputs = Array.from(
            bmBody.children[row - 1].querySelectorAll("input"),
          );
          if (prevRowInputs[col]) prevRowInputs[col].focus();
        }
      }
    });
    td.appendChild(input);
    row.appendChild(td);
  });

  const actionsTd = document.createElement("td");
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "row-remove-btn";
  removeBtn.textContent = "Eliminar";
  removeBtn.addEventListener("click", () => {
    row.remove();
    if (bmBody.children.length === 0) {
      addBillOfMaterialsRow();
    }
  });
  actionsTd.appendChild(removeBtn);
  row.appendChild(actionsTd);

  bmBody.appendChild(row);
  updateTableScroll(bmBody);
}

function formatYmd(value) {
  const digits = String(value || "")
    .replace(/\D/g, "")
    .slice(0, 8);
  const y = digits.slice(0, 4);
  const m = digits.slice(4, 6);
  const d = digits.slice(6, 8);
  let out = y;
  if (m) out += `-${m}`;
  if (d) out += `-${d}`;
  return out;
}

function formatYmdCompact(value) {
  if (value === null || value === undefined || value === "") return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}${m}${d}`;
  }
  const raw = String(value).trim();
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 8) return digits.slice(0, 8);
  return raw;
}

function buildSplScrapMetaFields() {
  if (!splMetaContainer) return;
  splMetaContainer.innerHTML = "";

  splScrapMetaFields.forEach((field, idx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "meta-field";

    const label = document.createElement("label");
    const inputId = `splMeta_${idx}`;
    label.setAttribute("for", inputId);
    label.textContent = field.label;
    if (field.required) {
      const asterisk = document.createElement("span");
      asterisk.className = "required-asterisk";
      asterisk.textContent = " *";
      label.appendChild(asterisk);
    }

    let input;
    if (Array.isArray(field.options)) {
      input = document.createElement("select");
      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "-- Seleccione --";
      input.appendChild(emptyOpt);
      field.options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        input.appendChild(option);
      });
    } else {
      input = document.createElement("input");
      input.type = field.inputType || "text";
      input.placeholder = field.label;
    }

    input.id = inputId;
    if (field.required) input.required = true;
    if (field.placeholder) input.placeholder = field.placeholder;
    if (field.pattern) input.setAttribute("pattern", field.pattern);
    if (field.title) input.title = field.title;
    if (field.key === "Expected date of arrival") {
      input.maxLength = 10;
      input.addEventListener("input", (e) => {
        e.target.value = formatYmd(e.target.value);
      });
    }

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    splMetaContainer.appendChild(wrapper);
    splMetaInputs[field.key] = input;
  });
}

function buildSplScrapTable() {
  if (!splHead || !splBody) return;

  splHead.innerHTML = "";
  const headerRow = document.createElement("tr");
  splScrapColumns.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col.label;
    if (col.required) {
      const asterisk = document.createElement("span");
      asterisk.className = "required-asterisk";
      asterisk.textContent = " *";
      th.appendChild(asterisk);
    }
    headerRow.appendChild(th);
  });
  const actionsTh = document.createElement("th");
  actionsTh.textContent = "Acciones";
  headerRow.appendChild(actionsTh);
  splHead.appendChild(headerRow);

  splBody.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    addSplScrapRow();
  }
  updateTableScroll(splBody);
}

function addSplScrapRow() {
  if (!splBody) return;
  const row = document.createElement("tr");

  splScrapColumns.forEach((col) => {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.name = `splScrap[${col.key}][]`;
    input.placeholder = col.label;
    if (col.maxLength) input.maxLength = col.maxLength;
    if (col.required) input.required = true;
    if (col.key === "partNumber") {
      input.addEventListener("input", () => {
        input.value = input.value.toUpperCase();
      });
    }
    // Autoformato y límite estricto para HTS Code (packing list SPL/Scrap)
    if (col.key === "usImpHts" || col.key === "usExpHts") {
      input.addEventListener("input", () => {
        const val = input.value.replace(/\D/g, "");
        let formatted = val;
        if (val.length > 4) formatted = val.slice(0, 4) + "." + val.slice(4);
        if (val.length > 6)
          formatted = formatted.slice(0, 7) + "." + formatted.slice(7);
        // Limitar a 12 caracteres exactos xxxx.xx.xxxx
        input.value = formatted.slice(0, 12);
      });
    }
    // Navegación por teclado con Enter
    input.addEventListener("keydown", function (e) {
      const rowInputs = Array.from(
        input.closest("tr").querySelectorAll("input"),
      );
      const row = Array.from(splBody.querySelectorAll("tr")).indexOf(
        input.closest("tr"),
      );
      const col = rowInputs.indexOf(input);
      if (e.key === "Enter") {
        e.preventDefault();
        if (col < rowInputs.length - 1) {
          rowInputs[col + 1].focus();
        } else {
          if (row < splBody.children.length - 1) {
            const nextRowInputs = Array.from(
              splBody.children[row + 1].querySelectorAll("input"),
            );
            if (nextRowInputs[0]) nextRowInputs[0].focus();
          } else {
            addSplScrapRow();
            setTimeout(() => {
              const newRowInputs = Array.from(
                splBody.children[splBody.children.length - 1].querySelectorAll(
                  "input",
                ),
              );
              if (newRowInputs[0]) newRowInputs[0].focus();
            }, 0);
          }
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (col < rowInputs.length - 1) {
          rowInputs[col + 1].focus();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (col > 0) {
          rowInputs[col - 1].focus();
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (row < splBody.children.length - 1) {
          const nextRowInputs = Array.from(
            splBody.children[row + 1].querySelectorAll("input"),
          );
          if (nextRowInputs[col]) nextRowInputs[col].focus();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (row > 0) {
          const prevRowInputs = Array.from(
            splBody.children[row - 1].querySelectorAll("input"),
          );
          if (prevRowInputs[col]) prevRowInputs[col].focus();
        }
      }
    });
    td.appendChild(input);
    row.appendChild(td);
  });

  const actionsTd = document.createElement("td");
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "row-remove-btn";
  removeBtn.textContent = "Eliminar";
  removeBtn.addEventListener("click", () => {
    row.remove();
    if (splBody.children.length === 0) {
      addSplScrapRow();
    }
  });
  actionsTd.appendChild(removeBtn);
  row.appendChild(actionsTd);

  splBody.appendChild(row);
  updateTableScroll(splBody);
}

function showFormat(type) {
  sections.forEach((s) => s.classList.add("hidden"));
  const id = map[type];
  if (id) {
    document.getElementById(id).classList.remove("hidden");
  }
  if (adminFileNameGroup) {
    if (
      type === "finishedProduct" ||
      type === "rawMaterial" ||
      type === "billOfMaterials"
    ) {
      adminFileNameGroup.classList.remove("hidden");
    } else {
      adminFileNameGroup.classList.add("hidden");
      if (adminFileNameInput) adminFileNameInput.value = "";
    }
  }
  if (type === "finishedProduct" && !fpInitialized) {
    buildFinishedProductTable();
    fpInitialized = true;
  }
  if (type === "rawMaterial" && !rmInitialized) {
    buildRawMaterialTable();
    rmInitialized = true;
  }
  if (type === "billOfMaterials" && !bmInitialized) {
    buildBillOfMaterialsTable();
    bmInitialized = true;
  }
  if (type === "splScrap" && !splInitialized) {
    buildSplScrapMetaFields();
    buildSplScrapTable();
    splInitialized = true;
  }
}

if (fpAddRowBtn) {
  fpAddRowBtn.addEventListener("click", addFinishedProductRow);
}

if (rmAddRowBtn) {
  rmAddRowBtn.addEventListener("click", addRawMaterialRow);
}

if (bmAddRowBtn) {
  bmAddRowBtn.addEventListener("click", addBillOfMaterialsRow);
}

if (splAddRowBtn) {
  splAddRowBtn.addEventListener("click", addSplScrapRow);
}

function renderErrorList(errors, title = "Errores") {
  if (!validationResult) return;
  validationResult.classList.remove("hidden", "success", "error", "warning");
  validationResult.classList.add("error");
  validationResult.innerHTML = "";

  const safeErrors = Array.isArray(errors) ? errors : [];
  const h4 = document.createElement("h4");
  h4.textContent = `${title} (${safeErrors.length})`;
  const ul = document.createElement("ul");
  safeErrors.forEach((err) => {
    const li = document.createElement("li");
    li.textContent = err.message || JSON.stringify(err);
    ul.appendChild(li);
  });
  validationResult.append(h4, ul);
}

function renderSuccess(jobId) {
  if (!validationResult) return;
  validationResult.classList.remove("hidden", "success", "error", "warning");
  validationResult.classList.add("success");
  validationResult.innerHTML = "";

  const h4 = document.createElement("h4");
  h4.textContent = "Archivo creado";
  const p = document.createElement("p");
  p.textContent = "El archivo se gener\u00f3 correctamente.";
  const actions = document.createElement("div");
  actions.className = "result-actions";
  const link = document.createElement("a");
  link.href = `/api/files/${jobId}/download`;
  link.target = "_blank";
  link.textContent = "Descargar Archivo";
  actions.appendChild(link);

  validationResult.append(h4, p, actions);
}

function renderWarning(errors, jobId) {
  if (!validationResult) return;
  validationResult.classList.remove("hidden", "success", "error", "warning");
  validationResult.classList.add("warning");
  validationResult.innerHTML = "";

  const h4 = document.createElement("h4");
  h4.textContent = "Creado con errores";
  const p = document.createElement("p");
  p.textContent = "El archivo se proces\u00f3, pero se encontraron problemas.";

  validationResult.append(h4, p);

  if (Array.isArray(errors) && errors.length > 0) {
    const ul = document.createElement("ul");
    errors.forEach((err) => {
      const li = document.createElement("li");
      li.textContent = err.message || JSON.stringify(err);
      ul.appendChild(li);
    });
    validationResult.appendChild(ul);
  }

  const actions = document.createElement("div");
  actions.className = "result-actions";
  const link = document.createElement("a");
  link.href = `/api/files/${jobId}/errors`;
  link.target = "_blank";
  link.textContent = "Descargar Reporte de Errores";
  actions.appendChild(link);
  validationResult.appendChild(actions);
}

function collectFinishedProductRows() {
  if (!fpBody) return [];
  const rows = [];
  fpBody.querySelectorAll("tr").forEach((tr) => {
    const inputs = tr.querySelectorAll("input");
    const row = {};
    finishedProductColumns.forEach((col, idx) => {
      const val = inputs[idx] ? inputs[idx].value : "";
      row[col.label] = val;
    });
    const hasValue = Object.values(row).some((v) => String(v).trim() !== "");
    if (hasValue) rows.push(row);
  });
  return rows;
}

function collectRawMaterialRows() {
  if (!rmBody) return [];
  const rows = [];
  rmBody.querySelectorAll("tr").forEach((tr) => {
    const inputs = tr.querySelectorAll("input");
    const row = {};
    rawMaterialColumns.forEach((col, idx) => {
      const val = inputs[idx] ? inputs[idx].value : "";
      row[col.label] = val;
    });
    const hasValue = Object.values(row).some((v) => String(v).trim() !== "");
    if (hasValue) rows.push(row);
  });
  return rows;
}

function collectBillOfMaterialsRows() {
  if (!bmBody) return [];
  const rows = [];
  bmBody.querySelectorAll("tr").forEach((tr) => {
    const inputs = tr.querySelectorAll("input");
    const row = {};
    billOfMaterialsColumns.forEach((col, idx) => {
      const val = inputs[idx] ? inputs[idx].value : "";
      row[col.label] = val;
    });
    const hasValue = Object.values(row).some((v) => String(v).trim() !== "");
    if (hasValue) rows.push(row);
  });
  return rows;
}

function collectSplScrapMeta() {
  const meta = {};
  splScrapMetaFields.forEach((field) => {
    const input = splMetaInputs[field.key];
    meta[field.key] = input ? input.value : "";
  });
  return meta;
}

function collectSplScrapRows() {
  if (!splBody) return [];
  const meta = collectSplScrapMeta();
  const rows = [];
  splBody.querySelectorAll("tr").forEach((tr) => {
    const inputs = tr.querySelectorAll("input");
    const row = {};
    splScrapColumns.forEach((col, idx) => {
      const val = inputs[idx] ? inputs[idx].value : "";
      row[col.label] = val;
    });
    const hasValue = Object.values(row).some((v) => String(v).trim() !== "");
    if (hasValue) rows.push({ ...meta, ...row });
  });
  return rows;
}

async function createManualFile(documentType, rows, displayName) {
  if (!rows.length) {
    renderErrorList([{ message: "No hay filas con datos para crear." }]);
    return;
  }

  const spinner = createFileButton
    ? createFileButton.querySelector(".spinner")
    : null;
  if (createFileButton) createFileButton.disabled = true;
  if (spinner) spinner.classList.remove("hidden");

  try {
    const response = await fetch("/api/files/create-manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentType,
        rows,
        displayName: displayName || undefined,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Error al crear.");
    }
    if (data.status === "completed") {
      renderSuccess(data.jobId);
    } else if (data.status === "completed_with_errors") {
      renderWarning(data.errors || [], data.jobId);
    } else {
      renderErrorList(
        data.errors || [{ message: "No se pudo crear el archivo." }],
      );
    }
  } catch (err) {
    renderErrorList([{ message: err.message || "Error al crear archivo." }]);
  } finally {
    if (createFileButton) createFileButton.disabled = false;
    if (spinner) spinner.classList.add("hidden");
  }
}

async function loadFileForEdit(docId, docType) {
  if (!docId) return;
  const targetType = docType || "finishedProduct";
  if (
    targetType !== "finishedProduct" &&
    targetType !== "rawMaterial" &&
    targetType !== "billOfMaterials"
  ) {
    renderErrorList([{ message: "Tipo de archivo invalido para editar." }]);
    return;
  }
  try {
    const response = await fetch(
      `/api/files/admin-files/${docId}?type=${targetType}`,
    );
    if (!response.ok) {
      throw new Error("No se pudo cargar el archivo.");
    }
    const data = await response.json();
    const doc = data && data.document ? data.document : null;
    if (!doc) {
      throw new Error("Archivo no encontrado.");
    }

    editingFileId = doc._id;
    if (fileType) {
      fileType.value = targetType;
      fileType.disabled = true;
    }
    showFormat(targetType);

    if (adminFileNameGroup) {
      adminFileNameGroup.classList.remove("hidden");
    }
    if (adminFileNameInput) {
      adminFileNameInput.value = doc.adminFileName || "";
    }

    if (targetType === "finishedProduct") {
      setFinishedProductRows(doc.rows || []);
    } else if (targetType === "rawMaterial") {
      setRawMaterialRows(doc.rows || []);
    } else if (targetType === "billOfMaterials") {
      setBillOfMaterialsRows(doc.rows || []);
    }

    if (createFileButton) createFileButton.classList.add("hidden");
    if (updateFileButton) updateFileButton.classList.remove("hidden");
  } catch (err) {
    renderErrorList([{ message: err.message || "Error al cargar archivo." }]);
  }
}

if (fileType) {
  fileType.addEventListener("change", (e) => {
    showFormat(e.target.value);
  });

  // Para cargar el estado inicial
  showFormat(fileType.value);
}

if (createFileButton) {
  createFileButton.addEventListener("click", () => {
    if (!fileType || !fileType.value) {
      renderErrorList([{ message: "Selecciona un tipo de archivo." }]);
      return;
    }
    if (fileType.value === "finishedProduct") {
      const name =
        adminFileNameInput && adminFileNameInput.value
          ? adminFileNameInput.value.trim()
          : "";
      createManualFile("finishedProduct", collectFinishedProductRows(), name);
      return;
    }
    if (fileType.value === "rawMaterial") {
      const name =
        adminFileNameInput && adminFileNameInput.value
          ? adminFileNameInput.value.trim()
          : "";
      createManualFile("rawMaterial", collectRawMaterialRows(), name);
      return;
    }
    if (fileType.value === "billOfMaterials") {
      const name =
        adminFileNameInput && adminFileNameInput.value
          ? adminFileNameInput.value.trim()
          : "";
      createManualFile("billOfMaterials", collectBillOfMaterialsRows(), name);
      return;
    }
    if (fileType.value === "splScrap") {
      createManualFile("splScrap", collectSplScrapRows(), "");
      return;
    }
    renderErrorList([
      { message: "Este tipo a\u00fan no est\u00e1 disponible." },
    ]);
  });
}

if (updateFileButton) {
  updateFileButton.addEventListener("click", async () => {
    if (!editingFileId) return;
    if (!fileType) {
      renderErrorList([
        { message: "Tipo de archivo invalido para actualizar." },
      ]);
      return;
    }
    const targetType = fileType.value;
    if (
      targetType !== "finishedProduct" &&
      targetType !== "rawMaterial" &&
      targetType !== "billOfMaterials"
    ) {
      renderErrorList([
        { message: "Tipo de archivo invalido para actualizar." },
      ]);
      return;
    }

    const rows =
      targetType === "rawMaterial"
        ? collectRawMaterialRows()
        : targetType === "billOfMaterials"
          ? collectBillOfMaterialsRows()
          : collectFinishedProductRows();
    if (!rows.length) {
      renderErrorList([{ message: "No hay filas con datos para actualizar." }]);
      return;
    }

    const btnText = updateFileButton.querySelector(".btn-text");
    const spinner = updateFileButton.querySelector(".spinner");
    updateFileButton.disabled = true;
    if (btnText) btnText.classList.add("hidden");
    if (spinner) spinner.classList.remove("hidden");

    try {
      const displayName =
        adminFileNameInput && adminFileNameInput.value
          ? adminFileNameInput.value.trim()
          : "";
      const response = await fetch(
        `/api/files/admin-files/${editingFileId}?type=${targetType}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rows,
            displayName: displayName || undefined,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        const errors = data && data.errors ? data.errors : [];
        if (errors.length) {
          renderErrorList(errors, "Errores");
        } else {
          throw new Error(data.message || "No se pudo actualizar.");
        }
        return;
      }
      window.location.href = `/file-admin.html?type=${targetType}`;
    } catch (err) {
      renderErrorList([{ message: err.message || "Error al actualizar." }]);
    } finally {
      updateFileButton.disabled = false;
      if (btnText) btnText.classList.remove("hidden");
      if (spinner) spinner.classList.add("hidden");
    }
  });
}

const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get("edit");
const editType = urlParams.get("type");
if (editId) {
  loadFileForEdit(editId, editType);
}
