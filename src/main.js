import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <h1>LinkHub</h1>
  <div id=\"dropbox-bar\" style=\"display:flex;gap:0.5em;align-items:center;margin-bottom:0.75em;\">
    <span id=\"dropbox-status\" style=\"font-size:0.9em;color:#888;\">Dropbox: desconectado</span>
    <button id=\"dropbox-connect\" type=\"button\">Conectar Dropbox</button>
    <button id=\"dropbox-sync\" type=\"button\" disabled>Sincronizar ahora</button>
  </div>
  <form id="link-form">
    <input type="url" id="url" placeholder="Enlace (https://...)" required />
    <input type="text" id="title" placeholder="Título" required />
    <input type="text" id="tags" list="tags-datalist" placeholder="Etiquetas (separadas por coma)" />
    <datalist id="tags-datalist"></datalist>
    <input type="text" id="category" list="categories-datalist" placeholder="Categoría" />
    <datalist id="categories-datalist"></datalist>
    <button type="submit">Añadir enlace</button>
  </form>
  <div style="margin:1em 0;">
    <button id="export-btn">Exportar enlaces</button>
    <input type="file" id="import-file" accept="application/json" style="display:none;" />
    <button id="import-btn" type="button">Importar enlaces</button>
  </div>
  <div style="margin:1em 0;">
    <input type="text" id="search" placeholder="Buscar enlaces..." style="width:60%;max-width:400px;" />
  </div>
  <div style="margin:1em 0;">
    <label>Filtrar por categoría:
      <select id="filter-category">
        <option value="">Todas</option>
      </select>
    </label>
    <label style="margin-left:1em;">Filtrar por etiqueta:
      <select id="filter-tag">
        <option value="">Todas</option>
      </select>
    </label>
  </div>
  <h2>Enlaces guardados</h2>
  <div id="links-list"></div>
  <footer style="margin-top:2em;color:#888;font-size:0.9em;">SW: <span id="sw-version">(cargando...)</span></footer>
