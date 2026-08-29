if (!window.clientside) window.clientside = {};

window.clientside.showContextMenu = function (data) {
    if (!data) {
        return window.dash_clientside.no_update;
    }

    const menu = document.getElementById("context-menu");
    if (menu) {
        menu.style.left = "200px";
        menu.style.top = "200px";
        menu.style.display = "block";
    }

    return data.id;
};

// ─────────────────────────────────────────────────────────────────────────────
// Plugin Hub — document-level event delegation for dynamically-rendered buttons
// Fires for ANY click matching "plugin-open-*" regardless of when added to DOM.
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener("click", function (e) {
        const btn = e.target.closest("button[id^='plugin-open-']");
        if (!btn) return;

        const pid = btn.getAttribute("id").replace("plugin-open-", "");
        if (!pid) return;

        // Hide the grid immediately for instant feedback
        const grid = document.getElementById("plugin-hub-grid");
        const detail = document.getElementById("plugin-detail-area");
        if (grid) grid.style.display = "none";
        if (detail) detail.innerHTML = "<div style='color:#aaa;padding:40px;text-align:center'>⏳ Loading " + pid + " plugin...</div>";

        // POST to Dash callback endpoint for show_plugin_detail(pid)
        const body = {
            output: "plugin-hub-grid.style...plugin-detail-area.children",
            outputs: [
                { "id": "plugin-hub-grid", "property": "style" },
                { "id": "plugin-detail-area", "property": "children" }
            ],
            inputs: [{ "id": "plugin-selected-store", "property": "data", "value": pid }],
            changedPropIds: ["plugin-selected-store.data"],
            state: []
        };

        fetch("/_dash-update-component", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                // Dash will update plugin-detail-area via its normal reconciler
                // If that doesn't happen, force-update the store so Dash reacts
                window._dashPrivateStore && window._dashPrivateStore.dispatch({
                    type: "ON_PROP_CHANGE",
                    id: "plugin-selected-store",
                    props: { data: pid }
                });
            })
            .catch(function () {
                if (detail) detail.innerHTML = "<div style='color:#f66;padding:20px'>Error loading plugin. Is the server running?</div>";
            });
    });
});

/* ═══ Aegis Floating Progress Strip v5 ═══
   Appended to document.body — bypasses Dash container CSS constraints.
   Uses !important CSS + max z-index for guaranteed visibility. */
(function(){
  'use strict';
  var ID='aegis-floating-strip', MS=500;

  /* Inject CSS into head */
  var css=document.createElement('style');
  css.textContent=
    '#'+ID+'{'+
      'position:fixed !important;'+
      'top:0 !important;'+
      'left:0 !important;'+
      'right:0 !important;'+
      'z-index:2147483647 !important;'+
      'display:none;'+
      'align-items:center;'+
      'gap:14px;'+
      'padding:8px 24px;'+
      'font-family:"JetBrains Mono",Consolas,monospace;'+
      'background:linear-gradient(90deg,#080c14 0%,#0d1420 50%,#080c14 100%) !important;'+
      'border-bottom:2px solid rgba(0,200,140,0.35) !important;'+
      'box-shadow:0 4px 30px rgba(0,200,140,0.2) !important;'+
      'backdrop-filter:blur(16px);'+
      'pointer-events:none;'+
      'transition:opacity 0.3s ease;'+
    '}'+
    '#'+ID+'.afp-show{display:flex !important;}'+
    '#'+ID+' .afp-pulse{animation:afp-glow 2s ease-in-out infinite;}'+
    '@keyframes afp-glow{0%,100%{opacity:1;}50%{opacity:0.5;}}';
  document.head.appendChild(css);

  function mk(){
    var e=document.getElementById(ID);
    if(e) return e;
    e=document.createElement('div'); e.id=ID;
    e.innerHTML=
      '<span class="afp-pulse" style="font-size:14px;margin-right:8px">📡</span>'+
      '<span id="afp-phase" style="color:#00c88c;font-size:12px;font-weight:900;letter-spacing:1px;margin-right:18px">SCANNING</span>'+
      '<span style="color:#555;font-size:8px;font-weight:700;letter-spacing:1px;margin-right:4px">TOOL</span>'+
      '<span id="afp-tool" style="color:#00e5ff;font-size:12px;font-weight:900;margin-right:14px">—</span>'+
      '<span id="afp-pct" style="color:#ffd700;font-size:12px;font-weight:900;margin-right:18px">0%</span>'+
      '<span style="flex:1"></span>'+
      '<div style="width:240px;height:6px;background:#1a2030;border-radius:4px;overflow:hidden">'+
        '<div id="afp-bar" style="width:0%;height:100%;border-radius:4px;background:linear-gradient(90deg,#00c88c,#00e5ff);transition:width 0.6s ease"></div>'+
      '</div>';
    document.body.appendChild(e);
    console.log('[Aegis] Floating progress strip v5 created');
    return e;
  }

  function sync(){
    var bar=mk(), isRunning=false;

    /* Method 1: progress bar value */
    var pb=document.getElementById('ext-pentest-progress-bar');
    var pctNum=0;
    if(pb){
      pctNum=parseInt(pb.getAttribute('aria-valuenow'))||0;
      if(pctNum>0 && pctNum<100) isRunning=true;
    }

    /* Method 2: status bar text */
    var sb=document.getElementById('ext-status-bar');
    if(sb){
      var sbt=sb.textContent.toLowerCase();
      if(sbt.indexOf('scanning')>=0||sbt.indexOf('running')>=0) isRunning=true;
    }

    /* Method 3: Activity Monitor phase */
    var amP=document.getElementById('ext-am-phase');
    if(amP){
      var pt=amP.textContent.toLowerCase();
      if(pt.indexOf('recon')>=0||pt.indexOf('vuln')>=0||
         pt.indexOf('exploit')>=0||pt.indexOf('post')>=0||
         pt.indexOf('scan')>=0) isRunning=true;
    }

    /* Show/hide */
    if(isRunning){ bar.classList.add('afp-show'); }
    else{ bar.classList.remove('afp-show'); return; }

    /* Update text */
    var d;
    d=document.getElementById('afp-phase');
    if(d && amP) d.textContent=amP.textContent||'SCANNING';

    var amT=document.getElementById('ext-am-tool');
    d=document.getElementById('afp-tool');
    if(d && amT) d.textContent=amT.textContent||'—';

    var amPct=document.getElementById('ext-am-pct');
    d=document.getElementById('afp-pct');
    if(d){ d.textContent=(amPct&&amPct.textContent)?amPct.textContent:pctNum+'%'; }

    d=document.getElementById('afp-bar');
    if(d) d.style.width=pctNum+'%';
  }

  /* Start polling after delay to let Dash mount */
  setTimeout(function(){ setInterval(sync,MS); },2000);
})();
