(function () {
  'use strict';

  // ===== SECURITY HELPERS =====
  function sanitize(str) {
    if (typeof str !== 'string') return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
  var lastScanTime = 0;
  var codeAttempts = [];
  function canScan() {
    var now = Date.now();
    if (now - lastScanTime < 5000) return false; // 5 saniye bekleme
    return true;
  }
  function canEnterCode() {
    var now = Date.now();
    // Son 60 saniyedeki denemeleri filtrele
    codeAttempts = codeAttempts.filter(function(t) { return now - t < 60000; });
    if (codeAttempts.length >= 10) return false; // Dakikada max 10 deneme
    codeAttempts.push(now);
    return true;
  }
  function isValidCode(code) {
    return /^[A-Z0-9]{4,6}$/.test(code);
  }
  function isValidName(name) {
    return typeof name === 'string' && name.length >= 1 && name.length <= 20 && !/[<>"'&]/.test(name);
  }

  var AVATARS = ['🌱','🌻','🐝','🦋','🌍','🐢','🐼','🦊','🐬','🦜','🐘','🌺'];

  var MATERIALS = [
    { id:'kagit',   name:'Kağıt',         icon:'📄', pts:10, cssClass:'kagit',
      info:'📚 Kağıt geri dönüşümü 1 ağacı kurtarır! Kitaplar, gazeteler ve kartonlar geri dönüştürülebilir.' },
    { id:'plastik', name:'Plastik',        icon:'🧴', pts:15, cssClass:'plastik',
      info:'🧴 Plastik doğada 450 yıl kalır! Pet şişeler, poşetler ve kapaklar geri dönüştürülebilir.' },
    { id:'cam',     name:'Cam',            icon:'🫙', pts:20, cssClass:'cam',
      info:'🫙 Cam %100 geri dönüştürülebilir ve sonsuz kez kullanılabilir! Şişeler ve kavanozlar atma!' },
    { id:'metal',   name:'Metal',          icon:'🥫', pts:25, cssClass:'metal',
      info:'🥫 Alüminyum kutu geri dönüşümü %95 enerji tasarrufu sağlar! Konserve kutuları da dahil.' },
    { id:'organik', name:'Organik',        icon:'🍂', pts:10, cssClass:'organik',
      info:'🍂 Meyve kabukları ve yemek artıkları kompost olur! Toprak için süper gübre.' },
    { id:'pil',     name:'Pil/Elektronik', icon:'🔋', pts:30, cssClass:'pil',
      info:'🔋 1 pil 1 milyon litre suyu kirletebilir! Pilleri asla çöpe atma, toplama kutusuna bırak.' }
  ];

  var LEVELS = [
    { min:0,   max:99,    name:'🌱 Çevre Dostu',              desc:'Geri dönüşüm yolculuğun başlıyor!' },
    { min:100, max:299,   name:'♻️ Geri Dönüşüm Kahramanı',  desc:'Harika gidiyorsun, dünya sana teşekkür eder!' },
    { min:300, max:599,   name:'🌍 Dünya Koruyucusu',         desc:'Gerçek bir çevre savaşçısısın!' },
    { min:600, max:99999, name:'🏆 Ekoloji Efsanesi',         desc:'Efsane oldun! Herkes seni örnek almalı!' }
  ];

  var BADGES = [
    {id:'b1',tier:'bronz',name:'İlk Adım',icon:'👣',desc:'İlk geri dönüşümünü yap',check:function(d){return d.totalScans>=1;},progress:function(d){return Math.min(d.totalScans,1)+'/1';}},
    {id:'b2',tier:'bronz',name:'Üçlü Başlangıç',icon:'🎯',desc:'3 geri dönüşüm yap',check:function(d){return d.totalScans>=3;},progress:function(d){return Math.min(d.totalScans,3)+'/3';}},
    {id:'b3',tier:'bronz',name:'Puan Avcısı',icon:'💰',desc:'50 puan topla',check:function(d){return d.totalPoints>=50;},progress:function(d){return Math.min(d.totalPoints,50)+'/50';}},
    {id:'b4',tier:'bronz',name:'İki Gün Seri',icon:'📅',desc:'2 gün üst üste tara',check:function(d){return d.maxStreak>=2;},progress:function(d){return Math.min(d.maxStreak,2)+'/2';}},
    {id:'s1',tier:'gumus',name:'Beşli Yıldız',icon:'⭐',desc:'5 geri dönüşüm yap',check:function(d){return d.totalScans>=5;},progress:function(d){return Math.min(d.totalScans,5)+'/5';}},
    {id:'s2',tier:'gumus',name:'Kağıt Dostu',icon:'📄',desc:'5 kağıt geri dönüştür',check:function(d){return(d.categoryCounts.kagit||0)>=5;},progress:function(d){return Math.min(d.categoryCounts.kagit||0,5)+'/5';}},
    {id:'s3',tier:'gumus',name:'Plastik Avcısı',icon:'🧴',desc:'5 plastik geri dönüştür',check:function(d){return(d.categoryCounts.plastik||0)>=5;},progress:function(d){return Math.min(d.categoryCounts.plastik||0,5)+'/5';}},
    {id:'s4',tier:'gumus',name:'Hafta Kahramanı',icon:'🗓️',desc:'Bir haftada 50 puan topla',check:function(d){return d.weekPoints>=50;},progress:function(d){return Math.min(d.weekPoints,50)+'/50';}},
    {id:'s5',tier:'gumus',name:'Çeşitçi',icon:'🌈',desc:'3 farklı malzeme dönüştür',check:function(d){var c=0;for(var k in d.categoryCounts)if(d.categoryCounts[k]>0)c++;return c>=3;},progress:function(d){var c=0;for(var k in d.categoryCounts)if(d.categoryCounts[k]>0)c++;return Math.min(c,3)+'/3';}},
    {id:'g1',tier:'altin',name:'Cam Ustası',icon:'🫙',desc:'10 cam geri dönüştür',check:function(d){return(d.categoryCounts.cam||0)>=10;},progress:function(d){return Math.min(d.categoryCounts.cam||0,10)+'/10';}},
    {id:'g2',tier:'altin',name:'Seri Ustası',icon:'🔥',desc:'5 gün üst üste tara',check:function(d){return d.maxStreak>=5;},progress:function(d){return Math.min(d.maxStreak,5)+'/5';}},
    {id:'g3',tier:'altin',name:'200 Kulübü',icon:'🏅',desc:'200 puan topla',check:function(d){return d.totalPoints>=200;},progress:function(d){return Math.min(d.totalPoints,200)+'/200';}},
    {id:'g4',tier:'altin',name:'Metal Uzmanı',icon:'🥫',desc:'10 metal geri dönüştür',check:function(d){return(d.categoryCounts.metal||0)>=10;},progress:function(d){return Math.min(d.categoryCounts.metal||0,10)+'/10';}},
    {id:'g5',tier:'altin',name:'Pil Koruyucu',icon:'🔋',desc:'10 pil geri dönüştür',check:function(d){return(d.categoryCounts.pil||0)>=10;},progress:function(d){return Math.min(d.categoryCounts.pil||0,10)+'/10';}},
    {id:'d1',tier:'elmas',name:'50 Tarama',icon:'🌟',desc:'50 toplam geri dönüşüm',check:function(d){return d.totalScans>=50;},progress:function(d){return Math.min(d.totalScans,50)+'/50';}},
    {id:'d2',tier:'elmas',name:'500 Kulübü',icon:'💫',desc:'500 puan topla',check:function(d){return d.totalPoints>=500;},progress:function(d){return Math.min(d.totalPoints,500)+'/500';}},
    {id:'d3',tier:'elmas',name:'10 Gün Seri',icon:'🔥',desc:'10 gün üst üste tara',check:function(d){return d.maxStreak>=10;},progress:function(d){return Math.min(d.maxStreak,10)+'/10';}},
    {id:'d4',tier:'elmas',name:'Tam Koleksiyon',icon:'👑',desc:'6 farklı malzeme dönüştür',check:function(d){var c=0;for(var k in d.categoryCounts)if(d.categoryCounts[k]>0)c++;return c>=6;},progress:function(d){var c=0;for(var k in d.categoryCounts)if(d.categoryCounts[k]>0)c++;return Math.min(c,6)+'/6';}}
  ];
  var TIER_INFO={bronz:{label:'🥉 Bronz',color:'#CD7F32'},gumus:{label:'🥈 Gümüş',color:'#8A8A8A'},altin:{label:'🥇 Altın',color:'#DAA520'},elmas:{label:'💎 Elmas',color:'#00BCD4'}};
  var TIER_ORDER=['bronz','gumus','altin','elmas'];

  var MOCK_USERS = [
    {name:'Ayşe K.',avatar:'🌻',ptsAll:1240,ptsWeek:320},{name:'Mert B.',avatar:'🐝',ptsAll:980,ptsWeek:210},
    {name:'Zeynep A.',avatar:'🦋',ptsAll:870,ptsWeek:180},{name:'Burak T.',avatar:'🌍',ptsAll:720,ptsWeek:150},
    {name:'Elif S.',avatar:'🐢',ptsAll:650,ptsWeek:140},{name:'Can M.',avatar:'🌱',ptsAll:520,ptsWeek:110},
    {name:'Selin D.',avatar:'🌻',ptsAll:410,ptsWeek:90},{name:'Oğuz R.',avatar:'🐝',ptsAll:330,ptsWeek:70},
    {name:'Deniz Y.',avatar:'🦋',ptsAll:220,ptsWeek:55}
  ];

  var BIN_DB = {
    'ECO001':{n:'Okul Bahcesi Kutusu',l:'A Blok Girisi'},'ECO002':{n:'Kantin Geri Donusum',l:'B Blok Kantin'},
    'ECO003':{n:'Kutuphane Kutusu',l:'Merkez Kutuphane'},'ECO004':{n:'Spor Salonu Kutusu',l:'Spor Kompleksi'},
    'ECO005':{n:'Park Geri Donusum',l:'Yesil Park Girisi'}
  };

  var FUN_FACTS = [
    '🌳 1 ton kağıt geri dönüştürmek 17 ağaç kurtarır!',
    '🧴 Bir plastik şişe doğada 450 yıl kalır!',
    '🫙 Cam sonsuz kez geri dönüştürülebilir!',
    '🥫 Alüminyum geri dönüşümü %95 enerji tasarrufu sağlar!',
    '💧 1 kg kağıt geri dönüşümü 26 litre su kurtarır!',
    '🔋 1 pil 1 milyon litre suyu kirletebilir!',
    '🌍 Geri dönüşümle sera gazı %30 azalır!',
    '🐢 Deniz kaplumbağaları plastik poşetleri denizanası sanır!',
    '🌱 Her geri dönüşüm dünyayı biraz daha yeşil yapar!',
    '♻️ Türkiye\'de yılda 31 milyon ton atık üretiliyor!'
  ];

  var state = loadState();
  var currentBin = null;
  var qrScanner = null;
  var selectedAvatar = state.avatar || '';
  var db = null;
  var currentUid = null;

  // Firebase config
  var firebaseConfig = {
    apiKey: 'AIzaSyBMCDH9hBJBaDk3AkSmkVpS2UeXvNujf7s',
    authDomain: 'geri-donusum-2e08b.firebaseapp.com',
    projectId: 'geri-donusum-2e08b',
    storageBucket: 'geri-donusum-2e08b.firebasestorage.app',
    messagingSenderId: '35534864072',
    appId: '1:35534864072:web:bae4b79b0c25f842e0affd'
  };

  function getDefault() {
    return {name:'',avatar:'',totalPoints:0,totalScans:0,categoryCounts:{},activities:[],onboarded:false,firstScanDone:false,streak:0,maxStreak:0,lastScanDate:''};
  }
  function loadState() {
    try { var s=JSON.parse(localStorage.getItem('ecoscan_state')); if(s){var d=getDefault();for(var k in d)if(!(k in s))s[k]=d[k];return s;} } catch(e){}
    return getDefault();
  }
  function saveState(){try{localStorage.setItem('ecoscan_state',JSON.stringify(state));}catch(e){} syncToFirestore();}

  // ===== FIREBASE =====
  function initFirebase(){
    if(typeof firebase==='undefined'){
      // SDK not loaded yet, retry
      setTimeout(initFirebase, 500);
      return;
    }
    try{
      firebase.initializeApp(firebaseConfig);
      db=firebase.firestore();
      console.log('[EcoScan] Firebase initialized');
      firebase.auth().signInAnonymously().then(function(cred){
        currentUid=cred.user.uid;
        console.log('[EcoScan] Auth OK, uid:', currentUid);
        if(state.onboarded) syncToFirestore();
      }).catch(function(e){console.error('[EcoScan] Auth error:',e);});
    }catch(e){console.error('[EcoScan] Firebase init error:',e);}
  }

  function getEarnedBadges(){
    var bd={totalScans:state.totalScans,totalPoints:state.totalPoints,categoryCounts:state.categoryCounts,weekPoints:getWeekPoints(),maxStreak:state.maxStreak||0};
    var earned=[];
    for(var i=0;i<BADGES.length;i++) if(BADGES[i].check(bd)) earned.push(BADGES[i].id);
    return earned;
  }

  function syncToFirestore(){
    if(!db||!currentUid||!state.onboarded) return;
    var wp=getWeekPoints();
    db.collection('users').doc(currentUid).set({
      name:state.name, avatar:state.avatar,
      totalPoints:state.totalPoints, totalScans:state.totalScans,
      weekPoints:wp, streak:state.streak,
      maxStreak:state.maxStreak||0,
      categoryCounts:state.categoryCounts||{},
      earnedBadges:getEarnedBadges(),
      lastUpdate:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true}).then(function(){
      console.log('[EcoScan] Synced to Firestore OK');
    }).catch(function(e){console.error('[EcoScan] Sync error:',e);});
  }

  function fetchLeaderboard(tab,callback){
    if(!db){callback([]);return;}
    var field=(tab==='week')?'weekPoints':'totalPoints';
    db.collection('users').orderBy(field,'desc').limit(20).get().then(function(snap){
      var list=[];
      snap.forEach(function(doc){
        var d=doc.data();
        list.push({uid:doc.id,name:d.name||'?',avatar:d.avatar||'🌱',ptsAll:d.totalPoints||0,ptsWeek:d.weekPoints||0,streak:d.streak||0,earnedBadges:d.earnedBadges||[],isUser:doc.id===currentUid,isMock:false});
      });
      callback(list);
    }).catch(function(e){console.error('[EcoScan] Fetch error:',e);callback([]);});
  }
  function $(id){return document.getElementById(id);}
  function todayStr(){return new Date().toISOString().slice(0,10);}
  function getTodayScans(){var t=todayStr(),c=0;for(var i=0;i<state.activities.length;i++)if(state.activities[i].date===t)c++;return c;}
  function getWeekScans(){var w=new Date(Date.now()-7*864e5).toISOString().slice(0,10),c=0;for(var i=0;i<state.activities.length;i++)if(state.activities[i].date>=w)c++;return c;}
  function getWeekPoints(){var w=new Date(Date.now()-7*864e5).toISOString().slice(0,10),p=0;for(var i=0;i<state.activities.length;i++)if(state.activities[i].date>=w)p+=state.activities[i].pts;return p;}
  function getLevel(p){for(var i=LEVELS.length-1;i>=0;i--)if(p>=LEVELS[i].min)return LEVELS[i];return LEVELS[0];}
  function getLevelProgress(p){var l=getLevel(p);return Math.min(((p-l.min)/(l.max-l.min+1))*100,100);}
  function getNextLevel(p){var l=getLevel(p);for(var i=0;i<LEVELS.length;i++)if(LEVELS[i]===l&&i<LEVELS.length-1)return LEVELS[i+1];return null;}
  function getFavCat(){var cc=state.categoryCounts,m=0,f='';for(var k in cc)if(cc[k]>m){m=cc[k];f=k;}if(!f)return'-';for(var i=0;i<MATERIALS.length;i++)if(MATERIALS[i].id===f)return MATERIALS[i].name;return'-';}
  function timeAgo(d){var dm=Math.floor((new Date()-new Date(d))/60000);if(dm<1)return'Az önce';if(dm<60)return dm+' dk önce';var dh=Math.floor(dm/60);if(dh<24)return dh+' saat önce';return Math.floor(dh/24)+' gün önce';}
  function getMat(id){for(var i=0;i<MATERIALS.length;i++)if(MATERIALS[i].id===id)return MATERIALS[i];return MATERIALS[0];}
  function updateStreak(){var today=todayStr();if(state.lastScanDate===today)return;var y=new Date(Date.now()-864e5).toISOString().slice(0,10);state.streak=(state.lastScanDate===y)?state.streak+1:1;if(state.streak>state.maxStreak)state.maxStreak=state.streak;state.lastScanDate=today;}

  // ===== NAVIGATION =====
  function showScreen(id){
    var s=document.querySelectorAll('.screen');for(var i=0;i<s.length;i++)s[i].classList.remove('active');
    var t=$('screen-'+id);if(t)t.classList.add('active');
    var n=document.querySelectorAll('.nav-item');for(var i=0;i<n.length;i++)n[i].classList.toggle('active',n[i].getAttribute('data-screen')===id);
    if(id!=='scanner'&&qrScanner){try{qrScanner.stop();}catch(e){}qrScanner=null;}
    if(id==='home')renderHome();if(id==='leaderboard')renderLeaderboard('week');if(id==='profile')renderProfile();if(id==='scanner')startScanner();
  }

  // ===== ONBOARDING =====
  function buildAvatarGrid(containerId, onSelect) {
    var grid=$(containerId); grid.innerHTML='';
    for(var i=0;i<AVATARS.length;i++){
      (function(av){
        var b=document.createElement('button');b.className='avatar-option';b.textContent=av;b.type='button';
        if(av===selectedAvatar) b.classList.add('selected');
        b.addEventListener('click',function(){
          var all=grid.querySelectorAll('.avatar-option');for(var j=0;j<all.length;j++)all[j].classList.remove('selected');
          b.classList.add('selected');selectedAvatar=av;if(onSelect)onSelect(av);
        });
        grid.appendChild(b);
      })(AVATARS[i]);
    }
  }

  function initOnboarding(){
    buildAvatarGrid('avatar-grid', function(){ checkJoin(); });
    $('input-name').addEventListener('input',checkJoin);
    $('btn-join').addEventListener('click',function(){
      var n=$('input-name').value.trim();if(n.length<2||!selectedAvatar)return;
      state.name=n;state.avatar=selectedAvatar;state.onboarded=true;saveState();
      $('bottom-nav').style.display='flex';showScreen('home');
      if(!state.firstScanDone){var tip=$('tutorial-tooltip');tip.classList.add('show');setTimeout(function(){tip.classList.remove('show');},5000);}
    });
  }
  function checkJoin(){$('btn-join').disabled=!($('input-name').value.trim().length>=2&&selectedAvatar);}

  // ===== HOME =====
  function renderHome(){
    $('home-avatar').textContent=state.avatar;
    $('home-greeting-text').textContent='Merhaba, '+state.name+'! 🌱';
    $('stat-total-pts').textContent=state.totalPoints;
    $('stat-today-scans').textContent=getTodayScans();
    var lv=getLevel(state.totalPoints),nx=getNextLevel(state.totalPoints);
    $('level-name').textContent=lv.name;
    $('level-sub').textContent=nx?'Sonraki: '+nx.name+' ('+nx.min+' puan)':'Maksimum seviye!';
    $('level-bar-fill').style.width=getLevelProgress(state.totalPoints)+'%';
    var sc=$('streak-card');
    if(state.streak>=2){sc.style.display='flex';$('streak-count').textContent=state.streak+' gün seri! 🔥';}else{sc.style.display='none';}
    var ts=state.totalScans;
    $('eco-trees').textContent=(ts*0.02).toFixed(1);$('eco-co2').textContent=(ts*0.5).toFixed(1)+' kg';$('eco-water').textContent=(ts*2.6).toFixed(0)+' L';
    var ws=getWeekScans(),goal=5;if(ws>=5)goal=10;if(ws>=10)goal=20;
    $('ch-title').textContent='Haftalık Görev: '+goal+' tarama yap!';
    $('ch-progress').textContent=Math.min(ws,goal)+'/'+goal+' tamamlandı'+(ws>=goal?' ✅':'');
    $('ch-bar-fill').style.width=Math.min((ws/goal)*100,100)+'%';
    var feed=$('activity-feed'),recent=state.activities.slice(-5).reverse();
    if(!recent.length){feed.innerHTML='<p class="empty-msg">Henüz aktivite yok. QR tarayarak başla!</p>';return;}
    var h='';for(var i=0;i<recent.length;i++){var a=recent[i],m=getMat(a.category);
      h+='<div class="activity-item"><div class="activity-icon '+m.cssClass+'">'+m.icon+'</div><div class="activity-info"><div class="activity-title">'+m.name+' geri dönüştürüldü</div><div class="activity-sub">'+(a.binName||'Kutu')+' · '+timeAgo(a.timestamp)+'</div></div><div class="activity-pts">+'+a.pts+'</div></div>';
    }feed.innerHTML=h;
  }

  // ===== SCANNER =====
  function startScanner(){
    var reader=$('qr-reader');reader.innerHTML='';
    if(typeof Html5Qrcode==='undefined'){reader.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;padding:20px;text-align:center;font-size:14px;">Kamera yüklenemedi. Kutu kodunu aşağıya girin.</div>';return;}
    try{qrScanner=new Html5Qrcode('qr-reader');qrScanner.start({facingMode:'environment'},{fps:10,qrbox:{width:220,height:220}},function(txt){handleQRResult(txt);},function(){}).catch(function(){reader.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;padding:20px;text-align:center;font-size:14px;">Kamera bulunamadı.<br>Kutu kodunu aşağıya girin.</div>';});}catch(e){}
  }
  function handleQRResult(text){
    try{var d=JSON.parse(text);var id=sanitize(d.id||d.binId||''),n=sanitize(d.n||d.binName||''),l=sanitize(d.l||d.location||'');
    if(id&&n){if(qrScanner){try{qrScanner.stop();}catch(e){}qrScanner=null;}currentBin={id:id,binName:n,location:l};showMaterialSelection(currentBin);}}catch(e){}
  }
  function handleCodeInput(code){
    if(!canEnterCode()){alert('Çok fazla deneme! 1 dakika bekle.');return;}
    code=code.toUpperCase().trim().replace(/[^A-Z0-9]/g,'');
    if(!isValidCode(code)){alert('Geçerli bir kutu kodu gir!\nÖrnek: R7K2M9');return;}
    var bin=BIN_DB[code];
    currentBin=bin?{id:code,binName:sanitize(bin.n),location:sanitize(bin.l)}:{id:code,binName:'Geri Donusum Kutusu #'+code,location:'Konum bilinmiyor'};
    if(qrScanner){try{qrScanner.stop();}catch(e){}qrScanner=null;}
    showMaterialSelection(currentBin);
  }

  // ===== MATERIAL SELECTION =====
  function showMaterialSelection(bin){
    $('bin-name').textContent=bin.binName;$('bin-loc').textContent='📍 '+(bin.location||'');
    var grid=$('material-grid'),h='';
    for(var i=0;i<MATERIALS.length;i++){var m=MATERIALS[i];
      h+='<div class="material-card" data-mat-id="'+m.id+'"><div class="mat-icon">'+m.icon+'</div><div class="mat-name">'+m.name+'</div><div class="mat-pts">+'+m.pts+' puan</div></div>';
    }grid.innerHTML=h;
    var cards=grid.querySelectorAll('.material-card');
    for(var i=0;i<cards.length;i++)(function(c){c.addEventListener('click',function(){selectMaterial(c.getAttribute('data-mat-id'));});})(cards[i]);
    showScreen('material');
  }

  function selectMaterial(matId){
    if(!canScan()){alert('\u00c7ok h\u0131zl\u0131! Biraz bekle.');return;}
    var mat=getMat(matId);if(!mat)return;
    lastScanTime=Date.now();
    var cards=document.querySelectorAll('.material-card');for(var i=0;i<cards.length;i++)cards[i].classList.remove('selected');
    var sel=document.querySelector('.material-card[data-mat-id="'+matId+'"]');if(sel)sel.classList.add('selected');
    var bonus=0;if(getTodayScans()+1>=3)bonus=5;var totalPts=mat.pts+bonus;
    // Günlük max 100 tarama limiti
    if(getTodayScans()>=100){alert('Bug\u00fcnk\u00fc limitine ula\u015ft\u0131n! Yar\u0131n devam et.');return;}
    state.activities.push({category:sanitize(matId),pts:totalPts,binName:currentBin?sanitize(currentBin.binName):'',binId:currentBin?sanitize(currentBin.id):'',date:todayStr(),timestamp:new Date().toISOString()});
    state.totalPoints+=totalPts;state.totalScans++;state.categoryCounts[matId]=(state.categoryCounts[matId]||0)+1;
    if(!state.firstScanDone)state.firstScanDone=true;updateStreak();saveState();
    setTimeout(function(){showCelebration(totalPts,bonus,mat);},350);
  }

  // ===== CELEBRATION =====
  function showCelebration(pts,bonus,mat){
    var msg='+'+pts+' puan kazandın!';if(bonus>0)msg+=' (Günlük Seri +'+bonus+')';
    $('cel-pts').textContent=msg;
    // Show material-specific educational info
    $('cel-fact').textContent=mat.info||FUN_FACTS[Math.floor(Math.random()*FUN_FACTS.length)];
    $('celebration').classList.add('show');
    if(typeof confetti==='function')confetti({particleCount:120,spread:80,origin:{y:0.6},colors:['#2D8C4E','#56B07A','#A8D5BA','#FFD700']});
    setTimeout(function(){$('celebration').classList.remove('show');currentBin=null;showScreen('home');},3200);
  }

  // ===== LEADERBOARD =====
  function renderLeaderboard(tab){
    var list=$('lb-list');
    list.innerHTML='<p class="empty-msg">Yükleniyor...</p>';
    fetchLeaderboard(tab,function(fbUsers){
      var isW=(tab==='week');
      var all=[];
      // Only add mock users if admin enabled it
      if(localStorage.getItem('ecoscan_mock')==='1') all=MOCK_USERS.slice();
      // Add Firebase real users (skip current user, we add separately)
      for(var i=0;i<fbUsers.length;i++){
        if(!fbUsers[i].isUser) all.push(fbUsers[i]);
      }
      // Add current user
      all.push({name:state.name,avatar:state.avatar,ptsAll:state.totalPoints,ptsWeek:getWeekPoints(),streak:state.streak||0,earnedBadges:getEarnedBadges(),isUser:true,isMock:false});
      // Sort
      all.sort(function(a,b){return isW?(b.ptsWeek-a.ptsWeek):(b.ptsAll-a.ptsAll);});
      var top=all.slice(0,10),uIn=false,h='';
      for(var i=0;i<top.length;i++){
        var u=top[i],r=i+1;
        var rb=r===1?'🥇':r===2?'🥈':r===3?'🥉':String(r);
        var tc=r<=3?' top'+r:'',uc=u.isUser?' current-user':'';
        if(u.isUser) uIn=true;
        var dn=u.isUser?(u.name+' (Sen)'):u.name;
        var clickable=u.isMock===false?' data-lb-idx="'+i+'" style="cursor:pointer"':'';
        h+='<div class="lb-item'+tc+uc+'"'+clickable+'><div class="lb-rank">'+rb+'</div><div class="lb-avatar">'+u.avatar+'</div><div class="lb-name">'+dn+'</div><div class="lb-pts">'+(isW?u.ptsWeek:u.ptsAll)+' pts</div></div>';
      }
      if(!uIn&&state.onboarded){
        var ur=0;for(var i=0;i<all.length;i++)if(all[i].isUser){ur=i+1;break;}
        if(!ur) ur=all.length;
        h+='<div style="text-align:center;color:var(--text-muted);padding:8px;">· · ·</div>';
        h+='<div class="lb-item current-user"><div class="lb-rank">'+ur+'</div><div class="lb-avatar">'+state.avatar+'</div><div class="lb-name">'+state.name+' (Sen)</div><div class="lb-pts">'+(isW?getWeekPoints():state.totalPoints)+' pts</div></div>';
      }
      list.innerHTML=h||'<p class="empty-msg">Henüz kimse yok!</p>';
      // Click handlers for real users
      var clickItems=list.querySelectorAll('[data-lb-idx]');
      for(var ci=0;ci<clickItems.length;ci++){
        (function(el){el.addEventListener('click',function(){var idx=parseInt(el.getAttribute('data-lb-idx'));if(top[idx])showUserProfile(top[idx]);});})(clickItems[ci]);
      }
    });
  }

  function showUserProfile(user){
    var m=$('user-modal');
    $('um-avatar').textContent=user.avatar;
    $('um-name').textContent=user.name;
    $('um-pts').textContent=user.ptsAll+' puan \u00b7 '+user.ptsWeek+' haftal\u0131k';
    $('um-streak').textContent=(user.streak||0)+' g\u00fcn seri \ud83d\udd25';
    var eb=user.earnedBadges||[],bh='';
    if(!eb.length){bh='<p style="color:var(--text-muted);font-size:13px;text-align:center;">Hen\u00fcz rozet kazanmam\u0131\u015f</p>';}
    else{for(var i=0;i<BADGES.length;i++){var b=BADGES[i];if(eb.indexOf(b.id)>=0)bh+='<div class="badge-card earned" style="padding:10px 6px"><div class="badge-icon">'+b.icon+'</div><div class="badge-name">'+b.name+'</div></div>';}}
    $('um-badges').innerHTML=bh;
    m.classList.add('show');
    m.addEventListener('click',function handler(e){if(e.target===m){m.classList.remove('show');m.removeEventListener('click',handler);}});
  }

  function renderProfile(){
    $('profile-avatar').textContent=state.avatar;
    $('profile-name').textContent=state.name;
    var lv=getLevel(state.totalPoints);
    $('profile-level').textContent=lv.name;
    $('profile-level-desc').textContent=lv.desc;
    $('ps-pts').textContent=state.totalPoints;$('ps-scans').textContent=state.totalScans;$('ps-fav').textContent=getFavCat();
    var bd={totalScans:state.totalScans,totalPoints:state.totalPoints,categoryCounts:state.categoryCounts,weekPoints:getWeekPoints(),maxStreak:state.maxStreak||0};
    var grid=$('badges-grid'),h='';
    for(var t=0;t<TIER_ORDER.length;t++){
      var tier=TIER_ORDER[t],ti=TIER_INFO[tier],ec=0,tc=0;
      for(var i=0;i<BADGES.length;i++)if(BADGES[i].tier===tier){tc++;if(BADGES[i].check(bd))ec++;}
      h+='<div style="grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;padding:10px 4px;margin-top:'+(t===0?'0':'16px')+';border-bottom:2px solid '+ti.color+'30;">';
      h+='<span style="font-weight:800;font-size:15px;color:'+ti.color+'">'+ti.label+'</span>';
      h+='<span style="font-size:12px;color:var(--text-muted);font-weight:600">'+ec+'/'+tc+'</span></div>';
      for(var i=0;i<BADGES.length;i++){var b=BADGES[i];if(b.tier!==tier)continue;
        var e=b.check(bd),prog=b.progress(bd);
        var pm=prog.match(/(\d+)\/(\d+)/);var pct=pm?Math.min((parseInt(pm[1])/parseInt(pm[2]))*100,100):0;
        h+='<div class="badge-card'+(e?' earned':' locked')+'">'
          +'<div class="badge-icon">'+b.icon+'</div>'
          +'<div class="badge-name">'+b.name+'</div>'
          +'<div class="badge-desc">'+b.desc+'</div>'
          +'<div class="badge-progress">'+(e?'✅ Kazanıldı!':prog)+'</div>'
          +(e?'':'<div class="badge-bar"><div class="badge-bar-fill" style="width:'+pct+'%"></div></div>')
          +'</div>';
      }
    }
    grid.innerHTML=h;
  }

  // ===== EDIT NAME & AVATAR =====
  function initEditName(){
    var modal=$('edit-modal');
    $('btn-edit-name').addEventListener('click',function(){$('edit-name-input').value=state.name;modal.classList.add('show');});
    modal.addEventListener('click',function(e){if(e.target===modal)modal.classList.remove('show');});
    $('btn-save-name').addEventListener('click',function(){
      var n=$('edit-name-input').value.trim();if(n.length>=2){state.name=n;saveState();modal.classList.remove('show');renderProfile();renderHome();}
    });
  }
  function initAvatarChange(){
    var modal=$('avatar-modal');
    $('btn-change-avatar').addEventListener('click',function(){
      selectedAvatar=state.avatar;
      buildAvatarGrid('avatar-change-grid',function(){});
      modal.classList.add('show');
    });
    modal.addEventListener('click',function(e){if(e.target===modal)modal.classList.remove('show');});
    $('btn-save-avatar').addEventListener('click',function(){
      if(selectedAvatar){state.avatar=selectedAvatar;saveState();modal.classList.remove('show');renderProfile();renderHome();}
    });
  }

  // ===== INIT =====
  function init(){
    initFirebase();
    initOnboarding();initEditName();initAvatarChange();
    var navs=document.querySelectorAll('.nav-item');
    for(var i=0;i<navs.length;i++)(function(b){b.addEventListener('click',function(){showScreen(b.getAttribute('data-screen'));});})(navs[i]);
    $('btn-scan-home').addEventListener('click',function(){showScreen('scanner');});
    $('btn-back-scanner').addEventListener('click',function(){showScreen('home');});
    $('btn-code-submit').addEventListener('click',function(){handleCodeInput($('code-input').value);});
    $('code-input').addEventListener('keydown',function(e){if(e.key==='Enter')handleCodeInput(this.value);});
    var tabs=document.querySelectorAll('.tab-btn');
    for(var i=0;i<tabs.length;i++)(function(b){b.addEventListener('click',function(){for(var j=0;j<tabs.length;j++)tabs[j].classList.remove('active');b.classList.add('active');renderLeaderboard(b.getAttribute('data-tab'));});})(tabs[i]);
    if(state.onboarded&&state.name){$('bottom-nav').style.display='flex';showScreen('home');}
    else{$('screen-onboarding').classList.add('active');}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
