const fileType = document.getElementById('fileType');
const sections = document.querySelectorAll('.format-section');
const createFileButton = document.getElementById('createFileButton');
const validationResult = document.getElementById('validationResult');

const map = {
  finishedProduct: 'format-finishedProduct',
  rawMaterial: 'format-rawMaterial',
  billOfMaterials: 'format-billOfMaterials',
  splScrap: 'format-splScrap',
};

const finishedProductColumns = [
  { key: 'partNumber', label: 'Part Number', maxLength: 30, required: true },
  { key: 'description', label: 'Description' },
  { key: 'unitWeightLb', label: 'Unit Weight Lb.' },
  { key: 'dutiableValueUsd', label: 'Dutiable Value (USD)' },
  { key: 'filler', label: 'Filler' },
  { key: 'addedValueUsd', label: 'Added Value (USD)' },
  { key: 'unitOfMeasure', label: 'Unit of Measure' },
  { key: 'countryOfOrigin', label: 'Country of Origin' },
  { key: 'usaImportHts', label: 'USA Importation HTS Code' },
  { key: 'usaExportCode', label: 'USA Exportation Code' },
  { key: "FDA Product Code", label: "FDA Product Code"},
  { key: 'FDA Storage', label: 'FDA Storage' },
  { key: 'FDA Country of Origin', label: 'FDA Country of Origin' },
  { key: 'FDA Marker', label: 'FDA Marker' },
  { key: 'FDA Affirmation of Compliance Code 1', label: 'FDA Affirmation of Compliance Code 1' },
  { key: 'FDA Affirmation of Compliance Qualifier 1', label: 'FDA Affirmation of Compliance Qualifier 1' },
  { key: 'FDA Affirmation of Compliance Code 2', label: 'FDA Affirmation of Compliance Code 2' },
  { key: 'FDA Affirmation of Compliance Qualifier 2', label: 'FDA Affirmation of Compliance Qualifier 2' },
  { key: 'FDA Affirmation of Compliance Code 3', label: 'FDA Affirmation of Compliance Code 3' },
  { key: 'FDA Affirmation of Compliance Qualifier 3', label: 'FDA Affirmation of Compliance Qualifier 3' },
  { key: 'FDA Affirmation of Compliance Code 4', label: 'FDA Affirmation of Compliance Code 4' },
  { key: 'FDA Affirmation of Compliance Qualifier 4', label: 'FDA Affirmation of Compliance Qualifier 4' },
  { key: 'FDA Affirmation of Compliance Code 5', label: 'FDA Affirmation of Compliance Code 5' },
  { key: 'FDA Affirmation of Compliance Qualifier 5', label: 'FDA Affirmation of Compliance Qualifier 5' },
  { key: 'FDA Affirmation of Compliance Code 6', label: 'FDA Affirmation of Compliance Code 6' },
  { key: 'FDA Affirmation of Compliance Qualifier 6', label: 'FDA Affirmation of Compliance Qualifier 6' },
  { key: 'NAFTA', label: 'NAFTA' },
  { key: 'Preference Criterion', label: 'Preference Criterion' },
  { key: 'Producer', label: 'Producer' },
  { key: 'Net Cost', label: 'Net Cost' },
  { key: 'Period (From)', label: 'Period (From)' },
  { key: 'Period (To)', label: 'Period (To)' },
  { key: 'USML (ITAR)', label: 'USML (ITAR)' },
];

const rawMaterialColumns = [
  { key: 'partNumber', label: 'Part Number', maxLength: 30, required: true },
  { key: 'description', label: 'Description', maxLength: 60, required: true },
  { key: 'unitWeightLb', label: 'Unit Weight Lb.', required: true },
  { key: 'unitCostUsd', label: 'Unit Cost (USD)', required: true },
  { key: 'unitOfMeasure', label: 'Unit of measure', maxLength: 3, required: true },
  { key: 'countryOfOrigin', label: 'Country of origin', maxLength: 2, required: true },
  { key: 'importHts', label: 'Importation HTS Code', required: true },
  { key: 'exportHts', label: 'Exportation HTS Code', required: true },
  { key: 'eccn', label: 'ECCN', required: true },
  { key: 'filler', label: 'Filler' },
  { key: 'licenseNumber', label: 'License Number (LCN)' },
  { key: 'licenseException', label: 'License Exception' },
  { key: 'licenseExpiration', label: 'License Expiration date' },
  { key: 'usml', label: 'USML (ITAR)' },
];

const fpTable = document.getElementById('fpTable');
const fpHead = fpTable ? fpTable.querySelector('thead') : null;
const fpBody = fpTable ? fpTable.querySelector('tbody') : null;
const fpAddRowBtn = document.getElementById('fpAddRowBtn');
let fpInitialized = false;

