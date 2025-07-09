(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))i(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const d of r.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function s(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(e){if(e.ep)return;e.ep=!0;const r=s(e);fetch(e.href,r)}})();const L=document.querySelector("#app");L.innerHTML=`
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
`;const c=document.getElementById("link-form"),h=document.getElementById("links-list"),k=document.getElementById("export-btn"),x=document.getElementById("import-btn"),y=document.getElementById("import-file"),b=document.getElementById("filter-category"),v=document.getElementById("filter-tag"),E=document.getElementById("search");function u(){return JSON.parse(localStorage.getItem("links")||"[]")}function f(l){localStorage.setItem("links",JSON.stringify(l))}function A(l){return Array.from(new Set(l.map(n=>(n.category||"").trim()).filter(Boolean)))}function S(l){return Array.from(new Set(l.flatMap(n=>(n.tags||[]).map(s=>s.trim())).filter(Boolean)))}function g(){const l=u(),n=A(l).sort((i,e)=>i.localeCompare(e,"es",{sensitivity:"base"})),s=S(l).sort((i,e)=>i.localeCompare(e,"es",{sensitivity:"base"}));b.innerHTML='<option value="">Todas</option>'+n.map(i=>`<option value="${i}">${i}</option>`).join(""),v.innerHTML='<option value="">Todas</option>'+s.map(i=>`<option value="${i}">${i}</option>`).join("")}function p(){const l=u();let n=l;const s=b.value,i=v.value,e=(E.value||"").toLowerCase();if(s&&(n=n.filter(t=>(t.category||"")===s)),i&&(n=n.filter(t=>(t.tags||[]).map(String).includes(i))),e&&(n=n.filter(t=>t.title&&t.title.toLowerCase().includes(e)||t.url&&t.url.toLowerCase().includes(e)||t.category&&t.category.toLowerCase().includes(e)||t.tags&&t.tags.join(",").toLowerCase().includes(e))),n.length===0){h.innerHTML="<p>No hay enlaces guardados.</p>";return}const r=n.filter(t=>t.pinned),d=n.filter(t=>!t.pinned);r.sort((t,o)=>(t.title||"").localeCompare(o.title||"","es",{sensitivity:"base"})),d.sort((t,o)=>(t.title||"").localeCompare(o.title||"","es",{sensitivity:"base"}));const m=t=>t.map((o,a)=>`
    <div class="link-item${o.pinned?" pinned":""}" data-idx="${l.indexOf(o)}">
      <a href="${o.url}" target="_blank">${o.title}</a>
      <div><strong>Categoría:</strong> ${o.category||"-"}</div>
      <div><strong>Etiquetas:</strong> ${o.tags?o.tags.join(", "):"-"}</div>
      <button class="edit-link" style="margin-top:0.5em;">Editar</button>
      <button class="pin-link" style="margin-top:0.5em;">${o.pinned?"Desfijar":"Fijar"}</button>
      <button class="delete-link" style="margin-top:0.5em;color:#c00;background:#fff3f3;border:1px solid #c00;">Eliminar</button>
      <button class="share-link" style="margin-top:0.5em;color:#1a7f37;background:#e6fff3;border:1px solid #1a7f37;">Compartir</button>
    </div>
  `).join("");h.innerHTML=(r.length?'<div style="font-size:0.95em;color:#535bf2;margin-bottom:0.5em;">Fijados</div>'+m(r):"")+m(d),document.querySelectorAll(".edit-link").forEach(t=>{t.onclick=function(){const o=this.parentElement.getAttribute("data-idx"),a=u()[o];c.url.value=a.url,c.title.value=a.title,c.tags.value=(a.tags||[]).join(", "),c.category.value=a.category||"",c.setAttribute("data-edit",o),c.querySelector('button[type="submit"]').textContent="Guardar cambios",c.scrollIntoView({behavior:"smooth"})}}),document.querySelectorAll(".pin-link").forEach(t=>{t.onclick=function(){const o=this.parentElement.getAttribute("data-idx"),a=u();a[o].pinned=!a[o].pinned,f(a),p()}}),document.querySelectorAll(".delete-link").forEach(t=>{t.onclick=function(){const o=this.parentElement.getAttribute("data-idx");if(confirm("¿Seguro que quieres eliminar este enlace?")){const a=u();a.splice(o,1),f(a),p(),g()}}}),document.querySelectorAll(".share-link").forEach(t=>{t.onclick=function(){const o=this.parentElement.getAttribute("data-idx"),a=u()[o];navigator.share?navigator.share({title:a.title,text:a.title+(a.category?" ["+a.category+"]":""),url:a.url}):(navigator.clipboard.writeText(a.url),alert("Enlace copiado al portapapeles"))}})}c.addEventListener("submit",l=>{l.preventDefault();const n=c.url.value.trim(),s=c.title.value.trim(),i=c.tags.value.split(",").map(m=>m.trim()).filter(Boolean),e=c.category.value.trim(),r=u(),d=c.getAttribute("data-edit");d!==null?(r[d]={url:n,title:s,tags:i,category:e},c.removeAttribute("data-edit"),c.querySelector('button[type="submit"]').textContent="Añadir enlace"):r.push({url:n,title:s,tags:i,category:e}),f(r),c.reset(),p(),g()});k.addEventListener("click",()=>{const l=u(),n=new Blob([JSON.stringify(l,null,2)],{type:"application/json"}),s=URL.createObjectURL(n),i=document.createElement("a");i.href=s,i.download="enlaces-linkhub.json",i.click(),URL.revokeObjectURL(s)});x.addEventListener("click",()=>{y.click()});y.addEventListener("change",l=>{const n=l.target.files[0];if(!n)return;const s=new FileReader;s.onload=i=>{try{const e=JSON.parse(i.target.result);Array.isArray(e)?(f(e),p(),g(),alert("Enlaces importados correctamente.")):alert("El archivo no tiene el formato esperado.")}catch{alert("Error al importar el archivo.")}},s.readAsText(n),y.value=""});b.addEventListener("change",()=>{p()});v.addEventListener("change",()=>{p()});E.addEventListener("input",p);g();p();
