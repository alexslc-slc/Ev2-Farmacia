import { api } from './api.js';
import { createAuthController } from './auth.js';
import { resources } from './resources.js';
import {
  buildRecordForm,
  getAllowedResources,
  markActiveMenu,
  renderMenu,
  renderRecords,
  showMessage
} from './ui.js';

let currentUser = null;
let currentResource = null;
let cachedRows = [];
let editingKeys = null;
let pendingDelete = null;
let drawerReturnFocus = null;
let drawerTimer = null;
let sidebarTimer = null;

const appError = document.getElementById('app-error');
const drawerOverlay = document.getElementById('record-overlay');
const drawer = document.getElementById('record-drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const dialogError = document.getElementById('dialog-error');
const formFields = document.getElementById('form-fields');
const deleteConfirmation = document.getElementById('delete-confirmation');
const saveButton = document.getElementById('dialog-save');
const sidebar = document.getElementById('app-sidebar');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const sidebarToggle = document.getElementById('sidebar-toggle');

function setSidebarOpen(open) {
  clearTimeout(sidebarTimer);
  sidebar.classList.toggle('-translate-x-full', !open);
  sidebar.classList.toggle('translate-x-0', open);
  sidebarToggle.setAttribute('aria-expanded', String(open));
  sidebarToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  sidebarToggle.innerHTML = `<i class="fa-solid ${open ? 'fa-xmark' : 'fa-bars'}"></i>`;
  if (open) {
    sidebarBackdrop.classList.remove('hidden');
    requestAnimationFrame(() => {
      sidebarBackdrop.classList.remove('opacity-0');
      sidebarBackdrop.classList.add('opacity-100');
    });
  } else {
    sidebarBackdrop.classList.remove('opacity-100');
    sidebarBackdrop.classList.add('opacity-0');
    sidebarTimer = setTimeout(() => sidebarBackdrop.classList.add('hidden'), 300);
  }
}

function showDrawer() {
  clearTimeout(drawerTimer);
  drawerOverlay.classList.remove('hidden');
  drawerOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overflow-hidden');
  requestAnimationFrame(() => {
    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');
    drawerBackdrop.classList.remove('opacity-0');
    drawerBackdrop.classList.add('opacity-100');
    drawer.focus();
  });
}

function closeDrawer() {
  if (drawerOverlay.classList.contains('hidden')) return;
  drawerOverlay.setAttribute('aria-hidden', 'true');
  drawer.classList.remove('translate-x-0');
  drawer.classList.add('translate-x-full');
  drawerBackdrop.classList.remove('opacity-100');
  drawerBackdrop.classList.add('opacity-0');
  pendingDelete = null;
  editingKeys = null;
  showMessage(dialogError);
  clearTimeout(drawerTimer);
  drawerTimer = setTimeout(() => {
    drawerOverlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    if (drawerReturnFocus?.isConnected) drawerReturnFocus.focus();
    drawerReturnFocus = null;
  }, 300);
}

function primaryKey(row, resource) {
  return resource.key.map(key => row[key]);
}

async function loadResource(key) {
  if (!currentUser || !getAllowedResources(currentUser).includes(key)) return;
  currentResource = key;
  const resource = resources[key];
  document.getElementById('records-container').classList.remove('hidden');
  document.getElementById('page-title').textContent = resource.title;
  document.getElementById('section-description').textContent = resource.description;

  const create = document.getElementById('create-button');
  create.classList.toggle('hidden', currentUser.rol === 'usuario' || key === 'usuarios');
  create.onclick = () => openEditor(null);
  markActiveMenu(key);
  showMessage(appError);

  try {
    cachedRows = await api(`/api/${key}`);
    renderRecords({
      rows: cachedRows,
      resourceKey: key,
      user: currentUser,
      onEdit: openEditor,
      onDelete: deleteRow
    });
  } catch (error) {
    showMessage(appError, error.message);
  }
}

function navigate(key) {
  return loadResource(key);
}

async function onSession(user) {
  currentUser = user;
  renderMenu(user, key => {
    setSidebarOpen(false);
    navigate(key);
  });
  await loadResource(getAllowedResources(user)[0]);
}

function onLogout() {
  setSidebarOpen(false);
  currentUser = null;
  currentResource = null;
  cachedRows = [];
  document.getElementById('navigation').replaceChildren();
}

async function openEditor(row) {
  const resource = resources[currentResource];
  drawerReturnFocus = document.activeElement;
  pendingDelete = null;
  formFields.classList.remove('hidden');
  deleteConfirmation.classList.add('hidden');
  saveButton.textContent = 'Guardar';
  saveButton.classList.remove('bg-rose-600', 'hover:bg-rose-500');
  saveButton.classList.add('bg-indigo-600', 'hover:bg-indigo-500');
  editingKeys = row ? primaryKey(row, resource) : null;
  document.getElementById('dialog-title').textContent = row ? `Editar ${resource.title}` : `Nuevo registro: ${resource.title}`;
  showMessage(dialogError);
  saveButton.classList.toggle('hidden', currentUser.rol === 'usuario');

  try {
    await buildRecordForm({ resourceKey: currentResource, row, apiCall: api });
    showDrawer();
  } catch (error) {
    drawerReturnFocus = null;
    showMessage(appError, error.message);
  }
}

async function deleteRow(row) {
  const resource = resources[currentResource];
  drawerReturnFocus = document.activeElement;
  pendingDelete = primaryKey(row, resource);
  formFields.classList.add('hidden');
  deleteConfirmation.classList.remove('hidden');
  document.getElementById('delete-record-name').textContent = String(row[resource.columns[1]] || resource.title);
  document.getElementById('delete-record-id').textContent = pendingDelete.join(' · ');
  document.getElementById('dialog-title').textContent = `Eliminar ${resource.title}`;
  saveButton.textContent = 'Eliminar';
  saveButton.classList.remove('bg-indigo-600', 'hover:bg-indigo-500');
  saveButton.classList.add('bg-rose-600', 'hover:bg-rose-500');
  saveButton.classList.remove('hidden');
  showMessage(dialogError);
  showDrawer();
}

document.getElementById('record-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (pendingDelete) {
    try {
      await api(`/api/${currentResource}/${pendingDelete.join('/')}`, { method: 'DELETE' });
      pendingDelete = null;
      closeDrawer();
      await loadResource(currentResource);
    } catch (error) {
      showMessage(dialogError, error.message);
    }
    return;
  }
  if (!event.currentTarget.reportValidity()) return;

  const resource = resources[currentResource];
  const formData = new FormData(event.currentTarget);
  const body = {};
  for (const field of resource.fields) {
    if (editingKeys && resource.key.includes(field.name)) continue;
    const input = event.currentTarget.elements.namedItem(field.name);
    const value = formData.get(field.name);
    body[field.name] = input.type === 'number' ? Number(value) : value;
  }

  if (body.fechaFabricacion && body.fechaVencimiento && body.fechaVencimiento <= body.fechaFabricacion) {
    showMessage(dialogError, 'La fecha de vencimiento debe ser posterior a la fecha de fabricación.');
    return;
  }

  try {
    const method = editingKeys ? 'PUT' : 'POST';
    const path = editingKeys ? `/${editingKeys.join('/')}` : '';
    await api(`/api/${currentResource}${path}`, { method, body: JSON.stringify(body) });
    closeDrawer();
    await loadResource(currentResource);
  } catch (error) {
    showMessage(dialogError, error.message);
  }
});

document.getElementById('dialog-close').addEventListener('click', closeDrawer);
document.getElementById('dialog-cancel').addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);
sidebarToggle.addEventListener('click', () => setSidebarOpen(sidebarToggle.getAttribute('aria-expanded') !== 'true'));
sidebarBackdrop.addEventListener('click', () => setSidebarOpen(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeDrawer();
    setSidebarOpen(false);
    return;
  }
  if (event.key === 'Tab' && !drawerOverlay.classList.contains('hidden')) {
    const focusable = drawer.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
document.getElementById('logout-button').addEventListener('click', () => auth.endSession());

const auth = createAuthController({ onSession, onLogout });
await auth.restoreSession();
