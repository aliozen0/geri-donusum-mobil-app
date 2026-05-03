# ♻️ EcoScan — Gamified Recycling App

<div align="center">

**Çocuklar için eğlenceli, oyunlaştırılmış geri dönüşüm uygulaması**

🌍 QR Tara · 🏆 Puan Kazan · 🎖️ Rozet Topla · 📊 Sıralamada Yüksel

</div>

---

## 🎯 Nedir?

EcoScan, çocukların geri dönüşüm alışkanlığı kazanmasını oyun mekaniği ile teşvik eden bir Progressive Web App'tir (PWA). Geri dönüşüm kutularındaki QR kodları tarayarak puan kazanır, rozetler toplar ve arkadaşlarıyla yarışırlar.

## ✨ Özellikler

| Özellik | Açıklama |
|---------|----------|
| 📷 **QR Tarama** | Kamera ile geri dönüşüm kutusundaki QR kodu tara |
| ⌨️ **Manuel Kod Girişi** | QR yoksa kutu kodunu elle gir |
| 🏅 **18 Seviyeli Rozet** | Bronz → Gümüş → Altın → Elmas (oyun teorisi bazlı) |
| 🔥 **Günlük Seri** | Üst üste geri dönüşüm yap, serini koru |
| 🌳 **Çevresel Etki** | Kaç ağaç kurtardığını, CO₂ azalttığını gör |
| 🏆 **Gerçek Zamanlı Sıralama** | Firebase ile canlı leaderboard |
| 🎭 **12 Avatar** | Profilde istediğin zaman değiştir |
| 📚 **Eğitici İçerik** | Her taramada malzeme hakkında bilgi |
| 🎯 **Haftalık Görevler** | İlerleme çubuklu hedefler |
| 🔧 **QR Üretici** | Yöneticiler için QR kod + kutu etiketi oluşturucu |

## 🛠️ Teknolojiler

- **Frontend:** Vanilla HTML, CSS, JavaScript (framework yok)
- **Backend:** Firebase (Firestore + Anonymous Auth)
- **QR:** html5-qrcode kütüphanesi
- **Animasyon:** canvas-confetti
- **Dağıtım:** Firebase Hosting / Netlify / Vercel

## 🚀 Kurulum

### Gereksinimler
- Modern bir web tarayıcısı
- Node.js (opsiyonel, sadece local server için)

### Yerel Çalıştırma

```bash
# Projeyi klonla
git clone https://github.com/aliozen0/geri-donusum.git
cd geri-donusum

# Yerel sunucu başlat
npx serve -l 3000
```

Tarayıcıda `http://localhost:3000` adresine git.

### Firebase Deploy

```bash
# Firebase CLI ile deploy
npx firebase-tools deploy --project geri-donusum-2e08b
```

## 📁 Proje Yapısı

```
geri-donusum/
├── index.html              # Ana uygulama
├── app.js                  # Uygulama mantığı + Firebase entegrasyonu
├── style.css               # Tasarım (mobile-first)
├── qr-generator.html       # QR kod üretici (yönetici aracı)
├── manifest.json           # PWA manifest
├── firebase.json           # Firebase konfigürasyonu
├── firestore.rules         # Firestore güvenlik kuralları
├── firestore.indexes.json  # Firestore indeksleri
└── .firebaserc             # Firebase proje bağlantısı
```

## 🛡️ Güvenlik

| Katman | Koruma |
|--------|--------|
| **Firestore Rules** | Kimlik doğrulama, veri tipi kontrolü, puan/tarama artış limiti |
| **Rate Limiting** | Server: 3s arası, Client: 5s arası, Kod: 10/dakika |
| **Input Sanitization** | XSS engeli, regex whitelist, HTML-escape |
| **CSP** | Content Security Policy — sadece izinli domainler |
| **Günlük Limit** | Max 100 tarama/gün |
| **Brute Force** | Dakikada max 10 kod denemesi |

## 🎮 Oyun Teorisi

Rozet sistemi şu prensiplere dayanır:

- **Progressive Difficulty** — Bronz kolay, Elmas çok zor
- **Near-miss Effect** — "2/5 - Az kaldı!" ilerleme çubukları
- **Collection Drive** — Tam koleksiyon tamamlama motivasyonu
- **Loss Aversion** — Günlük seri kaybetme korkusu
- **Social Comparison** — Gerçek zamanlı leaderboard

## 🔧 Yönetici Paneli

QR Generator sayfasında (`qr-generator.html`):
1. **"🔧 EcoScan QR Üretici"** başlığına **3 kez** tıkla
2. Gizli admin paneli açılır
3. Mock veri toggle'ı ile sahte kullanıcıları aç/kapat

## 📱 Ekran Görüntüleri

> Uygulamayı `localhost:3000` üzerinde açarak tüm ekranları görebilirsiniz.

## 📄 Lisans

MIT License

---

<div align="center">

**🌍 Dünyayı kurtarmak bir QR tarama uzağında!**

</div>