`;

// Declarar referencia del botón "Desconectar" antes de construir el modal
let dbxDisconnectBtn = null;

// Configuración: crear modal y mover controles (Dropbox, Importar/Exportar)
(function setupSettingsModal() {
  try {
    const formEl = document.getElementById('link-form');
    const wrap = document.createElement('div');
    wrap.style.margin = '0.5em 0';
    wrap.id = 'settings-trigger';
    const btn = document.createElement('button');
    btn.id = 'settings-open';
    btn.type = 'button';
    btn.textContent = 'Configuración';
    wrap.appendChild(btn);
    if (formEl && formEl.parentNode) formEl.insertAdjacentElement('afterend', wrap);

    app.insertAdjacentHTML('beforeend', `
      <div id="settings-modal" class="modal-backdrop" aria-hidden="true">
        <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <div class="modal-header">
            <h2 id="settings-title">Configuración</h2>
            <button id="settings-close" type="button" aria-label="Cerrar">✕</button>
          </div>
          <div class="modal-section">
            <h3>Tema</h3>
            <label for="theme-select">Modo:</label>
            <select id="theme-select">
              <option value="auto">Automático (sistema)</option>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>
          <div class="modal-section">
            <h3>Dropbox</h3>
            <div id="modal-dropbox"></div>
          </div>
          <div class="modal-section">
            <h3>Datos</h3>
            <div id="modal-data"></div>
          </div>
          <div class="modal-footer">
            <button id="settings-close-2" type="button">Cerrar</button>
          </div>
        </div>
      </div>
    `);

    const modal = document.getElementById('settings-modal');
    const themeSelect = modal.querySelector('#theme-select');
    const modalDropbox = modal.querySelector('#modal-dropbox');
    const modalData = modal.querySelector('#modal-data');

    const dropboxBar = document.getElementById('dropbox-bar');
    if (dropboxBar) {
      modalDropbox.appendChild(dropboxBar);
      // Añadir botón Desconectar dentro de la barra
      const discBtn = document.createElement('button');
      discBtn.id = 'dropbox-disconnect';
      discBtn.type = 'button';
      discBtn.textContent = 'Desconectar';
      discBtn.disabled = true;
      dropboxBar.appendChild(discBtn);
      dbxDisconnectBtn = discBtn;
    }

    const exportBtnEl = document.getElementById('export-btn');
    if (exportBtnEl && exportBtnEl.parentElement) {
      const container = exportBtnEl.parentElement;
      modalData.appendChild(container);
    }

    const openBtn = document.getElementById('settings-open');
    const closeBtn = document.getElementById('settings-close');
    const closeBtn2 = document.getElementById('settings-close-2');
    function openModal(){ modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }
    function closeModal(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    closeBtn2.addEventListener('click', closeModal);
    modal.addEventListener('click', (e)=>{ if (e.target === modal) closeModal(); });

    // Tema: aplicar y persistir
    function setThemeMeta(mode) {
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      const effective = (mode === 'auto') ? (prefersLight ? 'light' : 'dark') : mode;
      const color = effective === 'light' ? '#ffffff' : '#242424';
      let meta = document.querySelector('meta[name="theme-color"][data-override]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name','theme-color');
        meta.setAttribute('data-override','true');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', color);
    }

    function applyTheme(mode) {
      const html = document.documentElement;
      html.classList.remove('theme-light', 'theme-dark');
      if (mode === 'light') html.classList.add('theme-light');
      else if (mode === 'dark') html.classList.add('theme-dark');
      setThemeMeta(mode);
    }
    const savedTheme = localStorage.getItem('themeMode') || 'auto';
    applyTheme(savedTheme);
    if (themeSelect) {
      themeSelect.value = savedTheme;
      themeSelect.addEventListener('change', () => {
        const mode = themeSelect.value;
        localStorage.setItem('themeMode', mode);
        applyTheme(mode);
      });
    }
    // Si el usuario tiene modo automático, reaccionar a cambios del sistema
    if (window.matchMedia) {
      const mql = window.matchMedia('(prefers-color-scheme: light)');
      mql.addEventListener('change', () => {
        const mode = localStorage.getItem('themeMode') || 'auto';
        if (mode === 'auto') applyTheme('auto');
      });
    }
  } catch (e) {
    console.warn('Settings modal setup error:', e);
  }
})();

const form = document.getElementById('link-form');
const linksList = document.getElementById('links-list');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const filterCategory = document.getElementById('filter-category');
const filterTag = document.getElementById('filter-tag');
const searchInput = document.getElementById('search');
// Datalists para categorías y etiquetas
const tagsDatalist = document.getElementById('tags-datalist');
const categoriesDatalist = document.getElementById('categories-datalist');
// Dropbox UI
const dbxStatus = document.getElementById('dropbox-status');
const dbxConnectBtn = document.getElementById('dropbox-connect');
const dbxSyncBtn = document.getElementById('dropbox-sync');
// SW version UI
const swVersionEl = document.getElementById('sw-version');

function getLinks() {
  return JSON.parse(localStorage.getItem('links') || '[]');
}

function saveLinks(links) {
  localStorage.setItem('links', JSON.stringify(links));
  localStorage.setItem('linksUpdatedAt', String(Date.now()));
  queueDropboxSync();
}

function getAllCategories(links) {
  return Array.from(new Set(links.map(l => (l.category || '').trim()).filter(Boolean)));
}
function getAllTags(links) {
  return Array.from(new Set(links.flatMap(l => (l.tags || []).map(t => t.trim())).filter(Boolean)));
}

function updateFilters() {
  const links = getLinks();
  const categories = getAllCategories(links).sort((a, b) => a.localeCompare(b, 'es', {sensitivity:'base'}));
  const tags = getAllTags(links).sort((a, b) => a.localeCompare(b, 'es', {sensitivity:'base'}));
  filterCategory.innerHTML = '<option value="">Todas</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');
  filterTag.innerHTML = '<option value="">Todas</option>' + tags.map(t => `<option value="${t}">${t}</option>`).join('');
  // Poblar datalists manteniendo la capacidad de escribir nuevos valores
  if (categoriesDatalist) {
    categoriesDatalist.innerHTML = categories.map(c => `<option value="${c}"></option>`).join('');
  }
  if (tagsDatalist) {
    tagsDatalist.innerHTML = tags.map(t => `<option value="${t}"></option>`).join('');
  }
}

function renderLinks() {
  const links = getLinks();
  let filtered = links;
  const cat = filterCategory.value;
  const tag = filterTag.value;
  const search = (searchInput.value || '').toLowerCase();
  if (cat) filtered = filtered.filter(l => (l.category || '') === cat);
  if (tag) filtered = filtered.filter(l => (l.tags || []).map(String).includes(tag));
  if (search) {
    filtered = filtered.filter(l =>
      (l.title && l.title.toLowerCase().includes(search)) ||
      (l.url && l.url.toLowerCase().includes(search)) ||
      (l.category && l.category.toLowerCase().includes(search)) ||
      (l.tags && l.tags.join(',').toLowerCase().includes(search))
    );
  }
  if (filtered.length === 0) {
    linksList.innerHTML = '<p>No hay enlaces guardados.</p>';
    return;
  }
  // Separar fijados y normales
  const pinned = filtered.filter(l => l.pinned);
  const normal = filtered.filter(l => !l.pinned);
  // Ordenar alfabéticamente por título
  pinned.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'es', {sensitivity:'base'}));
  normal.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'es', {sensitivity:'base'}));
  const render = arr => arr.map((link, idx) => `
    <div class="link-item${link.pinned ? ' pinned' : ''}" data-idx="${links.indexOf(link)}">
      <a href="${link.url}" target="_blank">${link.title}</a>
      <div><strong>Categoría:</strong> ${link.category || '-'}</div>
      <div><strong>Etiquetas:</strong> ${link.tags ? link.tags.join(', ') : '-'}</div>
      <button class="edit-link" style="margin-top:0.5em;">Editar</button>
      <button class="pin-link" style="margin-top:0.5em;">${link.pinned ? 'Desfijar' : 'Fijar'}</button>
      <button class="delete-link btn--danger" style="margin-top:0.5em;">Eliminar</button>
      <button class="share-link btn--ghost" style="margin-top:0.5em;">Compartir</button>
    </div>
  `).join('');
  linksList.innerHTML =
    (pinned.length ? '<div style="font-size:0.95em;color:#535bf2;margin-bottom:0.5em;">Fijados</div>' + render(pinned) : '') +
    render(normal);

  // Eventos de edición
  document.querySelectorAll('.edit-link').forEach(btn => {
    btn.onclick = function() {
      const idx = this.parentElement.getAttribute('data-idx');
      const link = getLinks()[idx];
      form.url.value = link.url;
      form.title.value = link.title;
      form.tags.value = (link.tags || []).join(', ');
      form.category.value = link.category || '';
      form.setAttribute('data-edit', idx);
      form.querySelector('button[type="submit"]').textContent = 'Guardar cambios';
      form.scrollIntoView({behavior:'smooth'});
    };
  });
  // Eventos de fijar/desfijar
  document.querySelectorAll('.pin-link').forEach(btn => {
    btn.onclick = function() {
      const idx = this.parentElement.getAttribute('data-idx');
      const links = getLinks();
      links[idx].pinned = !links[idx].pinned;
      saveLinks(links);
      renderLinks();
    };
  });
  document.querySelectorAll('.delete-link').forEach(btn => {
    btn.onclick = function() {
      const idx = this.parentElement.getAttribute('data-idx');
      if (confirm('¿Seguro que quieres eliminar este enlace?')) {
        const links = getLinks();
        links.splice(idx, 1);
        saveLinks(links);
        renderLinks();
        updateFilters();
      }
    };
  });
  document.querySelectorAll('.share-link').forEach(btn => {
    btn.onclick = function() {
      const idx = this.parentElement.getAttribute('data-idx');
      const link = getLinks()[idx];
      if (navigator.share) {
        navigator.share({
          title: link.title,
          text: link.title + (link.category ? ' [' + link.category + ']' : ''),
          url: link.url
        });
      } else {
        navigator.clipboard.writeText(link.url);
        alert('Enlace copiado al portapapeles');
      }
    };
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const url = form.url.value.trim();
  const title = form.title.value.trim();
  const tags = form.tags.value.split(',').map(t => t.trim()).filter(Boolean);
  const category = form.category.value.trim();
  const links = getLinks();
  const editIdx = form.getAttribute('data-edit');
  if (editIdx !== null) {
    // Editar enlace existente
    const prev = links[editIdx] || {};
    links[editIdx] = { ...prev, url, title, tags, category };
    form.removeAttribute('data-edit');
    form.querySelector('button[type="submit"]').textContent = 'Añadir enlace';
  } else {
    // Añadir nuevo enlace
    links.push({ url, title, tags, category, pinned: false });
  }
  saveLinks(links);
  form.reset();
  renderLinks();
  updateFilters();
});

exportBtn.addEventListener('click', () => {
  const links = getLinks();
  const blob = new Blob([JSON.stringify(links, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'enlaces-linkhub.json';
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => {
  importFile.click();
});

importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        saveLinks(imported);
        renderLinks();
        updateFilters();
        alert('Enlaces importados correctamente.');
      } else {
        alert('El archivo no tiene el formato esperado.');
      }
    } catch {
      alert('Error al importar el archivo.');
    }
  };
  reader.readAsText(file);
  importFile.value = '';
});

filterCategory.addEventListener('change', () => {
  renderLinks();
});
filterTag.addEventListener('change', () => {
  renderLinks();
});
searchInput.addEventListener('input', renderLinks);

// Inicializar filtros y enlaces tras cargar la página
updateFilters();
renderLinks();

// --------------------
// Sincronización Dropbox
// --------------------

const DROPBOX_APP_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DROPBOX_APP_KEY) ? import.meta.env.VITE_DROPBOX_APP_KEY : (window.VITE_DROPBOX_APP_KEY || '');
const DROPBOX_FILE_PATH = '/linkhub/links.json';

let dropboxAuth = null; // { access_token, refresh_token, expires_at }
let syncTimer = null;
let syncing = false;

function setDropboxUIConnected(connected, accountName) {
  if (connected) {
    dbxStatus.textContent = `Dropbox: conectado${accountName ? ' ('+accountName+')' : ''}`;
    dbxStatus.style.color = '#1a7f37';
    dbxConnectBtn.disabled = true;
    dbxSyncBtn.disabled = false;
    if (dbxDisconnectBtn) dbxDisconnectBtn.disabled = false;
  } else {
    dbxStatus.textContent = 'Dropbox: desconectado';
    dbxStatus.style.color = '#888';
    dbxConnectBtn.disabled = false;
    dbxSyncBtn.disabled = true;
    if (dbxDisconnectBtn) dbxDisconnectBtn.disabled = true;
  }
}

function ts() { return Date.now(); }

function getStoredDropboxAuth() {
  try { return JSON.parse(localStorage.getItem('dropboxAuth') || 'null'); } catch { return null; }
}
function setStoredDropboxAuth(auth) {
  dropboxAuth = auth;
  if (auth) localStorage.setItem('dropboxAuth', JSON.stringify(auth));
  else localStorage.removeItem('dropboxAuth');
}

async function sha256Base64Url(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const buf = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/,'');
}

function randomString(len=64) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b=>('0'+b.toString(16)).slice(-2)).join('');
}

async function startDropboxAuth() {
  if (!DROPBOX_APP_KEY) {
    alert('Falta configurar VITE_DROPBOX_APP_KEY.');
    return;
  }
  const verifier = randomString(64);
  const challenge = await sha256Base64Url(verifier);
  sessionStorage.setItem('dbx_code_verifier', verifier);
  const redirectUri = window.location.origin + window.location.pathname;
  const params = new URLSearchParams({
    client_id: DROPBOX_APP_KEY,
    response_type: 'code',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    token_access_type: 'offline',
    redirect_uri: redirectUri,
  });
  const url = `https://www.dropbox.com/oauth2/authorize?${params.toString()}`;
  window.location.assign(url);
}

