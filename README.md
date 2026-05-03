# ♻️ EcoScan — Gamified Recycling Platform

> Çocuklar için QR kod tabanlı, oyunlaştırılmış geri dönüşüm uygulaması. Firebase ile gerçek zamanlı senkronizasyon, admin paneli ve güvenlik önlemleri ile donatılmıştır.

[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-FFCA28?logo=firebase)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🎯 Proje Hakkında

EcoScan, okul ve park gibi alanlara yerleştirilen geri dönüşüm kutularındaki QR kodları tarayarak çocukların çevre bilincini artırmayı hedefler. Her tarama puan kazandırır, sıralama tablosu rekabeti teşvik eder ve rozetler motivasyon sağlar.

## ✨ Özellikler

### 🎮 Oyunlaştırma
- **Puan Sistemi** — Malzeme bazlı puanlama (Kağıt: 10, Plastik: 15, Cam: 20, Metal: 25, Organik: 8)
- **Seviye Sistemi** — Fidan → Ağaç → Orman → Dünya Koruyucu (5 seviye)
- **Günlük Seri** — Ardışık gün bonusu (+5 puan)
- **Rozetler** — İlk Adım, Hafta Yıldızı, Geri Dönüşüm Ustası vb. (8 rozet)
- **Konfeti Animasyonu** — Her taramada kutlama efekti

### 📱 Kullanıcı Deneyimi
- **QR Tarama** — Kamera ile anında tarama
- **Manuel Kod Girişi** — 6 haneli kutu kodu desteği
- **Emoji + Fotoğraf Avatar** — Kamera/galeri ile profil fotoğrafı
- **Gerçek Zamanlı Leaderboard** — Firebase ile anlık sıralama
- **Kullanıcı Profil Modalı** — Leaderboard'dan tıklayarak profil görüntüleme
- **Toast Bildirimleri** — Tarayıcı alert yerine şık, animasyonlu bildirimler
- **PWA Desteği** — Ana ekrana eklenebilir

### 🔐 Güvenlik
- **Content Security Policy (CSP)** — XSS koruması
- **Input Sanitization** — Tüm kullanıcı girdileri temizlenir
- **Brute Force Koruması** — Kod girişi: 10/dk, tarama: 5s cooldown
- **Firestore Rules** — Sunucu tarafı doğrulama:
  - Puan artış limiti: max +50/yazma
  - Tarama artış limiti: max +1/yazma
  - Kullanıcı izolasyonu (sadece kendi verisini yazar)
  - Banned kullanıcılar yazamaz
- **Admin Şifre Hash** — SHA-256 ile saklanır (açık metin yok)
- **Günlük Tarama Limiti** — Max 100 tarama/gün

### ⚙️ Admin Paneli (`qr-generator.html`)
- **Şifre Korumalı Giriş** — SHA-256 hash + brute force koruması (5 deneme)
- **QR Kod Üretici** — Hazır şablonlar ile hızlı QR oluşturma
- **Genel Ayarlar**:
  - Yeni kayıt aç/kapat
  - Tarama aç/kapat (anlık yansır)
  - İsim değiştirme izni
  - Avatar değiştirme izni
- **Kullanıcı Yönetimi**:
  - Tüm kullanıcıları listele + isimle ara
  - Puan sıfırlama
  - Avatar sıfırlama
  - Kullanıcı yasaklama/yasak kaldırma
  - Kullanıcı silme
  - 🔄 Yenile butonu
- **Gerçek Zamanlı Senkronizasyon** — Admin değişiklikleri kullanıcılara anında yansır

## 🛠️ Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Backend | Firebase Firestore + Anonymous Auth |
| QR | html5-qrcode |
| Animasyon | canvas-confetti |
| Dağıtım | Firebase Hosting |

## 🚀 Kurulum

### Gereksinimler
- Modern web tarayıcısı (Chrome, Safari, Firefox)
- Node.js (opsiyonel, local server için)

### Yerel Çalıştırma

```bash
# Projeyi klonla
git clone https://github.com/aliozen0/geri-donusum-mobil-app.git
cd geri-donusum-mobil-app

# Yerel sunucu başlat
npx serve -l 3000
```

Tarayıcıda `http://localhost:3000` adresine git.

### Firebase Deploy

```bash
npx firebase-tools deploy --project geri-donusum-2e08b
```

## 📁 Proje Yapısı

```
geri-donusum/
├── index.html              # Ana uygulama (PWA)
├── app.js                  # Uygulama mantığı + Firebase + güvenlik
├── style.css               # Tasarım (mobile-first, 1200+ satır)
├── qr-generator.html       # Admin paneli + QR üretici
├── manifest.json           # PWA manifest
├── firebase.json           # Firebase konfigürasyonu
├── firestore.rules         # Firestore güvenlik kuralları (sıkılaştırılmış)
├── firestore.indexes.json  # Firestore indeksleri
├── .firebaserc             # Firebase proje bağlantısı
├── .gitignore              # Git ignore kuralları
└── LICENSE                 # MIT Lisansı
```

## 🔒 Güvenlik Mimarisi

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT SIDE                       │
├─────────────────────────────────────────────────────┤
│  CSP Header        → XSS, injection koruması         │
│  Input Sanitize    → <script> vb. temizleme          │
│  Rate Limiting     → 5s scan, 10/dk code, 100/gün   │
│  SHA-256 Hash      → Admin şifresi koruması          │
│  IIFE Scope        → Global namespace koruması       │
├─────────────────────────────────────────────────────┤
│                   SERVER SIDE                        │
├─────────────────────────────────────────────────────┤
│  Auth Guard        → Anonymous auth zorunlu          │
│  Owner Check       → userId == auth.uid              │
│  Increment Limit   → +50 pts, +1 scan per write     │
│  Banned Guard      → Yasaklı kullanıcı yazamaz      │
│  Admin RBAC        → config/* sadece admin erişimi   │
│  Type Validation   → string, int, size kontrolleri   │
└─────────────────────────────────────────────────────┘
```

## 🎮 Oyun Teorisi

| Mekanik | Açıklama | Psikolojik Etki |
|---------|----------|-----------------|
| Puan | Her taramada anlık ödül | Dopamin döngüsü |
| Seviye | 5 kademeli ilerleme | Uzun vadeli motivasyon |
| Seri | Ardışık gün bonusu | Alışkanlık oluşturma |
| Leaderboard | Gerçek zamanlı sıralama | Sosyal rekabet |
| Rozetler | Başarı koleksiyonu | Tamamlama dürtüsü |
| Konfeti | Görsel kutlama | Pozitif pekiştirme |

## 📊 Real-Time Senkronizasyon

Uygulama `onSnapshot` listener'ları kullanarak gerçek zamanlı çalışır:

- **Admin bir kullanıcıyı yasakladığında** → Kullanıcı anında bildirim alır
- **Tarama kapatıldığında** → Tüm kullanıcılara anında yansır
- **Puan sıfırlandığında** → Ekran anında güncellenir
- **Kullanıcı silindiğinde** → Otomatik onboarding'e döner

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

<p align="center">
  <strong>♻️ Dünyayı birlikte kurtaralım!</strong><br>
  <sub>Built with 💚 by <a href="https://github.com/aliozen0">Ali Özen</a></sub>
</p>
