(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const i of e)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function n(e){const i={};return e.integrity&&(i.integrity=e.integrity),e.referrerPolicy&&(i.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?i.credentials="include":e.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(e){if(e.ep)return;e.ep=!0;const i=n(e);fetch(e.href,i)}})();const y=document.querySelector("#app");y.innerHTML=`
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
`;const l=document.getElementById("link-form"),p=document.getElementById("links-list"),v=document.getElementById("export-btn"),b=document.getElementById("import-btn"),c=document.getElementById("import-file"),m=document.getElementById("filter-category"),f=document.getElementById("filter-tag");function s(){return JSON.parse(localStorage.getItem("links")||"[]")}function g(r){localStorage.setItem("links",JSON.stringify(r))}function h(r){return Array.from(new Set(r.map(t=>t.category).filter(Boolean)))}function L(r){return Array.from(new Set(r.flatMap(t=>t.tags||[]).filter(Boolean)))}function d(){const r=s(),t=h(r),n=L(r);m.innerHTML='<option value="">Todas</option>'+t.map(o=>`<option value="${o}">${o}</option>`).join(""),f.innerHTML='<option value="">Todas</option>'+n.map(o=>`<option value="${o}">${o}</option>`).join("")}function u(){let t=s();const n=m.value,o=f.value;if(n&&(t=t.filter(e=>e.category===n)),o&&(t=t.filter(e=>(e.tags||[]).includes(o))),t.length===0){p.innerHTML="<p>No hay enlaces guardados.</p>";return}p.innerHTML=t.map(e=>`
    <div class="link-item">
      <a href="${e.url}" target="_blank">${e.title}</a>
      <div><strong>Categoría:</strong> ${e.category||"-"}</div>
      <div><strong>Etiquetas:</strong> ${e.tags?e.tags.join(", "):"-"}</div>
    </div>
  `).join("")}l.addEventListener("submit",r=>{r.preventDefault();const t=l.url.value.trim(),n=l.title.value.trim(),o=l.tags.value.split(",").map(a=>a.trim()).filter(Boolean),e=l.category.value.trim(),i=s();i.push({url:t,title:n,tags:o,category:e}),g(i),l.reset(),u(),d()});v.addEventListener("click",()=>{const r=s(),t=new Blob([JSON.stringify(r,null,2)],{type:"application/json"}),n=URL.createObjectURL(t),o=document.createElement("a");o.href=n,o.download="enlaces-linkhub.json",o.click(),URL.revokeObjectURL(n)});b.addEventListener("click",()=>{c.click()});c.addEventListener("change",r=>{const t=r.target.files[0];if(!t)return;const n=new FileReader;n.onload=o=>{try{const e=JSON.parse(o.target.result);Array.isArray(e)?(g(e),u(),d(),alert("Enlaces importados correctamente.")):alert("El archivo no tiene el formato esperado.")}catch{alert("Error al importar el archivo.")}},n.readAsText(t),c.value=""});d();u();
