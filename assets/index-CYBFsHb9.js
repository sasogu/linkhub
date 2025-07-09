(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function a(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(t){if(t.ep)return;t.ep=!0;const r=a(t);fetch(t.href,r)}})();const v=document.querySelector("#app");v.innerHTML=`
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
`;const i=document.getElementById("link-form"),g=document.getElementById("links-list"),b=document.getElementById("export-btn"),h=document.getElementById("import-btn"),d=document.getElementById("import-file"),u=document.getElementById("filter-category"),p=document.getElementById("filter-tag");function s(){return JSON.parse(localStorage.getItem("links")||"[]")}function f(n){localStorage.setItem("links",JSON.stringify(n))}function E(n){return Array.from(new Set(n.map(e=>e.category).filter(Boolean)))}function L(n){return Array.from(new Set(n.flatMap(e=>e.tags||[]).filter(Boolean)))}function m(){const n=s(),e=E(n).sort((o,t)=>o.localeCompare(t,"es",{sensitivity:"base"})),a=L(n).sort((o,t)=>o.localeCompare(t,"es",{sensitivity:"base"}));u.innerHTML='<option value="">Todas</option>'+e.map(o=>`<option value="${o}">${o}</option>`).join(""),p.innerHTML='<option value="">Todas</option>'+a.map(o=>`<option value="${o}">${o}</option>`).join("")}function c(){const n=s();let e=n;const a=u.value,o=p.value;if(a&&(e=e.filter(t=>(t.category||"")===a)),o&&(e=e.filter(t=>(t.tags||[]).map(String).includes(o))),e.length===0){g.innerHTML="<p>No hay enlaces guardados.</p>";return}g.innerHTML=e.map((t,r)=>`
    <div class="link-item" data-idx="${n.indexOf(t)}">
      <a href="${t.url}" target="_blank">${t.title}</a>
      <div><strong>Categoría:</strong> ${t.category||"-"}</div>
      <div><strong>Etiquetas:</strong> ${t.tags?t.tags.join(", "):"-"}</div>
      <button class="edit-link" style="margin-top:0.5em;">Editar</button>
    </div>
  `).join(""),document.querySelectorAll(".edit-link").forEach(t=>{t.onclick=function(){const r=this.parentElement.getAttribute("data-idx"),l=s()[r];i.url.value=l.url,i.title.value=l.title,i.tags.value=(l.tags||[]).join(", "),i.category.value=l.category||"",i.setAttribute("data-edit",r),i.querySelector('button[type="submit"]').textContent="Guardar cambios",i.scrollIntoView({behavior:"smooth"})}})}i.addEventListener("submit",n=>{n.preventDefault();const e=i.url.value.trim(),a=i.title.value.trim(),o=i.tags.value.split(",").map(y=>y.trim()).filter(Boolean),t=i.category.value.trim(),r=s(),l=i.getAttribute("data-edit");l!==null?(r[l]={url:e,title:a,tags:o,category:t},i.removeAttribute("data-edit"),i.querySelector('button[type="submit"]').textContent="Añadir enlace"):r.push({url:e,title:a,tags:o,category:t}),f(r),i.reset(),c(),m()});b.addEventListener("click",()=>{const n=s(),e=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),a=URL.createObjectURL(e),o=document.createElement("a");o.href=a,o.download="enlaces-linkhub.json",o.click(),URL.revokeObjectURL(a)});h.addEventListener("click",()=>{d.click()});d.addEventListener("change",n=>{const e=n.target.files[0];if(!e)return;const a=new FileReader;a.onload=o=>{try{const t=JSON.parse(o.target.result);Array.isArray(t)?(f(t),c(),m(),alert("Enlaces importados correctamente.")):alert("El archivo no tiene el formato esperado.")}catch{alert("Error al importar el archivo.")}},a.readAsText(e),d.value=""});u.addEventListener("change",()=>{c()});p.addEventListener("change",()=>{c()});m();c();
