(function () {
  'use strict';

  // ===== TOAST NOTIFICATION =====
  function showToast(msg, type) {
    type = type || 'warn';
    var icons = { warn: 'âš ï¸', error: 'ğŸš«', info: 'â„¹ï¸', success: 'âœ…' };
    var c = document.getElementById('toast-container');
    if (!c) return;
    var t = document.createElement('div');
    t.className = 'toast ' + type;
    var ic = document.createElement('span'); ic.className = 'toast-icon'; ic.textContent = icons[type] || 'âš ï¸';
    var ms = document.createElement('span'); ms.className = 'toast-msg'; ms.textContent = msg;
    t.appendChild(ic); t.appendChild(ms);
    c.appendChild(t);
    setTimeout(function () { t.classList.add('removing'); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300); }, 3500);
  }

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

  var AVATARS = ['ğŸŒ±','ğŸŒ»','ğŸ','ğŸ¦‹','ğŸŒ','ğŸ¢','ğŸ¼','ğŸ¦Š','ğŸ¬','ğŸ¦œ','ğŸ˜','ğŸŒº'];

  var MATERIALS = [
    { id:'kagit',   name:'KaÄŸÄ±t',         icon:'ğŸ“„', pts:10, cssClass:'kagit',
      info:'ğŸ“š KaÄŸÄ±t geri dÃ¶nÃ¼ÅŸÃ¼mÃ¼ 1 aÄŸacÄ± kurtarÄ±r! Kitaplar, gazeteler ve kartonlar geri dÃ¶nÃ¼ÅŸtÃ¼rÃ¼lebilir.' },
    { id:'plastik', name:'Plastik',        icon:'ğŸ§´', pts:15, cssClass:'plastik',
      info:'ğŸ§´ Plastik doÄŸada 450 yÄ±l kalÄ±r! Pet ÅŸiÅŸeler, poÅŸetler ve kapaklar geri dÃ¶nÃ¼ÅŸtÃ¼rÃ¼lebilir.' },
    { id:'cam',     name:'Cam',            icon:'ğŸ«™', pts:20, cssClass:'cam',
      info:'ğŸ«™ Cam %100 geri dÃ¶nÃ¼ÅŸtÃ¼rÃ¼lebilir ve sonsuz kez kullanÄ±labilir! ÅiÅŸeler ve kavanozlar atma!' },
    { id:'metal',   name:'Metal',          icon:'ğŸ¥«', pts:25, cssClass:'metal',
      info:'ğŸ¥« AlÃ¼minyum kutu geri dÃ¶nÃ¼ÅŸÃ¼mÃ¼ %95 enerji tasarrufu saÄŸlar! Konserve kutularÄ± da dahil.' },
    { id:'organik', name:'Organik',        icon:'ğŸ‚', pts:10, cssClass:'organik',
      info:'ğŸ‚ Meyve kabuklarÄ± ve yemek artÄ±klarÄ± kompost olur! Toprak iÃ§in sÃ¼per gÃ¼bre.' },
    { id:'pil',     name:'Pil/Elektronik', icon:'ğŸ”‹', pts:30, cssClass:'pil',
      info:'ğŸ”‹ 1 pil 1 milyon litre suyu kirletebilir! Pilleri asla Ã§Ã¶pe atma, toplama kutusuna bÄ±rak.' }
  ];

  var LEVELS = [
    { min:0,   max:99,    name:'ğŸŒ± Ã‡evre Dostu',              desc:'Geri dÃ¶nÃ¼ÅŸÃ¼m yolculuÄŸun baÅŸlÄ±yor!' },
    { min:100, max:299,   name:'â™»ï¸ Geri DÃ¶nÃ¼ÅŸÃ¼m KahramanÄ±',  desc:'Harika gidiyorsun, dÃ¼nya sana teÅŸekkÃ¼r eder!' },
    { min:300, max:599,   name:'ğŸŒ DÃ¼nya Koruyucusu',         desc:'GerÃ§ek bir Ã§evre savaÅŸÃ§Ä±sÄ±sÄ±n!' },
    { min:600, max:99999, name:'ğŸ† Ekoloji Efsanesi',         desc:'Efsane oldun! Herkes seni Ã¶rnek almalÄ±!' }
  ];

  var BADGES = [
    {id:'b1',tier:'bronz',name:'Ä°lk AdÄ±m',icon:'ğŸ‘£',desc:'Ä°lk geri dÃ¶nÃ¼ÅŸÃ¼mÃ¼nÃ¼ yap',check:function(d){return d.totalScans>=1;},progress:function(d){return Math.min(d.totalScans,1)+'/1';}},
    {id:'b2',tier:'bronz',name:'ÃœÃ§lÃ¼ BaÅŸlangÄ±Ã§',icon:'ğŸ¯',desc:'3 geri dÃ¶nÃ¼ÅŸÃ¼m yap',check:function(d){return d.totalScans>=3;},progress:function(d){return Math.min(d.totalScans,3)+'/3';}},
    {id:'b3',tier:'bronz',name:'Puan AvcÄ±sÄ±',icon:'ğŸ’°',desc:'50 puan topla',check:function(d){return d.totalPoints>=50;},progress:function(d){return Math.min(d.totalPoints,50)+'/50';}},
    {id:'b4',tier:'bronz',name:'Ä°ki GÃ¼n Seri',icon:'ğŸ“…',desc:'2 gÃ¼n Ã¼st Ã¼ste tara',check:function(d){return d.maxStreak>=2;},progress:function(d){return Math.min(d.maxStreak,2)+'/2';}},
    {id:'s1',tier:'gumus',name:'BeÅŸli YÄ±ldÄ±z',icon:'â­',desc:'5 geri dÃ¶nÃ¼ÅŸÃ¼m yap',check:function(d){return d.totalScans>=5;},progress:function(d){return Math.min(d.totalScans,5)+'/5';}},
    {id:'s2',tier:'gumus',name:'KaÄŸÄ±t Dostu',icon:'ğŸ“„',desc:'5 kaÄŸÄ±t geri dÃ¶nÃ¼ÅŸtÃ¼r',check:function(d){return(d.categoryCounts.kagit||0)>=5;},progress:function(d){return Math.min(d.categoryCounts.kagit||0,5)+'/5';}},
    {id:'s3',tier:'gumus',name:'Plastik AvcÄ±sÄ±',icon:'ğŸ§´',desc:'5 plastik geri dÃ¶nÃ¼ÅŸtÃ¼r',check:function(d){return(d.categoryCounts.plastik||0)>=5;},progress:function(d){return Math.min(d.categoryCounts.plastik||0,5)+'/5';}},
    {id:'s4',tier:'gumus',name:'Hafta KahramanÄ±',icon:'ğŸ—“ï¸',desc:'Bir haftada 50 puan topla',check:function(d){return d.weekPoints>=50;},progress:function(d){return Math.min(d.weekPoints,50)+'/50';}},
    {id:'s5',tier:'gumus',name:'Ã‡eÅŸitÃ§i',icon:'ğŸŒˆ',desc:'3 farklÄ± malzeme dÃ¶nÃ¼ÅŸtÃ¼r',check:function(d){var c=0;for(var k in d.categoryCounts)if(d.categoryCounts[k]>0)c++;return c>=3;},progress:function(d){var c=0;for(var k in d.categoryCounts)if(d.categoryCounts[k]>0)c++;return Math.min(c,3)+'/3';}},
    {id:'g1',tier:'altin',name:'Cam UstasÄ±',icon:'ğŸ«™',desc:'10 cam geri dÃ¶nÃ¼ÅŸtÃ¼r',check:function(d){return(d.categoryCounts.cam||0)>=10;},progress:function(d){return Math.min(d.categoryCounts.cam||0,10)+'/10';}},
    {id:'g2',tier:'altin',name:'Seri UstasÄ±',icon:'ğŸ”¥',desc:'5 gÃ¼n Ã¼st Ã¼ste tara',check:function(d){return d.maxStreak>=5;},progress:function(d){return Math.min(d.maxStreak,5)+'/5';}},
    {id:'g3',tier:'altin',name:'200 KulÃ¼bÃ¼',icon:'ğŸ…',desc:'200 puan topla',check:function(d){return d.totalPoints>=200;},progress:function(d){return Math.min(d.totalPoints,200)+'/200';}},
    {id:'g4',tier:'altin',name:'Metal UzmanÄ±',icon:'ğŸ¥«',desc:'10 metal geri dÃ¶nÃ¼ÅŸtÃ¼r',check:function(d){return(d.categoryCounts.metal||0)>=10;},progress:function(d){return Math.min(d.categoryCounts.metal||0,10)+'/10';}},
    {id:'g5',tier:'altin',name:'Pil Koruyucu',icon:'ğŸ”‹',desc:'10 pil geri dÃ¶nÃ¼ÅŸtÃ¼r',check:function(d){return(d.categoryCounts.pil||0)>=10;},progress:function(d){return Math.min(d.categoryCounts.pil||0,10)+'/10';}},
    {id:'d1',tier:'elmas',name:'50 Tarama',icon:'ğŸŒŸ',desc:'50 toplam geri dÃ¶nÃ¼ÅŸÃ¼m',check:function(d){return d.totalScans>=50;},progress:function(d){return Math.min(d.totalScans,50)+'/50';}},
    {id:'d2',tier:'elmas',name:'500 KulÃ¼bÃ¼',icon:'ğŸ’«',desc:'500 puan topla',check:function(d){return d.totalPoints>=500;},progress:function(d){return Math.min(d.totalPoints,500)+'/500';}},
    {id:'d3',tier:'elmas',name:'10 GÃ¼n Seri',icon:'ğŸ”¥',desc:'10 gÃ¼n Ã¼st Ã¼ste tara',check:function(d){return d.maxStreak>=10;},progress:function(d){return Math.min(d.maxStreak,10)+'/10';}},
    {id:'d4',tier:'elmas',name:'Tam Koleksiyon',icon:'ğŸ‘‘',desc:'6 farklÄ± malzeme dÃ¶nÃ¼ÅŸtÃ¼r',check:function(d){var c=0;for(var k in d.categoryCounts)if(d.categoryCounts[k]>0)c++;return c>=6;},progress:function(d){var c=0;for(var k in d.categoryCounts)if(d.categoryCounts[k]>0)c++;return Math.min(c,6)+'/6';}}
  ];
  var TIER_INFO={bronz:{label:'ğŸ¥‰ Bronz',color:'#CD7F32'},gumus:{label:'ğŸ¥ˆ GÃ¼mÃ¼ÅŸ',color:'#8A8A8A'},altin:{label:'ğŸ¥‡ AltÄ±n',color:'#DAA520'},elmas:{label:'ğŸ’ Elmas',color:'#00BCD4'}};
  var TIER_ORDER=['bronz','gumus','altin','elmas'];

  var MOCK_USERS = [
    {name:'AyÅŸe K.',avatar:'ğŸŒ»',ptsAll:1240,ptsWeek:320},{name:'Mert B.',avatar:'ğŸ',ptsAll:980,ptsWeek:210},
    {name:'Zeynep A.',avatar:'ğŸ¦‹',ptsAll:870,ptsWeek:180},{name:'Burak T.',avatar:'ğŸŒ',ptsAll:720,ptsWeek:150},
    {name:'Elif S.',avatar:'ğŸ¢',ptsAll:650,ptsWeek:140},{name:'Can M.',avatar:'ğŸŒ±',ptsAll:520,ptsWeek:110},
    {name:'Selin D.',avatar:'ğŸŒ»',ptsAll:410,ptsWeek:90},{name:'OÄŸuz R.',avatar:'ğŸ',ptsAll:330,ptsWeek:70},
    {name:'Deniz Y.',avatar:'ğŸ¦‹',ptsAll:220,ptsWeek:55}
  ];

  var BIN_DB = {
    'ECO001':{n:'Okul Bahcesi Kutusu',l:'A Blok Girisi'},'ECO002':{n:'Kantin Geri Donusum',l:'B Blok Kantin'},
    'ECO003':{n:'Kutuphane Kutusu',l:'Merkez Kutuphane'},'ECO004':{n:'Spor Salonu Kutusu',l:'Spor Kompleksi'},
    'ECO005':{n:'Park Geri Donusum',l:'Yesil Park Girisi'}
  };

  var FUN_FACTS = [
    'ğŸŒ³ 1 ton kaÄŸÄ±t geri dÃ¶nÃ¼ÅŸtÃ¼rmek 17 aÄŸaÃ§ kurtarÄ±r!',
    'ğŸ§´ Bir plastik ÅŸiÅŸe doÄŸada 450 yÄ±l kalÄ±r!',
    'ğŸ«™ Cam sonsuz kez geri dÃ¶nÃ¼ÅŸtÃ¼rÃ¼lebilir!',
    'ğŸ¥« AlÃ¼minyum geri dÃ¶nÃ¼ÅŸÃ¼mÃ¼ %95 enerji tasarrufu saÄŸlar!',
    'ğŸ’§ 1 kg kaÄŸÄ±t geri dÃ¶nÃ¼ÅŸÃ¼mÃ¼ 26 litre su kurtarÄ±r!',
    'ğŸ”‹ 1 pil 1 milyon litre suyu kirletebilir!',
    'ğŸŒ Geri dÃ¶nÃ¼ÅŸÃ¼mle sera gazÄ± %30 azalÄ±r!',
    'ğŸ¢ Deniz kaplumbaÄŸalarÄ± plastik poÅŸetleri denizanasÄ± sanÄ±r!',
    'ğŸŒ± Her geri dÃ¶nÃ¼ÅŸÃ¼m dÃ¼nyayÄ± biraz daha yeÅŸil yapar!',
    'â™»ï¸ TÃ¼rkiye\'de yÄ±lda 31 milyon ton atÄ±k Ã¼retiliyor!'
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
        // === BLACKLIST CHECK ===
        db.collection('config').doc('deletedUsers').get().then(function(blDoc){
          if(blDoc.exists && blDoc.data().uids && blDoc.data().uids.indexOf(currentUid)>=0){
            console.log('[EcoScan] User is blacklisted');
            state=getDefault();
            try{localStorage.setItem('ecoscan_state',JSON.stringify(state));}catch(e){}
            $('bottom-nav').style.display='none';
            showScreen('onboarding');
            showToast('HesabÄ±n yÃ¶netici tarafÄ±ndan kalÄ±cÄ± olarak silindi.','error');
            // KayÄ±t butonunu devre dÄ±ÅŸÄ± bÄ±rak
            var joinBtn=$('btn-join');if(joinBtn)joinBtn.disabled=true;
            return;
          }
          startRealtimeListeners();
        });
      }).catch(function(e){console.error('[EcoScan] Auth error:',e);});

      function startRealtimeListeners(){
        // === REAL-TIME: User doc listener ===
        db.collection('users').doc(currentUid).onSnapshot(function(doc){
          if(state.onboarded && !doc.exists){
            console.log('[EcoScan] User deleted by admin, resetting');
            state=getDefault();
            try{localStorage.setItem('ecoscan_state',JSON.stringify(state));}catch(e){}
            $('bottom-nav').style.display='none';
            showScreen('onboarding');
            return;
          }
          if(doc.exists){
            var d=doc.data();
            var wasBanned=window._ecoscanBanned;
            if(d.banned){
              window._ecoscanBanned=true;
              if(!wasBanned) showToast('HesabÄ±n yÃ¶netici tarafÄ±ndan askÄ±ya alÄ±ndÄ±.','error');
            } else {
              window._ecoscanBanned=false;
            }
            state.name=d.name||state.name;
            state.avatar=d.avatar||state.avatar;
            state.totalPoints=typeof d.totalPoints==='number'?d.totalPoints:state.totalPoints;
            state.totalScans=typeof d.totalScans==='number'?d.totalScans:state.totalScans;
            state.streak=typeof d.streak==='number'?d.streak:state.streak;
            state.maxStreak=typeof d.maxStreak==='number'?d.maxStreak:state.maxStreak;
            try{localStorage.setItem('ecoscan_state',JSON.stringify(state));}catch(e){}
            console.log('[EcoScan] Real-time sync from Firestore');
            if(state.onboarded){try{renderHome();renderProfile();}catch(e){}}
          }
        });
        // Ä°lk sync
        if(state.onboarded) syncToFirestore();

        // === REAL-TIME: Config listener ===
        db.collection('config').doc('settings').onSnapshot(function(doc){
          if(doc.exists){
            var prev=window._ecoscanConfig||{};
            window._ecoscanConfig=doc.data();
            var c=doc.data();
            // Scanning toggle notification
            if(prev.scanningEnabled!==undefined && prev.scanningEnabled!==c.scanningEnabled){
              showToast(c.scanningEnabled===false?'Tarama yÃ¶netici tarafÄ±ndan durduruldu.':'Tarama tekrar aktif!', c.scanningEnabled===false?'warn':'success');
            }
          }
        });
      } // end startRealtimeListeners
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
    // Use thumbnail for Firestore (small enough), full photo stays local
    var syncAvatar=state.avatar;
    if(state.avatar&&state.avatar.indexOf('data:')===0){
      syncAvatar=state.avatarThumb||'ğŸŒ±';
    }
    db.collection('users').doc(currentUid).set({
      name:state.name, avatar:syncAvatar,
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
        list.push({uid:doc.id,name:d.name||'?',avatar:d.avatar||'ğŸŒ±',ptsAll:d.totalPoints||0,ptsWeek:d.weekPoints||0,streak:d.streak||0,earnedBadges:d.earnedBadges||[],isUser:doc.id===currentUid,isMock:false});
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
  function timeAgo(d){var dm=Math.floor((new Date()-new Date(d))/60000);if(dm<1)return'Az Ã¶nce';if(dm<60)return dm+' dk Ã¶nce';var dh=Math.floor(dm/60);if(dh<24)return dh+' saat Ã¶nce';return Math.floor(dh/24)+' gÃ¼n Ã¶nce';}
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
    // Photo upload button
    var pb=document.createElement('button');pb.className='avatar-option avatar-photo-btn';pb.innerHTML='\ud83d\udcf7<span style="font-size:9px;display:block;">Foto</span>';pb.type='button';
    pb.addEventListener('click',function(){
      var inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.setAttribute('capture','environment');
      inp.addEventListener('change',function(){
        if(!inp.files||!inp.files[0])return;
        processAvatarPhoto(inp.files[0],function(dataUrl){
          selectedAvatar=dataUrl;
          var all=grid.querySelectorAll('.avatar-option');for(var j=0;j<all.length;j++)all[j].classList.remove('selected');
          pb.classList.add('selected');
          pb.style.backgroundImage='url('+dataUrl+')';pb.style.backgroundSize='cover';pb.innerHTML='';
          if(onSelect)onSelect(dataUrl);
        });
      });
      inp.click();
    });
    // If current avatar is a photo, show it on the button
    if(selectedAvatar&&selectedAvatar.indexOf('data:')===0){
      pb.classList.add('selected');pb.style.backgroundImage='url('+selectedAvatar+')';pb.style.backgroundSize='cover';pb.innerHTML='';
    }
    grid.appendChild(pb);
  }

  function processAvatarPhoto(file,callback){
    var reader=new FileReader();
    reader.onload=function(e){
      var img=new Image();
      img.onload=function(){
        var s=Math.min(img.width,img.height);
        var sx=(img.width-s)/2,sy=(img.height-s)/2;
        // Full size for local display (128px)
        var c=document.createElement('canvas');c.width=128;c.height=128;
        var ctx=c.getContext('2d');
        ctx.beginPath();ctx.arc(64,64,64,0,Math.PI*2);ctx.closePath();ctx.clip();
        ctx.drawImage(img,sx,sy,s,s,0,0,128,128);
        var fullUrl=c.toDataURL('image/jpeg',0.7);
        // Tiny thumbnail for Firestore (32px, low quality ~1KB)
        var t=document.createElement('canvas');t.width=32;t.height=32;
        var tctx=t.getContext('2d');
        tctx.beginPath();tctx.arc(16,16,16,0,Math.PI*2);tctx.closePath();tctx.clip();
        tctx.drawImage(img,sx,sy,s,s,0,0,32,32);
        var thumbUrl=t.toDataURL('image/jpeg',0.3);
        state.avatarThumb=thumbUrl;
        callback(fullUrl);
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function setAvatarDisplay(el,avatar){
    el.innerHTML='';
    if(avatar&&avatar.indexOf('data:')===0){
      var img=document.createElement('img');img.src=avatar;img.style.cssText='width:100%;height:100%;border-radius:50%;object-fit:cover;';
      el.appendChild(img);
    } else {
      el.textContent=avatar||'\ud83c\udf31';
    }
  }

  function initOnboarding(){
    buildAvatarGrid('avatar-grid', function(){ checkJoin(); });
    $('input-name').addEventListener('input',checkJoin);
    $('btn-join').addEventListener('click',function(){
      // Check registration
      if(window._ecoscanConfig&&window._ecoscanConfig.registrationOpen===false){showToast('Yeni kayÄ±tlar ÅŸu anda kapalÄ±!','error');return;}
      var n=$('input-name').value.trim();if(n.length<2||!selectedAvatar)return;
      state.name=n;state.avatar=selectedAvatar;state.onboarded=true;saveState();
      $('bottom-nav').style.display='flex';showScreen('home');
      if(!state.firstScanDone){var tip=$('tutorial-tooltip');tip.classList.add('show');setTimeout(function(){tip.classList.remove('show');},5000);}
    });
  }
  function checkJoin(){$('btn-join').disabled=!($('input-name').value.trim().length>=2&&selectedAvatar);}

  // ===== HOME =====
  function renderHome(){
    setAvatarDisplay($('home-avatar'),state.avatar);
    $('home-greeting-text').textContent='Merhaba, '+state.name+'! ğŸŒ±';
    $('stat-total-pts').textContent=state.totalPoints;
    $('stat-today-scans').textContent=getTodayScans();
    var lv=getLevel(state.totalPoints),nx=getNextLevel(state.totalPoints);
    $('level-name').textContent=lv.name;
    $('level-sub').textContent=nx?'Sonraki: '+nx.name+' ('+nx.min+' puan)':'Maksimum seviye!';
    $('level-bar-fill').style.width=getLevelProgress(state.totalPoints)+'%';
    var sc=$('streak-card');
    if(state.streak>=2){sc.style.display='flex';$('streak-count').textContent=state.streak+' gÃ¼n seri! ğŸ”¥';}else{sc.style.display='none';}
    var ts=state.totalScans;
    $('eco-trees').textContent=(ts*0.02).toFixed(1);$('eco-co2').textContent=(ts*0.5).toFixed(1)+' kg';$('eco-water').textContent=(ts*2.6).toFixed(0)+' L';
    var ws=getWeekScans(),goal=5;if(ws>=5)goal=10;if(ws>=10)goal=20;
    $('ch-title').textContent='HaftalÄ±k GÃ¶rev: '+goal+' tarama yap!';
    $('ch-progress').textContent=Math.min(ws,goal)+'/'+goal+' tamamlandÄ±'+(ws>=goal?' âœ…':'');
    $('ch-bar-fill').style.width=Math.min((ws/goal)*100,100)+'%';
    var feed=$('activity-feed'),recent=state.activities.slice(-5).reverse();
    if(!recent.length){feed.innerHTML='<p class="empty-msg">HenÃ¼z aktivite yok. QR tarayarak baÅŸla!</p>';return;}
    var h='';for(var i=0;i<recent.length;i++){var a=recent[i],m=getMat(a.category);
      h+='<div class="activity-item"><div class="activity-icon '+m.cssClass+'">'+m.icon+'</div><div class="activity-info"><div class="activity-title">'+m.name+' geri dÃ¶nÃ¼ÅŸtÃ¼rÃ¼ldÃ¼</div><div class="activity-sub">'+(a.binName||'Kutu')+' Â· '+timeAgo(a.timestamp)+'</div></div><div class="activity-pts">+'+a.pts+'</div></div>';
    }feed.innerHTML=h;
  }

  // ===== SCANNER =====
  function startScanner(){
    var reader=$('qr-reader');reader.innerHTML='';
    if(typeof Html5Qrcode==='undefined'){reader.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;padding:20px;text-align:center;font-size:14px;">Kamera yÃ¼klenemedi. Kutu kodunu aÅŸaÄŸÄ±ya girin.</div>';return;}
    try{qrScanner=new Html5Qrcode('qr-reader');qrScanner.start({facingMode:'environment'},{fps:10,qrbox:{width:220,height:220}},function(txt){handleQRResult(txt);},function(){}).catch(function(){reader.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;padding:20px;text-align:center;font-size:14px;">Kamera bulunamadÄ±.<br>Kutu kodunu aÅŸaÄŸÄ±ya girin.</div>';});}catch(e){}
  }
  function handleQRResult(text){
    try{var d=JSON.parse(text);var id=sanitize(d.id||d.binId||''),n=sanitize(d.n||d.binName||''),l=sanitize(d.l||d.location||'');
    if(id&&n){if(qrScanner){try{qrScanner.stop();}catch(e){}qrScanner=null;}currentBin={id:id,binName:n,location:l};showMaterialSelection(currentBin);}}catch(e){}
  }
  function handleCodeInput(code){
    if(!canEnterCode()){showToast('Ã‡ok fazla deneme! 1 dakika bekle.','warn');return;}
    code=code.toUpperCase().trim().replace(/[^A-Z0-9]/g,'');
    if(!isValidCode(code)){showToast('GeÃ§erli bir kutu kodu gir! Ã–rnek: R7K2M9','warn');return;}
    var bin=BIN_DB[code];
    currentBin=bin?{id:code,binName:sanitize(bin.n),location:sanitize(bin.l)}:{id:code,binName:'Geri Donusum Kutusu #'+code,location:'Konum bilinmiyor'};
    if(qrScanner){try{qrScanner.stop();}catch(e){}qrScanner=null;}
    showMaterialSelection(currentBin);
  }

  // ===== MATERIAL SELECTION =====
  function showMaterialSelection(bin){
    $('bin-name').textContent=bin.binName;$('bin-loc').textContent='ğŸ“ '+(bin.location||'');
    var grid=$('material-grid'),h='';
    for(var i=0;i<MATERIALS.length;i++){var m=MATERIALS[i];
      h+='<div class="material-card" data-mat-id="'+m.id+'"><div class="mat-icon">'+m.icon+'</div><div class="mat-name">'+m.name+'</div><div class="mat-pts">+'+m.pts+' puan</div></div>';
    }grid.innerHTML=h;
    var cards=grid.querySelectorAll('.material-card');
    for(var i=0;i<cards.length;i++)(function(c){c.addEventListener('click',function(){selectMaterial(c.getAttribute('data-mat-id'));});})(cards[i]);
    showScreen('material');
  }

  function selectMaterial(matId){
    if(window._ecoscanBanned){showToast('HesabÄ±n askÄ±ya alÄ±ndÄ±. Puan kazanamazsÄ±n.','error');return;}
    if(window._ecoscanConfig&&window._ecoscanConfig.scanningEnabled===false){showToast('Tarama ÅŸu anda devre dÄ±ÅŸÄ±.','warn');return;}
    if(!canScan()){showToast('Ã‡ok hÄ±zlÄ±! Biraz bekle.','warn');return;}
    var mat=getMat(matId);if(!mat)return;
    lastScanTime=Date.now();
    var cards=document.querySelectorAll('.material-card');for(var i=0;i<cards.length;i++)cards[i].classList.remove('selected');
    var sel=document.querySelector('.material-card[data-mat-id="'+matId+'"]');if(sel)sel.classList.add('selected');
    var bonus=0;if(getTodayScans()+1>=3)bonus=5;var totalPts=mat.pts+bonus;
    // GÃ¼nlÃ¼k max 100 tarama limiti
    if(getTodayScans()>=100){showToast('BugÃ¼nkÃ¼ limitine ulaÅŸtÄ±n! YarÄ±n devam et.','info');return;}
    state.activities.push({category:sanitize(matId),pts:totalPts,binName:currentBin?sanitize(currentBin.binName):'',binId:currentBin?sanitize(currentBin.id):'',date:todayStr(),timestamp:new Date().toISOString()});
    state.totalPoints+=totalPts;state.totalScans++;state.categoryCounts[matId]=(state.categoryCounts[matId]||0)+1;
    if(!state.firstScanDone)state.firstScanDone=true;updateStreak();saveState();
    setTimeout(function(){showCelebration(totalPts,bonus,mat);},350);
  }

  // ===== CELEBRATION =====
  function showCelebration(pts,bonus,mat){
    var msg='+'+pts+' puan kazandÄ±n!';if(bonus>0)msg+=' (GÃ¼nlÃ¼k Seri +'+bonus+')';
    $('cel-pts').textContent=msg;
    // Show material-specific educational info
    $('cel-fact').textContent=mat.info||FUN_FACTS[Math.floor(Math.random()*FUN_FACTS.length)];
    $('celebration').classList.add('show');
    if(typeof confetti==='function')confetti({particleCount:120,spread:80,origin:{y:0.6},colors:['#2D8C4E','#56B07A','#A8D5BA','#FFD700']});
    setTimeout(function(){$('celebration').classList.remove('show');currentBin=null;showScreen('home');},3200);
  }

  // ===== LEADERBOARD =====
  function avatarHtml(av){
    if(av&&av.indexOf('data:')===0) return '<img src="'+av+'" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">';
    return av||'\ud83c\udf31';
  }
  function renderLeaderboard(tab){
    var list=$('lb-list');
    list.innerHTML='<p class="empty-msg">YÃ¼kleniyor...</p>';
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
        var rb=r===1?'ğŸ¥‡':r===2?'ğŸ¥ˆ':r===3?'ğŸ¥‰':String(r);
        var tc=r<=3?' top'+r:'',uc=u.isUser?' current-user':'';
        if(u.isUser) uIn=true;
        var dn=u.isUser?(u.name+' (Sen)'):u.name;
        var clickable=u.isMock===false?' data-lb-idx="'+i+'" style="cursor:pointer"':'';
        h+='<div class="lb-item'+tc+uc+'"'+clickable+'><div class="lb-rank">'+rb+'</div><div class="lb-avatar">'+avatarHtml(u.avatar)+'</div><div class="lb-name">'+dn+'</div><div class="lb-pts">'+(isW?u.ptsWeek:u.ptsAll)+' pts</div></div>';
      }
      if(!uIn&&state.onboarded){
        var ur=0;for(var i=0;i<all.length;i++)if(all[i].isUser){ur=i+1;break;}
        if(!ur) ur=all.length;
        h+='<div style="text-align:center;color:var(--text-muted);padding:8px;">Â· Â· Â·</div>';
        h+='<div class="lb-item current-user"><div class="lb-rank">'+ur+'</div><div class="lb-avatar">'+avatarHtml(state.avatar)+'</div><div class="lb-name">'+state.name+' (Sen)</div><div class="lb-pts">'+(isW?getWeekPoints():state.totalPoints)+' pts</div></div>';
      }
      list.innerHTML=h||'<p class="empty-msg">HenÃ¼z kimse yok!</p>';
      // Click handlers â€” event delegation
      list.onclick=function(e){
        var item=e.target.closest('[data-lb-idx]');
        if(!item)return;
        var idx=parseInt(item.getAttribute('data-lb-idx'));
        if(top[idx]){
          console.log('[EcoScan] Profile clicked:',top[idx].name);
          showUserProfile(top[idx]);
        }
      };
    });
  }

  function showUserProfile(user){
    var m=$('user-modal');
    setAvatarDisplay($('um-avatar'),user.avatar);
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
    setAvatarDisplay($('profile-avatar'),state.avatar);
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
          +'<div class="badge-progress">'+(e?'âœ… KazanÄ±ldÄ±!':prog)+'</div>'
          +(e?'':'<div class="badge-bar"><div class="badge-bar-fill" style="width:'+pct+'%"></div></div>')
          +'</div>';
      }
    }
    grid.innerHTML=h;
  }

  // ===== EDIT NAME & AVATAR =====
  function initEditName(){
    var modal=$('edit-modal');
    $('btn-edit-name').addEventListener('click',function(){
      if(window._ecoscanConfig&&window._ecoscanConfig.allowNameChange===false){showToast('Ä°sim deÄŸiÅŸtirme yÃ¶netici tarafÄ±ndan kapatÄ±ldÄ±.','warn');return;}
      $('edit-name-input').value=state.name;modal.classList.add('show');
    });
    modal.addEventListener('click',function(e){if(e.target===modal)modal.classList.remove('show');});
    $('btn-save-name').addEventListener('click',function(){
      var n=$('edit-name-input').value.trim();if(n.length>=2){state.name=n;saveState();modal.classList.remove('show');renderProfile();renderHome();}
    });
  }
  function initAvatarChange(){
    var modal=$('avatar-modal');
    $('btn-change-avatar').addEventListener('click',function(){
      if(window._ecoscanConfig&&window._ecoscanConfig.allowAvatarChange===false){showToast('Avatar deÄŸiÅŸtirme yÃ¶netici tarafÄ±ndan kapatÄ±ldÄ±.','warn');return;}
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

