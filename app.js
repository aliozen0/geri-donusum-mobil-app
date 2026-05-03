// =====================================================
// EcoScan - Geri Dönüşüm Gamification App
// Tüm veri localStorage'da saklanır, backend yok
// =====================================================

(function () {
  'use strict';

  // ===================== CONSTANTS =====================
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
    { min: 0,   max: 99,   name: '🌱 Çevre Dostu' },
    { min: 100, max: 299,  name: '♻️ Geri Dönüşüm Kahramanı' },
    { min: 300, max: 599,  name: '🌍 Dünya Koruyucusu' },
    { min: 600, max: 99999, name: '🏆 Ekoloji Efsanesi' }
  ];

  var BADGES = [
    { id: 'ilk_adim',       name: 'İlk Adım',        icon: '👣', check: function(d) { return d.totalScans >= 1; } },
    { id: 'cam_ustasi',     name: 'Cam Ustası',       icon: '🫙', check: function(d) { return (d.categoryCounts.cam || 0) >= 10; } },
    { id: 'kagit_samp',     name: 'Kağıt Şampiyonu',  icon: '📄', check: function(d) { return (d.categoryCounts.kagit || 0) >= 10; } },
    { id: 'hafta_kahraman', name: 'Hafta Kahramanı',   icon: '🗓️', check: function(d) { return d.weekPoints >= 50; } },
    { id: 'ekoloji',        name: 'Ekoloji Dostu',    icon: '🌿', check: function(d) { return d.totalPoints >= 100; } },
    { id: 'super_eco',      name: 'Süper Ekolog',     icon: '🦸', check: function(d) { return d.totalPoints >= 300; } }
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

  // ===================== STATE =====================
  var state = loadState();
  var currentBin = null;
  var qrScanner = null;
  var selectedAvatar = state.avatar || '';

  function getDefaultState() {
    return {
      name: '',
      avatar: '',
      totalPoints: 0,
      totalScans: 0,
      categoryCounts: {},
      activities: [],
      onboarded: false,
      firstScanDone: false
    };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem('ecoscan_state');
      if (raw) {
        var parsed = JSON.parse(raw);
        var defaults = getDefaultState();
        // Merge with defaults so new fields are always present
        for (var key in defaults) {
          if (!(key in parsed)) {
            parsed[key] = defaults[key];
          }
        }
        return parsed;
      }
    } catch (e) {
      console.error('State load error:', e);
    }
    return getDefaultState();
  }

  function saveState() {
    try {
      localStorage.setItem('ecoscan_state', JSON.stringify(state));
    } catch (e) {
      console.error('State save error:', e);
    }
  }

  // ===================== HELPERS =====================
  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function getTodayScans() {
    var today = todayStr();
    var count = 0;
    for (var i = 0; i < state.activities.length; i++) {
      if (state.activities[i].date === today) count++;
    }
    return count;
  }

  function getWeekPoints() {
    var now = new Date();
    var weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    var pts = 0;
    for (var i = 0; i < state.activities.length; i++) {
      if (state.activities[i].date >= weekAgo) {
        pts += state.activities[i].pts;
      }
    }
    return pts;
  }

  function getLevel(pts) {
    for (var i = LEVELS.length - 1; i >= 0; i--) {
      if (pts >= LEVELS[i].min) return LEVELS[i];
    }
    return LEVELS[0];
  }

  function getLevelProgress(pts) {
    var lv = getLevel(pts);
    var range = lv.max - lv.min + 1;
    var progress = ((pts - lv.min) / range) * 100;
    return Math.min(progress, 100);
  }

  function getNextLevel(pts) {
    var lv = getLevel(pts);
    for (var i = 0; i < LEVELS.length; i++) {
      if (LEVELS[i] === lv && i < LEVELS.length - 1) {
        return LEVELS[i + 1];
      }
    }
    return null;
  }

  function getFavoriteCategory() {
    var cc = state.categoryCounts;
    var maxVal = 0;
    var favId = '';
    for (var k in cc) {
      if (cc[k] > maxVal) {
        maxVal = cc[k];
        favId = k;
      }
    }
    if (!favId) return '-';
    for (var i = 0; i < MATERIALS.length; i++) {
      if (MATERIALS[i].id === favId) return MATERIALS[i].name;
    }
    return '-';
  }

  function timeAgo(dateStr) {
    var d = new Date(dateStr);
    var now = new Date();
    var diffMin = Math.floor((now - d) / 60000);
    if (diffMin < 1) return 'Az önce';
    if (diffMin < 60) return diffMin + ' dk önce';
    var diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return diffH + ' saat önce';
    var diffD = Math.floor(diffH / 24);
    return diffD + ' gün önce';
  }

  function getMaterialById(id) {
    for (var i = 0; i < MATERIALS.length; i++) {
      if (MATERIALS[i].id === id) return MATERIALS[i];
    }
    return MATERIALS[0];
  }

  // ===================== DOM HELPERS =====================
  function $(id) { return document.getElementById(id); }

  // ===================== NAVIGATION =====================
  function showScreen(id) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.remove('active');
    }
    var target = $('screen-' + id);
    if (target) target.classList.add('active');

    // Update nav highlights
    var navItems = document.querySelectorAll('.nav-item');
    for (var i = 0; i < navItems.length; i++) {
      if (navItems[i].getAttribute('data-screen') === id) {
        navItems[i].classList.add('active');
      } else {
        navItems[i].classList.remove('active');
      }
    }

    // Stop scanner when leaving scanner screen
    if (id !== 'scanner' && qrScanner) {
      try { qrScanner.stop(); } catch (e) {}
      qrScanner = null;
    }

    // Render screen content
    switch (id) {
      case 'home': renderHome(); break;
      case 'leaderboard': renderLeaderboard('week'); break;
      case 'profile': renderProfile(); break;
      case 'scanner': startScanner(); break;
    }
  }

  // ===================== ONBOARDING =====================
  function initOnboarding() {
    var grid = $('avatar-grid');
    grid.innerHTML = '';

    for (var i = 0; i < AVATARS.length; i++) {
      (function (avatar) {
        var btn = document.createElement('button');
        btn.className = 'avatar-option';
        btn.textContent = avatar;
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', function () {
          var allAvatars = document.querySelectorAll('.avatar-option');
          for (var j = 0; j < allAvatars.length; j++) {
            allAvatars[j].classList.remove('selected');
          }
          btn.classList.add('selected');
          selectedAvatar = avatar;
          checkJoinBtn();
        });
        grid.appendChild(btn);
      })(AVATARS[i]);
    }

    $('input-name').addEventListener('input', checkJoinBtn);

    $('btn-join').addEventListener('click', function () {
      var name = $('input-name').value.trim();
      if (name.length < 2 || !selectedAvatar) return;

      state.name = name;
      state.avatar = selectedAvatar;
      state.onboarded = true;
      saveState();

      $('bottom-nav').style.display = 'flex';
      showScreen('home');

      // Show tutorial tooltip on first launch
      if (!state.firstScanDone) {
        var tip = $('tutorial-tooltip');
        tip.classList.add('show');
        setTimeout(function () { tip.classList.remove('show'); }, 5000);
      }
    });
  }

  function checkJoinBtn() {
    var name = $('input-name').value.trim();
    $('btn-join').disabled = !(name.length >= 2 && selectedAvatar);
  }

  // ===================== HOME =====================
  function renderHome() {
    $('home-avatar').textContent = state.avatar;
    $('home-greeting-text').textContent = 'Merhaba, ' + state.name + '! 🌱';
    $('stat-total-pts').textContent = state.totalPoints;
    $('stat-today-scans').textContent = getTodayScans();

    var lv = getLevel(state.totalPoints);
    var next = getNextLevel(state.totalPoints);
    $('level-name').textContent = lv.name;
    $('level-sub').textContent = next
      ? 'Sonraki seviye: ' + next.name + ' (' + next.min + ' puan)'
      : 'Maksimum seviyeye ulaştın!';
    $('level-bar-fill').style.width = getLevelProgress(state.totalPoints) + '%';

    // Activity feed
    var feed = $('activity-feed');
    var recent = state.activities.slice(-5).reverse();

    if (recent.length === 0) {
      feed.innerHTML = '<p class="empty-msg">Henüz bir aktivite yok. QR tarayarak başla!</p>';
      return;
    }

    var html = '';
    for (var i = 0; i < recent.length; i++) {
      var a = recent[i];
      var mat = getMaterialById(a.category);
      html += '<div class="activity-item">' +
        '<div class="activity-icon ' + mat.cssClass + '">' + mat.icon + '</div>' +
        '<div class="activity-info">' +
          '<div class="activity-title">' + mat.name + ' geri dönüştürüldü</div>' +
          '<div class="activity-sub">' + (a.binName || 'Kutu') + ' · ' + timeAgo(a.timestamp) + '</div>' +
        '</div>' +
        '<div class="activity-pts">+' + a.pts + '</div>' +
      '</div>';
    }
    feed.innerHTML = html;
  }

  // ===================== SCANNER =====================
  function startScanner() {
    var reader = $('qr-reader');
    reader.innerHTML = '';

    if (typeof Html5Qrcode === 'undefined') {
      reader.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#fff;padding:20px;text-align:center;font-size:14px;">' +
        'QR tarayıcı kütüphanesi yüklenemedi.<br>Aşağıdaki manuel test alanını kullanın.' +
      '</div>';
      return;
    }

    try {
      qrScanner = new Html5Qrcode('qr-reader');
      qrScanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        function (decodedText) {
          handleQRResult(decodedText);
        },
        function () { /* scan error - ignore */ }
      ).catch(function (err) {
        console.warn('Camera error:', err);
        reader.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#fff;padding:20px;text-align:center;font-size:14px;">' +
          'Kamera erişimi reddedildi veya kamera bulunamadı.<br><br>' +
          'Aşağıdaki <strong>manuel test</strong> alanını kullanarak QR verisini yapıştırın.' +
        '</div>';
      });
    } catch (e) {
      console.error('Scanner init error:', e);
    }
  }

  function handleQRResult(text) {
    try {
      var data = JSON.parse(text);
      if (data.binId && data.binName) {
        // Stop scanner
        if (qrScanner) {
          try { qrScanner.stop(); } catch (e) {}
          qrScanner = null;
        }
        currentBin = data;
        showMaterialSelection(data);
      }
    } catch (e) {
      // Not a valid EcoScan QR - ignore
      console.warn('Invalid QR data:', text);
    }
  }

  // ===================== MATERIAL SELECTION =====================
  function showMaterialSelection(bin) {
    $('bin-name').textContent = bin.binName;
    $('bin-loc').textContent = '📍 ' + (bin.location || 'Bilinmeyen konum');

    var grid = $('material-grid');
    var html = '';
    for (var i = 0; i < MATERIALS.length; i++) {
      var m = MATERIALS[i];
      html += '<div class="material-card" data-mat-id="' + m.id + '">' +
        '<div class="mat-icon">' + m.icon + '</div>' +
        '<div class="mat-name">' + m.name + '</div>' +
        '<div class="mat-pts">+' + m.pts + ' puan</div>' +
      '</div>';
    }
    grid.innerHTML = html;

    // Add click handlers
    var cards = grid.querySelectorAll('.material-card');
    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        card.addEventListener('click', function () {
          var matId = card.getAttribute('data-mat-id');
          selectMaterial(matId);
        });
      })(cards[i]);
    }

    showScreen('material');
  }

  function selectMaterial(matId) {
    var mat = getMaterialById(matId);
    if (!mat) return;

    // Highlight selected card
    var cards = document.querySelectorAll('.material-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.remove('selected');
    }
    var selected = document.querySelector('.material-card[data-mat-id="' + matId + '"]');
    if (selected) selected.classList.add('selected');

    // Calculate daily streak bonus
    var bonus = 0;
    var todayScansAfter = getTodayScans() + 1;
    if (todayScansAfter >= 3) bonus = 5;

    var totalPts = mat.pts + bonus;

    // Record activity
    var activity = {
      category: matId,
      pts: totalPts,
      binName: currentBin ? currentBin.binName : '',
      binId: currentBin ? currentBin.binId : '',
      date: todayStr(),
      timestamp: new Date().toISOString()
    };

    state.activities.push(activity);
    state.totalPoints += totalPts;
    state.totalScans += 1;

    if (!state.categoryCounts[matId]) {
      state.categoryCounts[matId] = 0;
    }
    state.categoryCounts[matId]++;

    if (!state.firstScanDone) {
      state.firstScanDone = true;
    }

    saveState();

    // Show celebration after short delay
    setTimeout(function () {
      showCelebration(totalPts, bonus);
    }, 350);
  }

  // ===================== CELEBRATION =====================
  function showCelebration(pts, bonus) {
    var overlay = $('celebration');
    var ptsEl = $('cel-pts');

    var msg = '+' + pts + ' puan kazandın!';
    if (bonus > 0) msg += ' (Günlük Seri +' + bonus + ')';
    ptsEl.textContent = msg;

    overlay.classList.add('show');

    // Fire confetti
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2D8C4E', '#56B07A', '#A8D5BA', '#FFD700']
      });
    }

    setTimeout(function () {
      overlay.classList.remove('show');
      currentBin = null;
      showScreen('home');
    }, 2200);
  }

  // ===================== LEADERBOARD =====================
  function renderLeaderboard(tab) {
    var list = $('lb-list');
    var isWeek = (tab === 'week');

    // Current user data
    var userData = {
      name: state.name + ' (Sen)',
      avatar: state.avatar,
      ptsAll: state.totalPoints,
      ptsWeek: getWeekPoints(),
      isUser: true
    };

    // Combine mock + real user
    var all = MOCK_USERS.slice(); // copy
    all.push(userData);

    // Sort
    all.sort(function (a, b) {
      return isWeek ? (b.ptsWeek - a.ptsWeek) : (b.ptsAll - a.ptsAll);
    });

    // Render top 10
    var top10 = all.slice(0, 10);
    var userInTop = false;

    var html = '';
    for (var i = 0; i < top10.length; i++) {
      var u = top10[i];
      var rank = i + 1;
      var rankBadge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : String(rank);
      var topClass = rank <= 3 ? ' top' + rank : '';
      var userClass = u.isUser ? ' current-user' : '';
      var pts = isWeek ? u.ptsWeek : u.ptsAll;

      if (u.isUser) userInTop = true;

      html += '<div class="lb-item' + topClass + userClass + '">' +
        '<div class="lb-rank">' + rankBadge + '</div>' +
        '<div class="lb-avatar">' + u.avatar + '</div>' +
        '<div class="lb-name">' + u.name + '</div>' +
        '<div class="lb-pts">' + pts + ' pts</div>' +
      '</div>';
    }

    // If user not in top 10, show them at their actual rank
    if (!userInTop) {
      var userRank = 0;
      for (var i = 0; i < all.length; i++) {
        if (all[i].isUser) { userRank = i + 1; break; }
      }
      var pts = isWeek ? userData.ptsWeek : userData.ptsAll;
      html += '<div style="text-align:center;color:var(--text-muted);padding:8px;">· · ·</div>';
      html += '<div class="lb-item current-user">' +
        '<div class="lb-rank">' + userRank + '</div>' +
        '<div class="lb-avatar">' + userData.avatar + '</div>' +
        '<div class="lb-name">' + userData.name + '</div>' +
        '<div class="lb-pts">' + pts + ' pts</div>' +
      '</div>';
    }

    list.innerHTML = html;
  }

  // ===================== PROFILE =====================
  function renderProfile() {
    $('profile-avatar').textContent = state.avatar;
    $('profile-name').textContent = state.name;
    $('profile-level').textContent = getLevel(state.totalPoints).name;
    $('ps-pts').textContent = state.totalPoints;
    $('ps-scans').textContent = state.totalScans;
    $('ps-fav').textContent = getFavoriteCategory();

    var badgeData = {
      totalScans: state.totalScans,
      totalPoints: state.totalPoints,
      categoryCounts: state.categoryCounts,
      weekPoints: getWeekPoints()
    };

    var grid = $('badges-grid');
    var html = '';
    for (var i = 0; i < BADGES.length; i++) {
      var b = BADGES[i];
      var earned = b.check(badgeData);
      html += '<div class="badge-card' + (earned ? '' : ' locked') + '">' +
        '<div class="badge-icon">' + b.icon + '</div>' +
        '<div class="badge-name">' + b.name + '</div>' +
      '</div>';
    }
    grid.innerHTML = html;
  }

  // ===================== EDIT NAME =====================
  function initEditName() {
    var modal = $('edit-modal');

    $('btn-edit-name').addEventListener('click', function () {
      $('edit-name-input').value = state.name;
      modal.classList.add('show');
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });

    $('btn-save-name').addEventListener('click', function () {
      var newName = $('edit-name-input').value.trim();
      if (newName.length >= 2) {
        state.name = newName;
        saveState();
        modal.classList.remove('show');
        renderProfile();
        renderHome();
      }
    });
  }

  // ===================== MANUAL QR TEST =====================
  function initManualTest() {
    $('btn-manual-scan').addEventListener('click', function () {
      var input = $('manual-qr-input').value.trim();
      if (!input) {
        alert('QR verisini yapıştırın! Örnek:\n{"binId":"bin_001","binName":"Okul Bahçesi Kutusu","location":"A Blok Girişi"}');
        return;
      }
      handleQRResult(input);
    });
  }

  // ===================== INIT =====================
  function init() {
    initOnboarding();
    initEditName();
    initManualTest();

    // Bottom nav
    var navItems = document.querySelectorAll('.nav-item');
    for (var i = 0; i < navItems.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          showScreen(btn.getAttribute('data-screen'));
        });
      })(navItems[i]);
    }

    // Home scan button
    $('btn-scan-home').addEventListener('click', function () {
      showScreen('scanner');
    });

    // Scanner back button
    $('btn-back-scanner').addEventListener('click', function () {
      showScreen('home');
    });

    // Leaderboard tabs
    var tabBtns = document.querySelectorAll('.tab-btn');
    for (var i = 0; i < tabBtns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var j = 0; j < tabBtns.length; j++) {
            tabBtns[j].classList.remove('active');
          }
          btn.classList.add('active');
          renderLeaderboard(btn.getAttribute('data-tab'));
        });
      })(tabBtns[i]);
    }

    // Check if already onboarded
    if (state.onboarded && state.name) {
      $('bottom-nav').style.display = 'flex';
      showScreen('home');
    } else {
      $('screen-onboarding').classList.add('active');
    }
  }

  // Start the app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
