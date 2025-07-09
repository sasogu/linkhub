(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function i(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(t){if(t.ep)return;t.ep=!0;const r=i(t);fetch(t.href,r)}})();const h=document.querySelector("#app");h.innerHTML=`
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
`;const a=document.getElementById("link-form"),b=document.getElementById("links-list"),E=document.getElementById("export-btn"),L=document.getElementById("import-btn"),m=document.getElementById("import-file"),f=document.getElementById("filter-category"),g=document.getElementById("filter-tag");function u(){return JSON.parse(localStorage.getItem("links")||"[]")}function y(o){localStorage.setItem("links",JSON.stringify(o))}function k(o){return Array.from(new Set(o.map(e=>(e.category||"").trim()).filter(Boolean)))}function x(o){return Array.from(new Set(o.flatMap(e=>(e.tags||[]).map(i=>i.trim())).filter(Boolean)))}function v(){const o=u(),e=k(o).sort((n,t)=>n.localeCompare(t,"es",{sensitivity:"base"})),i=x(o).sort((n,t)=>n.localeCompare(t,"es",{sensitivity:"base"}));f.innerHTML='<option value="">Todas</option>'+e.map(n=>`<option value="${n}">${n}</option>`).join(""),g.innerHTML='<option value="">Todas</option>'+i.map(n=>`<option value="${n}">${n}</option>`).join("")}function p(){const o=u();let e=o;const i=f.value,n=g.value;if(i&&(e=e.filter(l=>(l.category||"")===i)),n&&(e=e.filter(l=>(l.tags||[]).map(String).includes(n))),e.length===0){b.innerHTML="<p>No hay enlaces guardados.</p>";return}const t=e.filter(l=>l.pinned),r=e.filter(l=>!l.pinned),c=l=>l.map((s,d)=>`
    <div class="link-item${s.pinned?" pinned":""}" data-idx="${o.indexOf(s)}">
      <a href="${s.url}" target="_blank">${s.title}</a>
      <div><strong>Categoría:</strong> ${s.category||"-"}</div>
      <div><strong>Etiquetas:</strong> ${s.tags?s.tags.join(", "):"-"}</div>
      <button class="edit-link" style="margin-top:0.5em;">Editar</button>
      <button class="pin-link" style="margin-top:0.5em;">${s.pinned?"Desfijar":"Fijar"}</button>
    </div>
  `).join("");b.innerHTML=(t.length?'<div style="font-size:0.95em;color:#535bf2;margin-bottom:0.5em;">Fijados</div>'+c(t):"")+c(r),document.querySelectorAll(".edit-link").forEach(l=>{l.onclick=function(){const s=this.parentElement.getAttribute("data-idx"),d=u()[s];a.url.value=d.url,a.title.value=d.title,a.tags.value=(d.tags||[]).join(", "),a.category.value=d.category||"",a.setAttribute("data-edit",s),a.querySelector('button[type="submit"]').textContent="Guardar cambios",a.scrollIntoView({behavior:"smooth"})}}),document.querySelectorAll(".pin-link").forEach(l=>{l.onclick=function(){const s=this.parentElement.getAttribute("data-idx"),d=u();d[s].pinned=!d[s].pinned,y(d),p()}})}a.addEventListener("submit",o=>{o.preventDefault();const e=a.url.value.trim(),i=a.title.value.trim(),n=a.tags.value.split(",").map(l=>l.trim()).filter(Boolean),t=a.category.value.trim(),r=u(),c=a.getAttribute("data-edit");c!==null?(r[c]={url:e,title:i,tags:n,category:t},a.removeAttribute("data-edit"),a.querySelector('button[type="submit"]').textContent="Añadir enlace"):r.push({url:e,title:i,tags:n,category:t}),y(r),a.reset(),p(),v()});E.addEventListener("click",()=>{const o=u(),e=new Blob([JSON.stringify(o,null,2)],{type:"application/json"}),i=URL.createObjectURL(e),n=document.createElement("a");n.href=i,n.download="enlaces-linkhub.json",n.click(),URL.revokeObjectURL(i)});L.addEventListener("click",()=>{m.click()});m.addEventListener("change",o=>{const e=o.target.files[0];if(!e)return;const i=new FileReader;i.onload=n=>{try{const t=JSON.parse(n.target.result);Array.isArray(t)?(y(t),p(),v(),alert("Enlaces importados correctamente.")):alert("El archivo no tiene el formato esperado.")}catch{alert("Error al importar el archivo.")}},i.readAsText(e),m.value=""});f.addEventListener("change",()=>{p()});g.addEventListener("change",()=>{p()});v();p();
