# Coolify Deployment Talimatları

## 1. Environment Variables

Coolify projenizde **Environment** sekmesine gidin ve şu değişkenleri ekleyin:

```bash
NEXT_PUBLIC_SITE_URL=https://eskisehirolay.com.tr
NEXT_PUBLIC_SITE_NAME=Eskişehir Olay
NODE_ENV=production
```

## 2. Persistent Volume (ÇOK ÖNEMLİ!)

Resimlererin kaybolmaması için **volume mount** yapmalısınız:

**Coolify → Storage/Volumes → Add Volume:**

```
Name: uploads-volume
Source: /uploads
Destination: (Coolify otomatik oluşturacak)
```

Bu olmazsa container her restart'ta resimleri siler!

## 3. Custom Nginx Configuration (Static File Serving)

Coolify'da varsayılan Nginx konfigürasyonu `/uploads` klasörünü serve etmiyor. Bunu eklemeniz gerekiyor.

### Seçenek A: Coolify Custom Nginx Config

Coolify'da **"Custom Nginx Configuration"** varsa, şunu ekleyin:

```nginx
location /uploads/ {
    root /;
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}
```

### Seçenek B: Nginx Reverse Proxy Container Ekle

Eğer custom nginx config yoksa, projeye nginx container ekleyin:

1. Coolify'da "Add Service" → "Nginx"
2. `nginx.conf` dosyasını mount edin
3. Port 80/443'ü nginx'e yönlendirin
4. Nginx'ten Next.js'e proxy yapın

## 4. Build & Deploy

```bash
# Local'de test
git add .
git commit -m "Fix: Upload static file serving düzeltildi"
git push

# Coolify'da
→ Force Rebuild
→ Redeploy
```

## 5. Test

1. Admin panele gidin: `https://eskisehirolay.com.tr/admin`
2. Yeni haber ekleyin
3. Resim yükleyin
4. URL'nin `https://eskisehirolay.com.tr/uploads/...` olduğunu doğrulayın
5. Resmi tarayıcıda açın - 404 almamalısınız!

## Sorun Giderme

### 404 Hatası Alıyorum

- **Volume mount yaptınız mı?** Kontrol edin.
- **Nginx config eklediniz mi?** Coolify logs'ta nginx hatası var mı?
- **Container'a bağlanıp kontrol edin:**

```bash
# Coolify terminal'den
ls -la /uploads
# Dosyalar var mı?
```

### Resim Yüklenmiyor (Upload Hatası)

- Container logs'u kontrol edin:
```bash
Error: EACCES: permission denied, open '/uploads/...'
```

Bu durumda Dockerfile'daki permission ayarlarını kontrol edin.

### Resimler Container Restart Sonrası Kayboluyor

- Volume mount eksik! Adım 2'yi uygulayın.

## Alternatif: S3/Cloudflare R2 Kullanımı

Eğer Nginx configuration ile uğraşmak istemiyorsanız, upload endpoint'i değiştirip dosyaları external storage'a (S3, R2, etc.) yükleyebilirsiniz.
