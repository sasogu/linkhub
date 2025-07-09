import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <h1>LinkHub</h1>
  <form id="link-form">
    <input type="url" id="url" placeholder="Enlace (https://...)" required />
    <input type="text" id="title" placeholder="Título" required />
    <input type="text" id="tags" placeholder="Etiquetas (separadas por coma)" />
    <input type="text" id="category" placeholder="Categoría" />
    <button type="submit">Añadir enlace</button>
  </form>
  <div style="margin:1em 0;">
    <button id="export-btn">Exportar enlaces</button>
    <input type="file" id="import-file" accept="application/json" style="display:none;" />
    <button id="import-btn" type="button">Importar enlaces</button>
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
`;

const form = document.getElementById('link-form');
const linksList = document.getElementById('links-list');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const filterCategory = document.getElementById('filter-category');
const filterTag = document.getElementById('filter-tag');

function getLinks() {
  return JSON.parse(localStorage.getItem('links') || '[]');
}

function saveLinks(links) {
  localStorage.setItem('links', JSON.stringify(links));
}

function getAllCategories(links) {
  return Array.from(new Set(links.map(l => l.category).filter(Boolean)));
}
function getAllTags(links) {
  return Array.from(new Set(links.flatMap(l => l.tags || []).filter(Boolean)));
}

function updateFilters() {
  const links = getLinks();
  const categories = getAllCategories(links);
  const tags = getAllTags(links);
  filterCategory.innerHTML = '<option value="">Todas</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');
  filterTag.innerHTML = '<option value="">Todas</option>' + tags.map(t => `<option value="${t}">${t}</option>`).join('');
}

function renderLinks() {
  const links = getLinks();
  let filtered = links;
  const cat = filterCategory.value;
  const tag = filterTag.value;
  if (cat) filtered = filtered.filter(l => (l.category || '') === cat);
  if (tag) filtered = filtered.filter(l => (l.tags || []).map(String).includes(tag));
  if (filtered.length === 0) {
    linksList.innerHTML = '<p>No hay enlaces guardados.</p>';
    return;
  }
  linksList.innerHTML = filtered.map((link, idx) => `
    <div class="link-item" data-idx="${links.indexOf(link)}">
      <a href="${link.url}" target="_blank">${link.title}</a>
      <div><strong>Categoría:</strong> ${link.category || '-'}</div>
      <div><strong>Etiquetas:</strong> ${link.tags ? link.tags.join(', ') : '-'}</div>
      <button class="edit-link" style="margin-top:0.5em;">Editar</button>
    </div>
  `).join('');

  // Añadir eventos de edición
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
    links[editIdx] = { url, title, tags, category };
    form.removeAttribute('data-edit');
    form.querySelector('button[type="submit"]').textContent = 'Añadir enlace';
  } else {
    // Añadir nuevo enlace
    links.push({ url, title, tags, category });
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

// Inicializar filtros y enlaces tras cargar la página
updateFilters();
renderLinks();