const rmTable = document.getElementById('rmTable');
const rmHead = rmTable ? rmTable.querySelector('thead') : null;
const rmBody = rmTable ? rmTable.querySelector('tbody') : null;
const rmAddRowBtn = document.getElementById('rmAddRowBtn');
let rmInitialized = false;

function buildFinishedProductTable() {
  if (!fpHead || !fpBody) return;

  fpHead.innerHTML = '';
  const headerRow = document.createElement('tr');
  finishedProductColumns.forEach((col) => {
    const th = document.createElement('th');
    th.textContent = col.label;
    headerRow.appendChild(th);
  });
  const actionsTh = document.createElement('th');
  actionsTh.textContent = 'Acciones';
  headerRow.appendChild(actionsTh);
  fpHead.appendChild(headerRow);

  fpBody.innerHTML = '';
  addFinishedProductRow();
}

function buildRawMaterialTable() {
  if (!rmHead || !rmBody) return;

  rmHead.innerHTML = '';
  const headerRow = document.createElement('tr');
  rawMaterialColumns.forEach((col) => {
    const th = document.createElement('th');
    th.textContent = col.label;
    headerRow.appendChild(th);
  });
  const actionsTh = document.createElement('th');
  actionsTh.textContent = 'Acciones';
  headerRow.appendChild(actionsTh);
  rmHead.appendChild(headerRow);

  rmBody.innerHTML = '';
  addRawMaterialRow();
}

function addFinishedProductRow() {
  if (!fpBody) return;
  const row = document.createElement('tr');

  finishedProductColumns.forEach((col) => {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'text';
    input.name = `finishedProduct[${col.key}][]`;
    input.placeholder = col.label;
    if (col.maxLength) input.maxLength = col.maxLength;
    if (col.required) input.required = true;
    if (col.key === 'partNumber') {
      input.addEventListener('input', () => {
        input.value = input.value.toUpperCase();
      });
    }
    td.appendChild(input);
    row.appendChild(td);
  });

  const actionsTd = document.createElement('td');
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'row-remove-btn';
  removeBtn.textContent = 'Eliminar';
  removeBtn.addEventListener('click', () => {
    row.remove();
    if (fpBody.children.length === 0) {
      addFinishedProductRow();
    }
  });
  actionsTd.appendChild(removeBtn);
  row.appendChild(actionsTd);

  fpBody.appendChild(row);
}

function addRawMaterialRow() {
  if (!rmBody) return;
  const row = document.createElement('tr');

  rawMaterialColumns.forEach((col) => {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'text';
    input.name = `rawMaterial[${col.key}][]`;
    input.placeholder = col.label;
    if (col.maxLength) input.maxLength = col.maxLength;
    if (col.required) input.required = true;
    if (col.key === 'partNumber') {
      input.addEventListener('input', () => {
        input.value = input.value.toUpperCase();
      });
    }
    td.appendChild(input);
    row.appendChild(td);
  });

  const actionsTd = document.createElement('td');
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'row-remove-btn';
  removeBtn.textContent = 'Eliminar';
  removeBtn.addEventListener('click', () => {
    row.remove();
    if (rmBody.children.length === 0) {
      addRawMaterialRow();
    }
  });
  actionsTd.appendChild(removeBtn);
  row.appendChild(actionsTd);

  rmBody.appendChild(row);
}

function showFormat(type) {
  sections.forEach((s) => s.classList.add('hidden'));
  const id = map[type];
  if (id) {
    document.getElementById(id).classList.remove('hidden');
  }
  if (type === 'finishedProduct' && !fpInitialized) {
    buildFinishedProductTable();
    fpInitialized = true;
  }
  if (type === 'rawMaterial' && !rmInitialized) {
    buildRawMaterialTable();
    rmInitialized = true;
  }
}

if (fpAddRowBtn) {
  fpAddRowBtn.addEventListener('click', addFinishedProductRow);
}

if (rmAddRowBtn) {
  rmAddRowBtn.addEventListener('click', addRawMaterialRow);
}

function renderErrorList(errors, title = 'Errores') {
  if (!validationResult) return;
  validationResult.classList.remove('hidden', 'success', 'error', 'warning');
  validationResult.classList.add('error');
  validationResult.innerHTML = '';

  const safeErrors = Array.isArray(errors) ? errors : [];
  const h4 = document.createElement('h4');
  h4.textContent = `${title} (${safeErrors.length})`;
  const ul = document.createElement('ul');
  safeErrors.forEach((err) => {
    const li = document.createElement('li');
    li.textContent = err.message || JSON.stringify(err);
    ul.appendChild(li);
  });
  validationResult.append(h4, ul);
}

