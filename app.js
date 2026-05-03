(function () {
  'use strict';

  var AVATARS = ['🌱', '🌻', '🐝', '🦋', '🌍', '🐢'];

  var MATERIALS = [
    { id: 'kagit',   name: 'Kağıt',          icon: '📄', pts: 10, cssClass: 'kagit' },
    { id: 'plastik', name: 'Plastik',         icon: '🧴', pts: 15, cssClass: 'plastik' },
    { id: 'cam',     name: 'Cam',             icon: '🫙', pts: 20, cssClass: 'cam' },
    { id: 'metal',   name: 'Metal',           icon: '🥫', pts: 25, cssClass: 'metal' },
    { id: 'organik', name: 'Organik',         icon: '🍂', pts: 10, cssClass: 'organik' },
    { id: 'pil',     name: 'Pil/Elektronik',  icon: '🔋', pts: 30, cssClass: 'pil' }
  ];

  var LEVELS = [
    { min: 0,   max: 99,    name: '🌱 Çevre Dostu' },
    { min: 100, max: 299,   name: '♻️ Geri Dönüşüm Kahramanı' },
    { min: 300, max: 599,   name: '🌍 Dünya Koruyucusu' },
    { min: 600, max: 99999, name: '🏆 Ekoloji Efsanesi' }
  ];

  var BADGES = [
    { id: 'ilk_adim',       name: 'İlk Adım',        icon: '👣', check: function(d) { return d.totalScans >= 1; } },
    { id: 'cam_ustasi',     name: 'Cam Ustası',       icon: '🫙', check: function(d) { return (d.categoryCounts.cam||0) >= 10; } },
    { id: 'kagit_samp',     name: 'Kağıt Şampiyonu',  icon: '📄', check: function(d) { return (d.categoryCounts.kagit||0) >= 10; } },
    { id: 'hafta_kahraman', name: 'Hafta Kahramanı',   icon: '🗓️', check: function(d) { return d.weekPoints >= 50; } },
    { id: 'ekoloji',        name: 'Ekoloji Dostu',    icon: '🌿', check: function(d) { return d.totalPoints >= 100; } },
    { id: 'super_eco',      name: 'Süper Ekolog',     icon: '🦸', check: function(d) { return d.totalPoints >= 300; } },
    { id: 'seri_ust',       name: 'Seri Ustası',      icon: '🔥', check: function(d) { return d.maxStreak >= 5; } },
    { id: 'plastik_sav',    name: 'Plastik Savaşçı',  icon: '🧴', check: function(d) { return (d.categoryCounts.plastik||0) >= 10; } },
    { id: 'geri_don_kral',  name: 'Geri Dönüşüm Kralı', icon: '👑', check: function(d) { return d.totalScans >= 50; } }
  ];

  var MOCK_USERS = [
    { name: 'Ayşe K.',   avatar: '🌻', ptsAll: 1240, ptsWeek: 320 },
    { name: 'Mert B.',   avatar: '🐝', ptsAll: 980,  ptsWeek: 210 },
    { name: 'Zeynep A.', avatar: '🦋', ptsAll: 870,  ptsWeek: 180 },
    { name: 'Burak T.',  avatar: '🌍', ptsAll: 720,  ptsWeek: 150 },
    { name: 'Elif S.',   avatar: '🐢', ptsAll: 650,  ptsWeek: 140 },
    { name: 'Can M.',    avatar: '🌱', ptsAll: 520,  ptsWeek: 110 },
    { name: 'Selin D.',  avatar: '🌻', ptsAll: 410,  ptsWeek: 90 },
    { name: 'Oğuz R.',   avatar: '🐝', ptsAll: 330,  ptsWeek: 70 },
    { name: 'Deniz Y.',  avatar: '🦋', ptsAll: 220,  ptsWeek: 55 }
  ];

  // Bin code → bin info database
  var BIN_DB = {
    'ECO001': { n: 'Okul Bahcesi Kutusu', l: 'A Blok Girisi' },
    'ECO002': { n: 'Kantin Geri Donusum', l: 'B Blok Kantin' },
    'ECO003': { n: 'Kutuphane Kutusu',    l: 'Merkez Kutuphane' },
    'ECO004': { n: 'Spor Salonu Kutusu',  l: 'Spor Kompleksi' },
    'ECO005': { n: 'Park Geri Donusum',   l: 'Yesil Park Girisi' }
  };

  var FUN_FACTS = [
    '🌳 1 ton kağıt geri dönüştürmek 17 ağaç kurtarır!',
    '🧴 Bir plastik şişe doğada 450 yıl kalır!',
    '🫙 Cam %100 geri dönüştürülebilir ve sonsuz kez kullanılabilir!',
    '🥫 Alüminyum kutu geri dönüşümü %95 enerji tasarrufu sağlar!',
    '💧 1 kg kağıt geri dönüşümü 26 litre su tasarrufu sağlar!',
    '🔋 1 pil 1 milyon litre suyu kirletebilir!',
    '🌍 Geri dönüşüm sayesinde sera gazı emisyonu %30 azalır!',
    '♻️ Türkiye\'de yılda 31 milyon ton atık üretiliyor!',
    '🍂 Organik atıklar kompost yapılarak toprağa kazandırılır!',
    '🌱 Her geri dönüşüm eylemi dünyayı biraz daha yeşil yapar!'
  ];

  // ===== STATE =====
  var state = loadState();
  var currentBin = null;
  var qrScanner = null;
  var selectedAvatar = state.avatar || '';

  function getDefault() {
    return { name:'', avatar:'', totalPoints:0, totalScans:0, categoryCounts:{},
             activities:[], onboarded:false, firstScanDone:false, streak:0, maxStreak:0, lastScanDate:'' };
  }

  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem('ecoscan_state'));
      if (s) { var d = getDefault(); for (var k in d) { if (!(k in s)) s[k]=d[k]; } return s; }
    } catch(e) {}
    return getDefault();
  }

  function saveState() { try { localStorage.setItem('ecoscan_state', JSON.stringify(state)); } catch(e) {} }

  // ===== HELPERS =====
  function $(id) { return document.getElementById(id); }
  function todayStr() { return new Date().toISOString().slice(0,10); }

  function getTodayScans() {
    var t=todayStr(), c=0;
    for (var i=0;i<state.activities.length;i++) if(state.activities[i].date===t) c++;
    return c;
  }

  function getWeekScans() {
    var wa = new Date(Date.now()-7*864e5).toISOString().slice(0,10), c=0;
    for (var i=0;i<state.activities.length;i++) if(state.activities[i].date>=wa) c++;
    return c;
  }

  function getWeekPoints() {
    var wa = new Date(Date.now()-7*864e5).toISOString().slice(0,10), p=0;
    for (var i=0;i<state.activities.length;i++) if(state.activities[i].date>=wa) p+=state.activities[i].pts;
    return p;
  }

  function getLevel(p) { for(var i=LEVELS.length-1;i>=0;i--) if(p>=LEVELS[i].min) return LEVELS[i]; return LEVELS[0]; }

  function getLevelProgress(p) {
    var l=getLevel(p); return Math.min(((p-l.min)/(l.max-l.min+1))*100,100);
  }

  function getNextLevel(p) {
    var l=getLevel(p);
    for(var i=0;i<LEVELS.length;i++) if(LEVELS[i]===l && i<LEVELS.length-1) return LEVELS[i+1];
    return null;
  }

  function getFavCat() {
    var cc=state.categoryCounts, m=0, f='';
    for(var k in cc) if(cc[k]>m){m=cc[k];f=k;}
    if(!f) return '-';
    for(var i=0;i<MATERIALS.length;i++) if(MATERIALS[i].id===f) return MATERIALS[i].name;
    return '-';
  }

  function timeAgo(d) {
    var dm=Math.floor((new Date()-new Date(d))/60000);
    if(dm<1) return 'Az önce'; if(dm<60) return dm+' dk önce';
    var dh=Math.floor(dm/60); if(dh<24) return dh+' saat önce';
    return Math.floor(dh/24)+' gün önce';
  }

  function getMat(id) { for(var i=0;i<MATERIALS.length;i++) if(MATERIALS[i].id===id) return MATERIALS[i]; return MATERIALS[0]; }

  function updateStreak() {
    var today = todayStr();
    if (state.lastScanDate === today) return; // already scanned today
    var yesterday = new Date(Date.now()-864e5).toISOString().slice(0,10);
    if (state.lastScanDate === yesterday) {
      state.streak++;
    } else {
      state.streak = 1;
    }
    if (state.streak > state.maxStreak) state.maxStreak = state.streak;
    state.lastScanDate = today;
  }

  // ===== NAVIGATION =====
  function showScreen(id) {
    var screens = document.querySelectorAll('.screen');
    for(var i=0;i<screens.length;i++) screens[i].classList.remove('active');
    var t=$('screen-'+id); if(t) t.classList.add('active');
    var navs = document.querySelectorAll('.nav-item');
    for(var i=0;i<navs.length;i++) navs[i].classList.toggle('active', navs[i].getAttribute('data-screen')===id);
    if(id!=='scanner' && qrScanner) { try{qrScanner.stop();}catch(e){} qrScanner=null; }
    if(id==='home') renderHome();
    if(id==='leaderboard') renderLeaderboard('week');
    if(id==='profile') renderProfile();
    if(id==='scanner') startScanner();
  }

  // ===== ONBOARDING =====
  function initOnboarding() {
    var grid=$('avatar-grid'); grid.innerHTML='';
    for(var i=0;i<AVATARS.length;i++) {
      (function(av){
        var b=document.createElement('button');
        b.className='avatar-option'; b.textContent=av; b.type='button';
        b.addEventListener('click',function(){
          var all=document.querySelectorAll('.avatar-option');
          for(var j=0;j<all.length;j++) all[j].classList.remove('selected');
          b.classList.add('selected'); selectedAvatar=av; checkJoin();
        });
        grid.appendChild(b);
      })(AVATARS[i]);
    }
    $('input-name').addEventListener('input', checkJoin);
    $('btn-join').addEventListener('click', function(){
      var n=$('input-name').value.trim();
      if(n.length<2||!selectedAvatar) return;
      state.name=n; state.avatar=selectedAvatar; state.onboarded=true; saveState();
      $('bottom-nav').style.display='flex'; showScreen('home');
      if(!state.firstScanDone){ var tip=$('tutorial-tooltip'); tip.classList.add('show'); setTimeout(function(){tip.classList.remove('show');},5000); }
    });
  }

  function checkJoin() { $('btn-join').disabled=!($('input-name').value.trim().length>=2 && selectedAvatar); }

  // ===== HOME =====
  function renderHome() {
    $('home-avatar').textContent=state.avatar;
    $('home-greeting-text').textContent='Merhaba, '+state.name+'! 🌱';
    $('stat-total-pts').textContent=state.totalPoints;
    $('stat-today-scans').textContent=getTodayScans();

    var lv=getLevel(state.totalPoints), nx=getNextLevel(state.totalPoints);
    $('level-name').textContent=lv.name;
    $('level-sub').textContent=nx?'Sonraki: '+nx.name+' ('+nx.min+' puan)':'Maksimum seviye!';
    $('level-bar-fill').style.width=getLevelProgress(state.totalPoints)+'%';

    // Streak
    var sc=$('streak-card');
    if(state.streak>=2){ sc.style.display='flex'; $('streak-count').textContent=state.streak+' gün seri! 🔥'; }
    else { sc.style.display='none'; }

    // Eco impact (approximate)
    var ts=state.totalScans;
    $('eco-trees').textContent=(ts*0.02).toFixed(1);
    $('eco-co2').textContent=(ts*0.5).toFixed(1)+' kg';
    $('eco-water').textContent=(ts*2.6).toFixed(0)+' L';

    // Weekly challenge
    var ws=getWeekScans(), goal=5;
    if(ws>=5) goal=10; if(ws>=10) goal=20;
    var pct=Math.min((ws/goal)*100,100);
    $('ch-title').textContent='Haftalık Görev: '+goal+' tarama yap!';
    $('ch-progress').textContent=Math.min(ws,goal)+'/'+goal+' tamamlandı'+(ws>=goal?' ✅':'');
    $('ch-bar-fill').style.width=pct+'%';

    // Activity feed
    var feed=$('activity-feed'), recent=state.activities.slice(-5).reverse();
    if(!recent.length){ feed.innerHTML='<p class="empty-msg">Henüz aktivite yok. QR tarayarak başla!</p>'; return; }
    var h='';
    for(var i=0;i<recent.length;i++){
      var a=recent[i], m=getMat(a.category);
      h+='<div class="activity-item"><div class="activity-icon '+m.cssClass+'">'+m.icon+'</div>'+
        '<div class="activity-info"><div class="activity-title">'+m.name+' geri dönüştürüldü</div>'+
        '<div class="activity-sub">'+(a.binName||'Kutu')+' · '+timeAgo(a.timestamp)+'</div></div>'+
        '<div class="activity-pts">+'+a.pts+'</div></div>';
    }
    feed.innerHTML=h;
  }

  // ===== SCANNER =====
  function startScanner() {
    var reader=$('qr-reader'); reader.innerHTML='';
    if(typeof Html5Qrcode==='undefined'){ reader.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#fff;padding:20px;text-align:center;font-size:14px;">QR kütüphanesi yüklenemedi. Kutu kodunu aşağıya girin.</div>'; return; }
    try {
      qrScanner=new Html5Qrcode('qr-reader');
      qrScanner.start({facingMode:'environment'},{fps:10,qrbox:{width:250,height:250}},
        function(txt){ handleQRResult(txt); }, function(){}).catch(function(){
          reader.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#fff;padding:20px;text-align:center;font-size:14px;">Kamera bulunamadı.<br>Aşağıdaki kutu kodunu girin.</div>';
        });
    } catch(e){}
  }

  function handleQRResult(text) {
    try {
      var d=JSON.parse(text);
      // Support both old format (binId/binName) and new format (id/n/l)
      var binId = d.id || d.binId || '';
      var binName = d.n || d.binName || '';
      var binLoc = d.l || d.location || '';
      if(binId && binName){
        if(qrScanner){try{qrScanner.stop();}catch(e){} qrScanner=null;}
        currentBin={id:binId, binName:binName, location:binLoc};
        showMaterialSelection(currentBin);
      }
    } catch(e){}
  }

  // Handle bin code input
  function handleCodeInput(code) {
    code = code.toUpperCase().trim();
    if(!code || code.length < 4){ alert('Geçerli bir kutu kodu girin!\nÖrnek: R7K2M9'); return; }
    var bin = BIN_DB[code];
    if(bin){
      currentBin={id:code, binName:bin.n, location:bin.l};
    } else {
      // Accept any valid code — use generic name
      currentBin={id:code, binName:'Geri Donusum Kutusu #'+code, location:'Konum bilinmiyor'};
    }
    if(qrScanner){try{qrScanner.stop();}catch(e){} qrScanner=null;}
    showMaterialSelection(currentBin);
  }

  // ===== MATERIAL SELECTION =====
  function showMaterialSelection(bin) {
    $('bin-name').textContent=bin.binName;
    $('bin-loc').textContent='📍 '+(bin.location||'');
    var grid=$('material-grid'), h='';
    for(var i=0;i<MATERIALS.length;i++){
      var m=MATERIALS[i];
      h+='<div class="material-card" data-mat-id="'+m.id+'"><div class="mat-icon">'+m.icon+'</div><div class="mat-name">'+m.name+'</div><div class="mat-pts">+'+m.pts+' puan</div></div>';
    }
    grid.innerHTML=h;
    var cards=grid.querySelectorAll('.material-card');
    for(var i=0;i<cards.length;i++){
      (function(c){ c.addEventListener('click',function(){ selectMaterial(c.getAttribute('data-mat-id')); }); })(cards[i]);
    }
    showScreen('material');
  }

  function selectMaterial(matId) {
    var mat=getMat(matId); if(!mat) return;
    var cards=document.querySelectorAll('.material-card');
    for(var i=0;i<cards.length;i++) cards[i].classList.remove('selected');
    var sel=document.querySelector('.material-card[data-mat-id="'+matId+'"]');
    if(sel) sel.classList.add('selected');

    var bonus=0; if(getTodayScans()+1>=3) bonus=5;
    var totalPts=mat.pts+bonus;

    state.activities.push({ category:matId, pts:totalPts, binName:currentBin?currentBin.binName:'', binId:currentBin?currentBin.id:'', date:todayStr(), timestamp:new Date().toISOString() });
    state.totalPoints+=totalPts;
    state.totalScans++;
    state.categoryCounts[matId]=(state.categoryCounts[matId]||0)+1;
    if(!state.firstScanDone) state.firstScanDone=true;
    updateStreak();
    saveState();

    setTimeout(function(){ showCelebration(totalPts, bonus); }, 350);
  }

  // ===== CELEBRATION =====
  function showCelebration(pts, bonus) {
    var msg='+'+pts+' puan kazandın!';
    if(bonus>0) msg+=' (Günlük Seri +'+bonus+')';
    $('cel-pts').textContent=msg;
    $('cel-fact').textContent=FUN_FACTS[Math.floor(Math.random()*FUN_FACTS.length)];
    $('celebration').classList.add('show');
    if(typeof confetti==='function') confetti({particleCount:120,spread:80,origin:{y:0.6},colors:['#2D8C4E','#56B07A','#A8D5BA','#FFD700']});
    setTimeout(function(){ $('celebration').classList.remove('show'); currentBin=null; showScreen('home'); }, 2800);
  }

  // ===== LEADERBOARD =====
  function renderLeaderboard(tab) {
    var list=$('lb-list'), isW=(tab==='week');
    var ud={name:state.name+' (Sen)',avatar:state.avatar,ptsAll:state.totalPoints,ptsWeek:getWeekPoints(),isUser:true};
    var all=MOCK_USERS.slice(); all.push(ud);
    all.sort(function(a,b){ return isW?(b.ptsWeek-a.ptsWeek):(b.ptsAll-a.ptsAll); });
    var top=all.slice(0,10), uIn=false, h='';
    for(var i=0;i<top.length;i++){
      var u=top[i],r=i+1;
      var rb=r===1?'🥇':r===2?'🥈':r===3?'🥉':String(r);
      var tc=r<=3?' top'+r:'', uc=u.isUser?' current-user':'';
      if(u.isUser) uIn=true;
      h+='<div class="lb-item'+tc+uc+'"><div class="lb-rank">'+rb+'</div><div class="lb-avatar">'+u.avatar+'</div><div class="lb-name">'+u.name+'</div><div class="lb-pts">'+(isW?u.ptsWeek:u.ptsAll)+' pts</div></div>';
    }
    if(!uIn){
      var ur=0; for(var i=0;i<all.length;i++) if(all[i].isUser){ur=i+1;break;}
      h+='<div style="text-align:center;color:var(--text-muted);padding:8px;">· · ·</div>';
      h+='<div class="lb-item current-user"><div class="lb-rank">'+ur+'</div><div class="lb-avatar">'+ud.avatar+'</div><div class="lb-name">'+ud.name+'</div><div class="lb-pts">'+(isW?ud.ptsWeek:ud.ptsAll)+' pts</div></div>';
    }
    list.innerHTML=h;
  }

  // ===== PROFILE =====
  function renderProfile() {
    $('profile-avatar').textContent=state.avatar;
    $('profile-name').textContent=state.name;
    $('profile-level').textContent=getLevel(state.totalPoints).name;
    $('ps-pts').textContent=state.totalPoints;
    $('ps-scans').textContent=state.totalScans;
    $('ps-fav').textContent=getFavCat();
    var bd={totalScans:state.totalScans,totalPoints:state.totalPoints,categoryCounts:state.categoryCounts,weekPoints:getWeekPoints(),maxStreak:state.maxStreak||0};
    var grid=$('badges-grid'), h='';
    for(var i=0;i<BADGES.length;i++){
      var b=BADGES[i], earned=b.check(bd);
      h+='<div class="badge-card'+(earned?'':' locked')+'"><div class="badge-icon">'+b.icon+'</div><div class="badge-name">'+b.name+'</div></div>';
    }
    grid.innerHTML=h;
  }

  // ===== EDIT NAME =====
  function initEditName() {
    var modal=$('edit-modal');
    $('btn-edit-name').addEventListener('click',function(){ $('edit-name-input').value=state.name; modal.classList.add('show'); });
    modal.addEventListener('click',function(e){ if(e.target===modal) modal.classList.remove('show'); });
    $('btn-save-name').addEventListener('click',function(){
      var n=$('edit-name-input').value.trim();
      if(n.length>=2){ state.name=n; saveState(); modal.classList.remove('show'); renderProfile(); renderHome(); }
    });
  }

  // ===== INIT =====
  function init() {
    initOnboarding();
    initEditName();

    var navs=document.querySelectorAll('.nav-item');
    for(var i=0;i<navs.length;i++)(function(b){b.addEventListener('click',function(){showScreen(b.getAttribute('data-screen'));});})(navs[i]);

    $('btn-scan-home').addEventListener('click',function(){showScreen('scanner');});
    $('btn-back-scanner').addEventListener('click',function(){showScreen('home');});

    // Code input
    $('btn-code-submit').addEventListener('click',function(){ handleCodeInput($('code-input').value); });
    $('code-input').addEventListener('keydown',function(e){ if(e.key==='Enter') handleCodeInput(this.value); });

    var tabs=document.querySelectorAll('.tab-btn');
    for(var i=0;i<tabs.length;i++)(function(b){b.addEventListener('click',function(){
      for(var j=0;j<tabs.length;j++) tabs[j].classList.remove('active');
      b.classList.add('active'); renderLeaderboard(b.getAttribute('data-tab'));
    });})(tabs[i]);

    if(state.onboarded&&state.name){ $('bottom-nav').style.display='flex'; showScreen('home'); }
    else { $('screen-onboarding').classList.add('active'); }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