async function exchangeCodeForToken(code) {
  const verifier = sessionStorage.getItem('dbx_code_verifier');
  const redirectUri = window.location.origin + window.location.pathname;
  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: DROPBOX_APP_KEY,
    redirect_uri: redirectUri,
    code_verifier: verifier || '',
  });
  const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!res.ok) throw new Error('No se pudo obtener el token de Dropbox');
  const data = await res.json();
  const expires_at = ts() + (data.expires_in ? (data.expires_in*1000 - 60*1000) : 3*3600*1000);
  setStoredDropboxAuth({
    access_token: data.access_token,
    refresh_token: data.refresh_token || null,
    expires_at,
    account_id: data.account_id || null
  });
}

async function refreshAccessToken() {
  if (!dropboxAuth?.refresh_token) return false;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: dropboxAuth.refresh_token,
    client_id: DROPBOX_APP_KEY
  });
  const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!res.ok) return false;
  const data = await res.json();
  dropboxAuth.access_token = data.access_token;
  dropboxAuth.expires_at = ts() + (data.expires_in ? (data.expires_in*1000 - 60*1000) : 3*3600*1000);
  setStoredDropboxAuth(dropboxAuth);
  return true;
}

async function getAccessToken() {
  dropboxAuth = dropboxAuth || getStoredDropboxAuth();
  if (!dropboxAuth) return null;
  if (dropboxAuth.expires_at && dropboxAuth.expires_at < ts()) {
    const ok = await refreshAccessToken();
    if (!ok) return null;
  }
  return dropboxAuth.access_token;
}