function renderSuccess(jobId) {
  if (!validationResult) return;
  validationResult.classList.remove('hidden', 'success', 'error', 'warning');
  validationResult.classList.add('success');
  validationResult.innerHTML = '';

  const h4 = document.createElement('h4');
  h4.textContent = 'Archivo creado';
  const p = document.createElement('p');
  p.textContent = 'El archivo se gener\u00f3 correctamente.';
  const actions = document.createElement('div');
  actions.className = 'result-actions';
  const link = document.createElement('a');
  link.href = `/api/files/${jobId}/download`;
  link.target = '_blank';
  link.textContent = 'Descargar Archivo';
  actions.appendChild(link);

  validationResult.append(h4, p, actions);
}

function renderWarning(errors, jobId) {
  if (!validationResult) return;
  validationResult.classList.remove('hidden', 'success', 'error', 'warning');
  validationResult.classList.add('warning');
  validationResult.innerHTML = '';

  const h4 = document.createElement('h4');
  h4.textContent = 'Creado con errores';
  const p = document.createElement('p');
  p.textContent =
    'El archivo se proces\u00f3, pero se encontraron problemas.';

  validationResult.append(h4, p);

  if (Array.isArray(errors) && errors.length > 0) {
    const ul = document.createElement('ul');
    errors.forEach((err) => {
      const li = document.createElement('li');
      li.textContent = err.message || JSON.stringify(err);
      ul.appendChild(li);
    });
    validationResult.appendChild(ul);
  }

  const actions = document.createElement('div');
  actions.className = 'result-actions';
  const link = document.createElement('a');
  link.href = `/api/files/${jobId}/errors`;
  link.target = '_blank';
  link.textContent = 'Descargar Reporte de Errores';
  actions.appendChild(link);
  validationResult.appendChild(actions);
}

function collectFinishedProductRows() {
  if (!fpBody) return [];
  const rows = [];
  fpBody.querySelectorAll('tr').forEach((tr) => {
    const inputs = tr.querySelectorAll('input');
    const row = {};
    finishedProductColumns.forEach((col, idx) => {
      const val = inputs[idx] ? inputs[idx].value : '';
      row[col.label] = val;
    });
    const hasValue = Object.values(row).some(
      (v) => String(v).trim() !== ''
    );
    if (hasValue) rows.push(row);
  });
  return rows;
}

function collectRawMaterialRows() {
  if (!rmBody) return [];
  const rows = [];
  rmBody.querySelectorAll('tr').forEach((tr) => {
    const inputs = tr.querySelectorAll('input');
    const row = {};
    rawMaterialColumns.forEach((col, idx) => {
      const val = inputs[idx] ? inputs[idx].value : '';
      row[col.label] = val;
    });
    const hasValue = Object.values(row).some(
      (v) => String(v).trim() !== ''
    );
    if (hasValue) rows.push(row);
  });
  return rows;
}

async function createManualFile(documentType, rows) {
  if (!rows.length) {
    renderErrorList([{ message: 'No hay filas con datos para crear.' }]);
    return;
  }

  const spinner = createFileButton
    ? createFileButton.querySelector('.spinner')
    : null;
  if (createFileButton) createFileButton.disabled = true;
  if (spinner) spinner.classList.remove('hidden');

  try {
    const response = await fetch('/api/files/create-manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentType,
        rows,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al crear.');
    }
    if (data.status === 'completed') {
      renderSuccess(data.jobId);
    } else if (data.status === 'completed_with_errors') {
      renderWarning(data.errors || [], data.jobId);
    } else {
      renderErrorList(
        data.errors || [{ message: 'No se pudo crear el archivo.' }]
      );
    }
  } catch (err) {
    renderErrorList([{ message: err.message || 'Error al crear archivo.' }]);
  } finally {
    if (createFileButton) createFileButton.disabled = false;
    if (spinner) spinner.classList.add('hidden');
  }
}

if (fileType) {
  fileType.addEventListener('change', (e) => {
    showFormat(e.target.value);
  });

  // Para cargar el estado inicial
  showFormat(fileType.value);
}

if (createFileButton) {
  createFileButton.addEventListener('click', () => {
    if (!fileType || !fileType.value) {
      renderErrorList([{ message: 'Selecciona un tipo de archivo.' }]);
      return;
    }
    if (fileType.value === 'finishedProduct') {
      createManualFile('finishedProduct', collectFinishedProductRows());
      return;
    }
    if (fileType.value === 'rawMaterial') {
      createManualFile('rawMaterial', collectRawMaterialRows());
      return;
    }
    renderErrorList([{ message: 'Este tipo a\u00fan no est\u00e1 disponible.' }]);
  });
}
