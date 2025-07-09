(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const l of e)if(l.type==="childList")for(const d of l.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&n(d)}).observe(document,{childList:!0,subtree:!0});function a(e){const l={};return e.integrity&&(l.integrity=e.integrity),e.referrerPolicy&&(l.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?l.credentials="include":e.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function n(e){if(e.ep)return;e.ep=!0;const l=a(e);fetch(e.href,l)}})();const h=document.querySelector("#app");h.innerHTML=`
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
`;const s=document.getElementById("link-form"),v=document.getElementById("links-list"),E=document.getElementById("export-btn"),L=document.getElementById("import-btn"),g=document.getElementById("import-file"),y=document.getElementById("filter-category"),b=document.getElementById("filter-tag");function u(){return JSON.parse(localStorage.getItem("links")||"[]")}function m(r){localStorage.setItem("links",JSON.stringify(r))}function k(r){return Array.from(new Set(r.map(t=>(t.category||"").trim()).filter(Boolean)))}function x(r){return Array.from(new Set(r.flatMap(t=>(t.tags||[]).map(a=>a.trim())).filter(Boolean)))}function f(){const r=u(),t=k(r).sort((n,e)=>n.localeCompare(e,"es",{sensitivity:"base"})),a=x(r).sort((n,e)=>n.localeCompare(e,"es",{sensitivity:"base"}));y.innerHTML='<option value="">Todas</option>'+t.map(n=>`<option value="${n}">${n}</option>`).join(""),b.innerHTML='<option value="">Todas</option>'+a.map(n=>`<option value="${n}">${n}</option>`).join("")}function p(){const r=u();let t=r;const a=y.value,n=b.value;if(a&&(t=t.filter(i=>(i.category||"")===a)),n&&(t=t.filter(i=>(i.tags||[]).map(String).includes(n))),t.length===0){v.innerHTML="<p>No hay enlaces guardados.</p>";return}const e=t.filter(i=>i.pinned),l=t.filter(i=>!i.pinned);e.sort((i,o)=>(i.title||"").localeCompare(o.title||"","es",{sensitivity:"base"})),l.sort((i,o)=>(i.title||"").localeCompare(o.title||"","es",{sensitivity:"base"}));const d=i=>i.map((o,c)=>`
    <div class="link-item${o.pinned?" pinned":""}" data-idx="${r.indexOf(o)}">
      <a href="${o.url}" target="_blank">${o.title}</a>
      <div><strong>Categoría:</strong> ${o.category||"-"}</div>
      <div><strong>Etiquetas:</strong> ${o.tags?o.tags.join(", "):"-"}</div>
      <button class="edit-link" style="margin-top:0.5em;">Editar</button>
      <button class="pin-link" style="margin-top:0.5em;">${o.pinned?"Desfijar":"Fijar"}</button>
      <button class="delete-link" style="margin-top:0.5em;color:#c00;background:#fff3f3;border:1px solid #c00;">Eliminar</button>
    </div>
  `).join("");v.innerHTML=(e.length?'<div style="font-size:0.95em;color:#535bf2;margin-bottom:0.5em;">Fijados</div>'+d(e):"")+d(l),document.querySelectorAll(".edit-link").forEach(i=>{i.onclick=function(){const o=this.parentElement.getAttribute("data-idx"),c=u()[o];s.url.value=c.url,s.title.value=c.title,s.tags.value=(c.tags||[]).join(", "),s.category.value=c.category||"",s.setAttribute("data-edit",o),s.querySelector('button[type="submit"]').textContent="Guardar cambios",s.scrollIntoView({behavior:"smooth"})}}),document.querySelectorAll(".pin-link").forEach(i=>{i.onclick=function(){const o=this.parentElement.getAttribute("data-idx"),c=u();c[o].pinned=!c[o].pinned,m(c),p()}}),document.querySelectorAll(".delete-link").forEach(i=>{i.onclick=function(){const o=this.parentElement.getAttribute("data-idx");if(confirm("¿Seguro que quieres eliminar este enlace?")){const c=u();c.splice(o,1),m(c),p(),f()}}})}s.addEventListener("submit",r=>{r.preventDefault();const t=s.url.value.trim(),a=s.title.value.trim(),n=s.tags.value.split(",").map(i=>i.trim()).filter(Boolean),e=s.category.value.trim(),l=u(),d=s.getAttribute("data-edit");d!==null?(l[d]={url:t,title:a,tags:n,category:e},s.removeAttribute("data-edit"),s.querySelector('button[type="submit"]').textContent="Añadir enlace"):l.push({url:t,title:a,tags:n,category:e}),m(l),s.reset(),p(),f()});E.addEventListener("click",()=>{const r=u(),t=new Blob([JSON.stringify(r,null,2)],{type:"application/json"}),a=URL.createObjectURL(t),n=document.createElement("a");n.href=a,n.download="enlaces-linkhub.json",n.click(),URL.revokeObjectURL(a)});L.addEventListener("click",()=>{g.click()});g.addEventListener("change",r=>{const t=r.target.files[0];if(!t)return;const a=new FileReader;a.onload=n=>{try{const e=JSON.parse(n.target.result);Array.isArray(e)?(m(e),p(),f(),alert("Enlaces importados correctamente.")):alert("El archivo no tiene el formato esperado.")}catch{alert("Error al importar el archivo.")}},a.readAsText(t),g.value=""});y.addEventListener("change",()=>{p()});b.addEventListener("change",()=>{p()});f();p();
