(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function o(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=o(n);fetch(n.href,i)}})();const M=document.querySelector("#app");M.innerHTML=`
  <h1>LinkHub</h1>
  <div id="dropbox-bar" style="display:flex;gap:0.5em;align-items:center;margin-bottom:0.75em;">
    <span id="dropbox-status" style="font-size:0.9em;color:#888;">Dropbox: desconectado</span>
    <button id="dropbox-connect" type="button">Conectar Dropbox</button>
    <button id="dropbox-sync" type="button" disabled>Sincronizar ahora</button>
  </div>
  <form id="link-form" hidden>
    <input type="url" id="url" placeholder="Enlace (https://...)" required />
    <input type="text" id="title" placeholder="Título" required />
    <input type="text" id="tags" list="tags-datalist" placeholder="Etiquetas (separadas por coma)" />
    <datalist id="tags-datalist"></datalist>
    <input type="text" id="category" list="categories-datalist" placeholder="Categoría" />
    <datalist id="categories-datalist"></datalist>
    <div style="margin-top:0.6em;display:flex;gap:0.5em;flex-wrap:wrap;justify-content:center;">
      <button type="submit">Añadir enlace</button>
    </div>
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
`;let k=null;(function(){try{let t=function(){s.classList.add("open"),s.setAttribute("aria-hidden","false")},o=function(){s.classList.remove("open"),s.setAttribute("aria-hidden","true")};const a=document.getElementById("link-form"),n=document.createElement("div");n.id="top-actions",n.style.margin="0.5em 0",a&&a.parentNode&&a.insertAdjacentElement("afterend",n);const i=document.createElement("button");i.id="add-open",i.type="button",i.className="btn--primary",i.textContent="Añadir enlace",n.appendChild(i),M.insertAdjacentHTML("beforeend",`
      <div id="add-modal" class="modal-backdrop" aria-hidden="true">
        <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="add-title">
          <div class="modal-header">
            <h2 id="add-title">Añadir enlace</h2>
            <button id="add-close" type="button" aria-label="Cerrar">✕</button>
          </div>
          <div class="modal-section">
            <div id="add-form-slot"></div>
          </div>
          <div class="modal-footer">
            <button id="add-close-2" type="button">Cerrar</button>
          </div>
        </div>
      </div>
    `);const s=document.getElementById("add-modal");document.getElementById("add-form-slot").appendChild(a),a.hidden=!1;const r=a.querySelector('button[type="submit"]');r&&r.classList.add("btn--primary"),i.addEventListener("click",t),document.getElementById("add-close").addEventListener("click",o),document.getElementById("add-close-2").addEventListener("click",o),s.addEventListener("click",l=>{l.target===s&&o()}),window.__openAddModal=t}catch(t){console.warn("Add modal setup error:",t)}})();(function(){try{let t=function(){u.classList.add("open"),u.setAttribute("aria-hidden","false")},o=function(){u.classList.remove("open"),u.setAttribute("aria-hidden","true")},a=function(c){const g=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches,et=(c==="auto"?g?"light":"dark":c)==="light"?"#ffffff":"#242424";let v=document.querySelector('meta[name="theme-color"][data-override]');v||(v=document.createElement("meta"),v.setAttribute("name","theme-color"),v.setAttribute("data-override","true"),document.head.appendChild(v)),v.setAttribute("content",et)},n=function(c){const g=document.documentElement;g.classList.remove("theme-light","theme-dark"),c==="light"?g.classList.add("theme-light"):c==="dark"&&g.classList.add("theme-dark"),a(c)};const i=document.getElementById("top-actions")||function(){const c=document.getElementById("link-form"),g=document.createElement("div");return g.id="top-actions",g.style.margin="0.5em 0",c&&c.parentNode&&c.insertAdjacentElement("afterend",g),g}(),s=document.createElement("button");s.id="settings-open",s.type="button",s.className="btn--ghost",s.textContent="Configuración",i.appendChild(s),M.insertAdjacentHTML("beforeend",`
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
    `);const u=document.getElementById("settings-modal"),r=u.querySelector("#theme-select"),l=u.querySelector("#modal-dropbox"),f=u.querySelector("#modal-data"),d=document.getElementById("dropbox-bar");if(d){l.appendChild(d);const c=document.createElement("button");c.id="dropbox-disconnect",c.type="button",c.textContent="Desconectar",c.disabled=!0,d.appendChild(c),k=c}const _=document.getElementById("export-btn");if(_&&_.parentElement){const c=_.parentElement;f.appendChild(c)}const Q=document.getElementById("settings-open"),Z=document.getElementById("settings-close"),tt=document.getElementById("settings-close-2");Q.addEventListener("click",t),Z.addEventListener("click",o),tt.addEventListener("click",o),u.addEventListener("click",c=>{c.target===u&&o()});const z=localStorage.getItem("themeMode")||"auto";n(z),r&&(r.value=z,r.addEventListener("change",()=>{const c=r.value;localStorage.setItem("themeMode",c),n(c)})),window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>{(localStorage.getItem("themeMode")||"auto")==="auto"&&n("auto")})}catch(t){console.warn("Settings modal setup error:",t)}})();const p=document.getElementById("link-form"),R=document.getElementById("links-list"),ot=document.getElementById("export-btn"),nt=document.getElementById("import-btn"),C=document.getElementById("import-file"),j=document.getElementById("filter-category"),N=document.getElementById("filter-tag"),J=document.getElementById("search"),H=document.getElementById("tags-datalist"),V=document.getElementById("categories-datalist"),y=document.getElementById("dropbox-status"),T=document.getElementById("dropbox-connect"),D=document.getElementById("dropbox-sync"),F=document.getElementById("sw-version");function h(){return JSON.parse(localStorage.getItem("links")||"[]")}function A(e){localStorage.setItem("links",JSON.stringify(e)),localStorage.setItem("linksUpdatedAt",String(Date.now())),$()}function at(e){return Array.from(new Set(e.map(t=>(t.category||"").trim()).filter(Boolean)))}function it(e){return Array.from(new Set(e.flatMap(t=>(t.tags||[]).map(o=>o.trim())).filter(Boolean)))}function x(){const e=h(),t=at(e).sort((a,n)=>a.localeCompare(n,"es",{sensitivity:"base"})),o=it(e).sort((a,n)=>a.localeCompare(n,"es",{sensitivity:"base"}));j.innerHTML='<option value="">Todas</option>'+t.map(a=>`<option value="${a}">${a}</option>`).join(""),N.innerHTML='<option value="">Todas</option>'+o.map(a=>`<option value="${a}">${a}</option>`).join(""),V&&(V.innerHTML=t.map(a=>`<option value="${a}"></option>`).join("")),H&&(H.innerHTML=o.map(a=>`<option value="${a}"></option>`).join(""))}function b(){const e=h();let t=e;const o=j.value,a=N.value,n=(J.value||"").toLowerCase();if(o&&(t=t.filter(r=>(r.category||"")===o)),a&&(t=t.filter(r=>(r.tags||[]).map(String).includes(a))),n&&(t=t.filter(r=>r.title&&r.title.toLowerCase().includes(n)||r.url&&r.url.toLowerCase().includes(n)||r.category&&r.category.toLowerCase().includes(n)||r.tags&&r.tags.join(",").toLowerCase().includes(n))),t.length===0){R.innerHTML="<p>No hay enlaces guardados.</p>";return}const i=t.filter(r=>r.pinned),s=t.filter(r=>!r.pinned);i.sort((r,l)=>(r.title||"").localeCompare(l.title||"","es",{sensitivity:"base"})),s.sort((r,l)=>(r.title||"").localeCompare(l.title||"","es",{sensitivity:"base"}));const u=r=>r.map((l,f)=>`
    <div class="link-item${l.pinned?" pinned":""}" data-idx="${e.indexOf(l)}">
      <a href="${l.url}" target="_blank">${l.title}</a>
      <div><strong>Categoría:</strong> ${l.category||"-"}</div>
      <div><strong>Etiquetas:</strong> ${l.tags?l.tags.join(", "):"-"}</div>
      <div class="link-actions">
        <button class="edit-link icon-btn" aria-label="Editar" title="Editar">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM21.41 6.34c.39-.39.39-1.02 0-1.41L19.07 2.59a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        </button>
        <button class="pin-link icon-btn" aria-label="${l.pinned?"Desfijar":"Fijar"}" title="${l.pinned?"Desfijar":"Fijar"}">
          ${l.pinned?'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 12V4l1-1V2H7v1l1 1v8l-2 2v1h6v7h2v-7h6v-1l-2-2z"/></svg>':'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 12V5h1V4H7v1h1v7l-2 2v1h6v6h2v-6h6v-1l-2-2z"/></svg>'}
        </button>
        <button class="delete-link icon-btn btn--danger" aria-label="Eliminar" title="Eliminar">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 7h12v2H6V7zm2 3h8l-1 9H9L8 10zm3-7h2l1 1h5v2H3V4h5l1-1z"/></svg>
        </button>
        <button class="share-link icon-btn btn--ghost" aria-label="Compartir" title="Compartir">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.27 3.27 0 0 0 0-1.39l7-4.11A3 3 0 1 0 14 5a3 3 0 0 0 .06.6l-7 4.11a3 3 0 1 0 0 4.58l7.06 4.14A3 3 0 1 0 18 16.08z"/></svg>
        </button>
      </div>
    </div>
  `).join("");R.innerHTML=(i.length?'<div style="font-size:0.95em;color:#535bf2;margin-bottom:0.5em;">Fijados</div>'+u(i):"")+u(s),document.querySelectorAll(".edit-link").forEach(r=>{r.onclick=function(){const l=this.closest(".link-item"),f=l?l.getAttribute("data-idx"):null,d=h()[f];window.__openAddModal&&window.__openAddModal(),p.url.value=d.url,p.title.value=d.title,p.tags.value=(d.tags||[]).join(", "),p.category.value=d.category||"",p.setAttribute("data-edit",f),p.querySelector('button[type="submit"]').textContent="Guardar cambios",p.scrollIntoView({behavior:"smooth"})}}),document.querySelectorAll(".pin-link").forEach(r=>{r.onclick=function(){const l=this.closest(".link-item"),f=l?l.getAttribute("data-idx"):null,d=h();d[f].pinned=!d[f].pinned,A(d),b()}}),document.querySelectorAll(".delete-link").forEach(r=>{r.onclick=function(){const l=this.closest(".link-item"),f=l?l.getAttribute("data-idx"):null;if(confirm("¿Seguro que quieres eliminar este enlace?")){const d=h();d.splice(f,1),A(d),b(),x()}}}),document.querySelectorAll(".share-link").forEach(r=>{r.onclick=function(){const l=this.closest(".link-item"),f=l?l.getAttribute("data-idx"):null,d=h()[f];navigator.share?navigator.share({title:d.title,text:d.title+(d.category?" ["+d.category+"]":""),url:d.url}):(navigator.clipboard.writeText(d.url),alert("Enlace copiado al portapapeles"))}})}p.addEventListener("submit",e=>{e.preventDefault();const t=p.url.value.trim(),o=p.title.value.trim(),a=p.tags.value.split(",").map(r=>r.trim()).filter(Boolean),n=p.category.value.trim(),i=h(),s=p.getAttribute("data-edit");if(s!==null){const r=i[s]||{};i[s]={...r,url:t,title:o,tags:a,category:n},p.removeAttribute("data-edit"),p.querySelector('button[type="submit"]').textContent="Añadir enlace"}else i.push({url:t,title:o,tags:a,category:n,pinned:!1});A(i),p.reset(),b(),x();const u=document.getElementById("add-modal");u&&u.classList.contains("open")&&(u.classList.remove("open"),u.setAttribute("aria-hidden","true"))});ot.addEventListener("click",()=>{const e=h(),t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),o=URL.createObjectURL(t),a=document.createElement("a");a.href=o,a.download="enlaces-linkhub.json",a.click(),URL.revokeObjectURL(o)});nt.addEventListener("click",()=>{C.click()});C.addEventListener("change",e=>{const t=e.target.files[0];if(!t)return;const o=new FileReader;o.onload=a=>{try{const n=JSON.parse(a.target.result);Array.isArray(n)?(A(n),b(),x(),alert("Enlaces importados correctamente.")):alert("El archivo no tiene el formato esperado.")}catch{alert("Error al importar el archivo.")}},o.readAsText(t),C.value=""});j.addEventListener("change",()=>{b()});N.addEventListener("change",()=>{b()});J.addEventListener("input",b);x();b();const L=window.VITE_DROPBOX_APP_KEY||"",O="/linkhub/links.json";let m=null,I=null,B=!1;function w(e,t){e?(y.textContent=`Dropbox: conectado${t?" ("+t+")":""}`,y.style.color="#1a7f37",T.disabled=!0,D.disabled=!1,k&&(k.disabled=!1)):(y.textContent="Dropbox: desconectado",y.style.color="#888",T.disabled=!1,D.disabled=!0,k&&(k.disabled=!0))}function E(){return Date.now()}function P(){try{return JSON.parse(localStorage.getItem("dropboxAuth")||"null")}catch{return null}}function q(e){m=e,e?localStorage.setItem("dropboxAuth",JSON.stringify(e)):localStorage.removeItem("dropboxAuth")}async function rt(e){const o=new TextEncoder().encode(e),a=await crypto.subtle.digest("SHA-256",o),n=new Uint8Array(a);let i="";for(let s=0;s<n.length;s++)i+=String.fromCharCode(n[s]);return btoa(i).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function st(e=64){const t=new Uint8Array(e);return crypto.getRandomValues(t),Array.from(t).map(o=>("0"+o.toString(16)).slice(-2)).join("")}async function lt(){if(!L){alert("Falta configurar VITE_DROPBOX_APP_KEY.");return}const e=st(64),t=await rt(e);sessionStorage.setItem("dbx_code_verifier",e);const o=window.location.origin+window.location.pathname,n=`https://www.dropbox.com/oauth2/authorize?${new URLSearchParams({client_id:L,response_type:"code",code_challenge:t,code_challenge_method:"S256",token_access_type:"offline",redirect_uri:o}).toString()}`;window.location.assign(n)}async function ct(e){const t=sessionStorage.getItem("dbx_code_verifier"),o=window.location.origin+window.location.pathname,a=new URLSearchParams({code:e,grant_type:"authorization_code",client_id:L,redirect_uri:o,code_verifier:t||""}),n=await fetch("https://api.dropboxapi.com/oauth2/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:a});if(!n.ok)throw new Error("No se pudo obtener el token de Dropbox");const i=await n.json(),s=E()+(i.expires_in?i.expires_in*1e3-60*1e3:3*3600*1e3);q({access_token:i.access_token,refresh_token:i.refresh_token||null,expires_at:s,account_id:i.account_id||null})}async function W(){if(!m?.refresh_token)return!1;const e=new URLSearchParams({grant_type:"refresh_token",refresh_token:m.refresh_token,client_id:L}),t=await fetch("https://api.dropboxapi.com/oauth2/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:e});if(!t.ok)return!1;const o=await t.json();return m.access_token=o.access_token,m.expires_at=E()+(o.expires_in?o.expires_in*1e3-60*1e3:3*3600*1e3),q(m),!0}async function U(){return m=m||P(),!m||m.expires_at&&m.expires_at<E()&&!await W()?null:m.access_token}async function S(e,t,o={}){const a=await U();if(!a)throw new Error("No autenticado en Dropbox");const n=Object.assign({},o.headers||{},{Authorization:`Bearer ${a}`}),i=await fetch(t,{method:e,...o,headers:n});if(i.status===401){if(!await W())throw new Error("Sesión de Dropbox expirada");return S(e,t,o)}return i}async function G(){try{const e=await S("POST","https://api.dropboxapi.com/2/users/get_current_account",{headers:{"Content-Type":"application/json"},body:"null"});return e.ok&&(await e.json()).name?.display_name||null}catch{return null}}async function K(){const e=await S("POST","https://content.dropboxapi.com/2/files/download",{headers:{"Dropbox-API-Arg":JSON.stringify({path:O})}});if(e.status===409)return null;if(!e.ok)throw new Error("Descarga de Dropbox fallida");const t=await e.text();try{return JSON.parse(t)}catch{return null}}async function dt(e){const t=e.split("/").filter(Boolean);if(t.length<=1)return;const o="/"+t.slice(0,t.length-1).join("/");try{await S("POST","https://api.dropboxapi.com/2/files/create_folder_v2",{headers:{"Content-Type":"application/json"},body:JSON.stringify({path:o,autorename:!1})})}catch{}}async function X(e){const t=JSON.stringify(e);if(await dt(O),!(await S("POST","https://content.dropboxapi.com/2/files/upload",{headers:{"Content-Type":"application/octet-stream","Dropbox-API-Arg":JSON.stringify({path:O,mode:"overwrite",mute:!0})},body:t})).ok)throw new Error("Subida a Dropbox fallida")}async function ut(){if(!await U()){w(!1);return}const t=await G();w(!0,t);try{const o=await K(),a=h(),n=Number(localStorage.getItem("linksUpdatedAt")||"0"),i=Number(o?.updatedAt||0);o&&i>=n?(localStorage.setItem("linksUpdatedAt",String(i)),localStorage.setItem("links",JSON.stringify(o.links||[])),b(),x()):await X({links:a,updatedAt:E(),schema:1})}catch(o){console.warn("Sync inicial Dropbox:",o)}}function $(e=800){P()&&(I&&clearTimeout(I),I=setTimeout(()=>{Y().catch(()=>{})},e))}async function Y(){if(B)return;if(!await U()){w(!1);return}B=!0,y.textContent="Dropbox: sincronizando...";try{const t=await K(),o=h(),a=Number(localStorage.getItem("linksUpdatedAt")||"0"),n=Number(t?.updatedAt||0);if(t&&n>a)localStorage.setItem("links",JSON.stringify(t.links||[])),localStorage.setItem("linksUpdatedAt",String(n)),b(),x();else if(a>=n){const s=E();await X({links:o,updatedAt:s,schema:1}),localStorage.setItem("linksUpdatedAt",String(s))}const i=await G();w(!0,i),y.textContent="Dropbox: sincronizado"}catch(t){console.warn("Sync Dropbox:",t),y.textContent="Dropbox: error de sincronización"}finally{B=!1}}T.addEventListener("click",lt);D.addEventListener("click",()=>{Y()});document.addEventListener("click",e=>{const t=e.target;t&&t.id==="dropbox-disconnect"&&(q(null),w(!1))});window.addEventListener("online",()=>$(200));function pt(){if("serviceWorker"in navigator){if(navigator.serviceWorker.controller)try{navigator.serviceWorker.controller.postMessage({type:"GET_SW_VERSION"})}catch{}navigator.serviceWorker.ready&&navigator.serviceWorker.ready.then(e=>{try{e&&e.active&&e.active.postMessage({type:"GET_SW_VERSION"})}catch{}}).catch(()=>{})}}"serviceWorker"in navigator&&(navigator.serviceWorker.addEventListener("message",e=>{const t=e.data||{};t.type==="SW_VERSION"&&F&&(F.textContent=String(t.version))}),setTimeout(pt,500));(async function(){try{const t=new URL(window.location.href),o=t.searchParams.get("code");o&&(await ct(o),t.searchParams.delete("code"),t.searchParams.delete("state"),history.replaceState({},"",t.toString()))}catch(t){console.warn("OAuth Dropbox:",t)}finally{m=P(),w(!!m),m&&(ut(),setInterval(()=>$(0),5*60*1e3))}})();
