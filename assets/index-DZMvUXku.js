(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver(e=>{for(const i of e)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function n(e){const i={};return e.integrity&&(i.integrity=e.integrity),e.referrerPolicy&&(i.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?i.credentials="include":e.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(e){if(e.ep)return;e.ep=!0;const i=n(e);fetch(e.href,i)}})();const y=document.querySelector("#app");y.innerHTML=`
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
`;const a=document.getElementById("link-form"),f=document.getElementById("links-list"),v=document.getElementById("export-btn"),b=document.getElementById("import-btn"),d=document.getElementById("import-file"),u=document.getElementById("filter-category"),p=document.getElementById("filter-tag");function c(){return JSON.parse(localStorage.getItem("links")||"[]")}function g(o){localStorage.setItem("links",JSON.stringify(o))}function h(o){return Array.from(new Set(o.map(t=>t.category).filter(Boolean)))}function L(o){return Array.from(new Set(o.flatMap(t=>t.tags||[]).filter(Boolean)))}function m(){const o=c(),t=h(o),n=L(o);u.innerHTML='<option value="">Todas</option>'+t.map(r=>`<option value="${r}">${r}</option>`).join(""),p.innerHTML='<option value="">Todas</option>'+n.map(r=>`<option value="${r}">${r}</option>`).join("")}function s(){let t=c();const n=u.value,r=p.value;if(n&&(t=t.filter(e=>e.category===n)),r&&(t=t.filter(e=>(e.tags||[]).includes(r))),t.length===0){f.innerHTML="<p>No hay enlaces guardados.</p>";return}f.innerHTML=t.map(e=>`
    <div class="link-item">
      <a href="${e.url}" target="_blank">${e.title}</a>
      <div><strong>Categoría:</strong> ${e.category||"-"}</div>
      <div><strong>Etiquetas:</strong> ${e.tags?e.tags.join(", "):"-"}</div>
    </div>
  `).join("")}a.addEventListener("submit",o=>{o.preventDefault();const t=a.url.value.trim(),n=a.title.value.trim(),r=a.tags.value.split(",").map(l=>l.trim()).filter(Boolean),e=a.category.value.trim(),i=c();i.push({url:t,title:n,tags:r,category:e}),g(i),a.reset(),s(),m()});v.addEventListener("click",()=>{const o=c(),t=new Blob([JSON.stringify(o,null,2)],{type:"application/json"}),n=URL.createObjectURL(t),r=document.createElement("a");r.href=n,r.download="enlaces-linkhub.json",r.click(),URL.revokeObjectURL(n)});b.addEventListener("click",()=>{d.click()});d.addEventListener("change",o=>{const t=o.target.files[0];if(!t)return;const n=new FileReader;n.onload=r=>{try{const e=JSON.parse(r.target.result);Array.isArray(e)?(g(e),s(),m(),alert("Enlaces importados correctamente.")):alert("El archivo no tiene el formato esperado.")}catch{alert("Error al importar el archivo.")}},n.readAsText(t),d.value=""});u.addEventListener("change",()=>{s()});p.addEventListener("change",()=>{s()});m();s();