async function dbxFetch(method, url, opts={}) {
  const token = await getAccessToken();
  if (!token) throw new Error('No autenticado en Dropbox');
  const headers = Object.assign({}, opts.headers || {}, {
    'Authorization': `Bearer ${token}`,
  });
  const res = await fetch(url, { method, ...opts, headers });
  if (res.status === 401) {
    const ok = await refreshAccessToken();
    if (!ok) throw new Error('Sesión de Dropbox expirada');
    return dbxFetch(method, url, opts);
  }
  return res;
}

async function dbxGetAccountName() {
  try {
    const res = await dbxFetch('POST', 'https://api.dropboxapi.com/2/users/get_current_account', {
      headers: { 'Content-Type': 'application/json' },
      body: 'null'
    });
    if (!res.ok) return null;
    const j = await res.json();
    return j.name?.display_name || null;
  } catch { return null; }
}

async function pullFromDropbox() {
  const res = await dbxFetch('POST', 'https://content.dropboxapi.com/2/files/download', {
    headers: {
      'Dropbox-API-Arg': JSON.stringify({ path: DROPBOX_FILE_PATH })
    }
  });
  if (res.status === 409) return null; // no existe
  if (!res.ok) throw new Error('Descarga de Dropbox fallida');
  const text = await res.text();
  try { return JSON.parse(text); } catch { return null; }
}

