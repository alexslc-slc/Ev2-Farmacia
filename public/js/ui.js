import { menuOrder, resources } from './resources.js';

export function showMessage(element, message = '') {
  element.textContent = message;
  element.classList.toggle('hidden', !message);
}

export function displayValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') {
    return value.razonSocial || value.descripcion || value.descripcionEsp || value.descripcionMed || value.NroOrdenC || value.NroOrdenVta || '—';
  }
  return String(value);
}

function referenceValue(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value)) {
    const [year, month, day] = value.slice(0, 10).split('-');
    return `${day}/${month}/${year}`;
  }
  return displayValue(value);
}

export function getAllowedResources(user) {
  if (user.rol === 'admin') return [...menuOrder];
  if (user.rol === 'moderador') return menuOrder.filter(key => key !== 'usuarios');
  return ['medicamentos'];
}

export function renderMenu(user, onNavigate) {
  const nav = document.getElementById('navigation');
  nav.replaceChildren();
  for (const key of getAllowedResources(user)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.resource = key;
    button.className = 'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-300 transition duration-200 hover:bg-white/[0.06] hover:text-white';
    const icon = document.createElement('i');
    icon.className = `fa-solid ${menuIcons[key] || 'fa-circle'} w-5 text-center text-sm text-slate-500 transition-colors`;
    icon.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = resources[key].title;
    button.append(icon, label);
    button.addEventListener('click', () => onNavigate(key));
    nav.append(button);
  }
  document.getElementById('user-badge').textContent = `${user.nombre} · ${user.rol}`;
  document.getElementById('sidebar-user-name').textContent = user.nombre;
  document.getElementById('sidebar-user-role').textContent = user.rol;
}

const menuIcons = {
  medicamentos: 'fa-capsules',
  laboratorios: 'fa-flask',
  especialidades: 'fa-stethoscope',
  tiposMedic: 'fa-tags',
  'tipos-medicamento': 'fa-tags',
  ordenesCompra: 'fa-cart-shopping',
  'ordenes-compra': 'fa-cart-shopping',
  detallesCompra: 'fa-list-check',
  'detalles-compra': 'fa-list-check',
  'detalle-compra': 'fa-list-check',
  ordenesVenta: 'fa-receipt',
  'ordenes-venta': 'fa-receipt',
  detallesVenta: 'fa-file-invoice',
  'detalles-venta': 'fa-file-invoice',
  'detalle-venta': 'fa-file-invoice',
  usuarios: 'fa-users'
};

export function markActiveMenu(key) {
  for (const button of document.querySelectorAll('#navigation button')) {
    const active = button.dataset.resource === key;
    button.classList.toggle('bg-indigo-600', active);
    button.classList.toggle('text-white', active);
    button.classList.toggle('shadow-lg', active);
    button.classList.toggle('shadow-indigo-950/30', active);
    button.classList.toggle('text-slate-300', !active);
    button.setAttribute('aria-current', active ? 'page' : 'false');
    const icon = button.querySelector('i');
    icon.classList.toggle('text-slate-500', !active);
    icon.classList.toggle('text-indigo-100', active);
  }
}

export function renderRecords({ rows, resourceKey, user, onEdit, onDelete }) {
  const resource = resources[resourceKey];
  const head = document.getElementById('table-head');
  const body = document.getElementById('table-body');
  head.replaceChildren();
  body.replaceChildren();

  const headerRow = document.createElement('tr');
  for (const column of resource.columns) {
    const cell = document.createElement('th');
    cell.className = 'whitespace-nowrap px-4 py-3';
    cell.textContent = column;
    headerRow.append(cell);
  }
  if (user.rol !== 'usuario') {
    const actionHeader = document.createElement('th');
    actionHeader.className = 'px-4 py-3 text-right';
    actionHeader.textContent = 'Acciones';
    headerRow.append(actionHeader);
  }
  head.append(headerRow);

  for (const row of rows) {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-800/60';
    for (const column of resource.columns) {
      const td = document.createElement('td');
      td.className = 'whitespace-nowrap px-4 py-3';
      td.textContent = displayValue(row[column]);
      tr.append(td);
    }
    if (user.rol !== 'usuario') {
      const td = document.createElement('td');
      td.className = 'space-x-2 px-4 py-3 text-right';
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'rounded-md border border-amber-500/40 px-3 py-1 text-amber-300 hover:bg-amber-500/10';
      edit.textContent = 'Editar';
      edit.addEventListener('click', () => onEdit(row));
      td.append(edit);
      if (resourceKey !== 'usuarios') {
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'rounded-md border border-rose-500/40 px-3 py-1 text-rose-300 hover:bg-rose-500/10';
        remove.textContent = 'Eliminar';
        remove.addEventListener('click', () => onDelete(row));
        td.append(remove);
      }
      tr.append(td);
    }
    body.append(tr);
  }

  if (!rows.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = resource.columns.length + (user.rol === 'usuario' ? 0 : 1);
    cell.className = 'px-4 py-10 text-center text-slate-400';
    cell.textContent = 'Todavía no hay registros.';
    row.append(cell);
    body.append(row);
  }
}

async function makeField(field, currentValue, apiCall) {
  const wrapper = document.createElement('label');
  wrapper.className = `drawer-field block text-xs font-medium text-slate-300${field.wide ? ' drawer-field-wide' : ''}`;
  wrapper.append(document.createTextNode(field.label));
  let input;

  if (field.options) {
    input = document.createElement('select');
    for (const value of field.options) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      input.append(option);
    }
  } else if (field.resource) {
    input = document.createElement('select');
    const options = await apiCall(`/api/${field.resource}`);
    const target = resources[field.resource];
    const prompt = document.createElement('option');
    prompt.value = '';
    prompt.textContent = 'Selecciona una opción';
    input.append(prompt);
    for (const row of options) {
      const option = document.createElement('option');
      option.value = row[target.key[0]];
      const identifier = target.key.map(key => row[key]).join(' · ');
      option.textContent = `${identifier} — ${referenceValue(row[target.optionLabel || target.columns[1]])}`;
      input.append(option);
    }
  } else {
    input = document.createElement('input');
    input.type = field.type || 'text';
    if (field.maxLength) input.maxLength = field.maxLength;
    if (field.min !== undefined) input.min = field.min;
    if (field.step) input.step = field.step;
    if (field.type === 'number') input.inputMode = 'decimal';
  }

  input.name = field.name;
  input.required = true;
  input.className = 'mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-normal text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10';
  if (currentValue !== null && currentValue !== undefined) input.value = currentValue;
  wrapper.append(input);
  if (field.helpText) {
    const helpText = document.createElement('span');
    helpText.className = 'mt-1 block text-[11px] font-normal text-slate-500';
    helpText.textContent = field.helpText;
    wrapper.append(helpText);
  }
  return wrapper;
}

export async function buildRecordForm({ resourceKey, row, apiCall }) {
  const resource = resources[resourceKey];
  const fields = document.getElementById('form-fields');
  fields.replaceChildren();
  for (const field of resource.fields) {
    const fieldElement = await makeField(field, row?.[field.name], apiCall);
    if (row && resource.key.includes(field.name)) {
      fieldElement.querySelector('input, select').disabled = true;
    }
    fields.append(fieldElement);
  }
}