async function ensureDropboxFolder(path) {
  const parts = path.split('/').filter(Boolean);
  if (parts.length <= 1) return; // root or only filename
  const folder = '/' + parts.slice(0, parts.length - 1).join('/');
  try {
    await dbxFetch('POST', 'https://api.dropboxapi.com/2/files/create_folder_v2', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: folder, autorename: false })
    });
  } catch (e) {
    // Ignorar si ya existe (409)
  }
}

async function pushToDropbox(payload) {
  const body = JSON.stringify(payload);
  await ensureDropboxFolder(DROPBOX_FILE_PATH);
  const res = await dbxFetch('POST', 'https://content.dropboxapi.com/2/files/upload', {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({ path: DROPBOX_FILE_PATH, mode: 'overwrite', mute: true })
    },
    body
  });
  if (!res.ok) throw new Error('Subida a Dropbox fallida');
}

async function initialSync() {
  const token = await getAccessToken();
  if (!token) { setDropboxUIConnected(false); return; }
  const name = await dbxGetAccountName();
  setDropboxUIConnected(true, name);
  try {
    const remote = await pullFromDropbox();
    const local = getLinks();
    const localUpdated = Number(localStorage.getItem('linksUpdatedAt') || '0');
    const remoteUpdated = Number(remote?.updatedAt || 0);
    if (remote && (remoteUpdated >= localUpdated)) {
      localStorage.setItem('linksUpdatedAt', String(remoteUpdated));
      localStorage.setItem('links', JSON.stringify(remote.links || []));
      renderLinks();
      updateFilters();
    } else {
      // no remoto o local más reciente -> subir
      await pushToDropbox({ links: local, updatedAt: ts(), schema: 1 });
    }
  } catch (e) {
    console.warn('Sync inicial Dropbox:', e);
  }
}

function queueDropboxSync(delay=800) {
  if (!getStoredDropboxAuth()) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => { syncNow().catch(()=>{}); }, delay);
}

async function syncNow() {
  if (syncing) return;
  const token = await getAccessToken();
  if (!token) { setDropboxUIConnected(false); return; }
  syncing = true;
  dbxStatus.textContent = 'Dropbox: sincronizando...';
  try {
    const remote = await pullFromDropbox();
    const local = getLinks();
    const localUpdated = Number(localStorage.getItem('linksUpdatedAt') || '0');
    const remoteUpdated = Number(remote?.updatedAt || 0);
    if (remote && remoteUpdated > localUpdated) {
      localStorage.setItem('links', JSON.stringify(remote.links || []));
      localStorage.setItem('linksUpdatedAt', String(remoteUpdated));
      renderLinks();
      updateFilters();
    } else if (localUpdated >= remoteUpdated) {
      const updatedAt = ts();
      await pushToDropbox({ links: local, updatedAt, schema: 1 });
      localStorage.setItem('linksUpdatedAt', String(updatedAt));
    }
    const name = await dbxGetAccountName();
    setDropboxUIConnected(true, name);
    dbxStatus.textContent = 'Dropbox: sincronizado';
  } catch (e) {
    console.warn('Sync Dropbox:', e);
    dbxStatus.textContent = 'Dropbox: error de sincronización';
  } finally {
    syncing = false;
  }
}

dbxConnectBtn.addEventListener('click', startDropboxAuth);
dbxSyncBtn.addEventListener('click', () => { syncNow(); });
// Desconectar Dropbox (botón en el modal)
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t && t.id === 'dropbox-disconnect') {
    setStoredDropboxAuth(null);
    setDropboxUIConnected(false);
  }
});

window.addEventListener('online', () => queueDropboxSync(200));

// Mostrar versión del Service Worker en el pie
function requestSwVersion() {
  if (!('serviceWorker' in navigator)) return;
  if (navigator.serviceWorker.controller) {
    try { navigator.serviceWorker.controller.postMessage({ type: 'GET_SW_VERSION' }); } catch {}
  }
  if (navigator.serviceWorker.ready) {
    navigator.serviceWorker.ready.then(reg => {
      try { if (reg && reg.active) reg.active.postMessage({ type: 'GET_SW_VERSION' }); } catch {}
    }).catch(()=>{});
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.type === 'SW_VERSION' && swVersionEl) {
      swVersionEl.textContent = String(data.version);
    }
  });
  // pedir versión tras breve espera (primera carga)
  setTimeout(requestSwVersion, 500);
}

// Manejo del retorno OAuth
(async function handleOAuthReturn() {
  try {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (code) {
      await exchangeCodeForToken(code);
      // limpiar parámetros
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      history.replaceState({}, '', url.toString());
    }
  } catch (e) {
    console.warn('OAuth Dropbox:', e);
  } finally {
    // Inicializar estado
    dropboxAuth = getStoredDropboxAuth();
    setDropboxUIConnected(!!dropboxAuth);
    if (dropboxAuth) {
      initialSync();
      // sync periódico
      setInterval(() => queueDropboxSync(0), 5*60*1000);
    }
  }
})();
