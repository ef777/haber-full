# Coolify Deployment & Uploads Rehberi

Coolify üzerinde uygulamanızın resimlerinin kalıcı olması (silinmemesi) ve düzgün çalışması için yapmanız gereken ayarlar aşağıdadır.

## 1. Environment Variables (Ortam Değişkenleri)

Coolify projenizde **Environment Variables** sekmesine şu değişkenleri ekleyin:

```bash
NEXT_PUBLIC_SITE_URL=https://sizin-site-adresiniz.com
NEXT_PUBLIC_SITE_NAME="Site Adı"
NODE_ENV=production
```

## 2. Persistent Storage (Kalıcı Depolama) - KRİTİK ADIM!

Docker container'lar her yeniden başlatıldığında (redeploy) içindeki dosyalar sıfırlanır. Yüklenen resimlerin silinmemesi için **Storage** ayarı yapmalısınız.

1.  Coolify'da projenize gidin.
2.  **Storage** sekmesine tıklayın.
3.  **"Add Storage"** (veya benzeri bir buton) ile yeni bir volume ekleyin.
4.  Şu ayarları girin:

    *   **Volume Name:** `uploads-data` (veya istediğiniz bir isim)
    *   **Destination Path (Container İçi Yol):** `/app/public/uploads`
        *   *Burası çok önemli! Kodunuz dosyaları tam olarak buraya kaydediyor.*

> **Not:** Eğer Coolify'da `docker-compose.yml` düzenliyorsanız, şöyle görünmelidir:
> ```yaml
> volumes:
>   - type: volume
>     source: uploads-data
>     target: /app/public/uploads
> ```

## 3. Deployment Kontrolü

Bu ayarları yaptıktan sonra uygulamanızı **"Redeploy"** etmeniz gerekir.

### Test Etme
1.  Admin paneline girip bir resim yükleyin.
2.  Resmin sayfada göründüğünden emin olun.
3.  Coolify üzerinden "Restart" veya "Redeploy" yapın.
4.  Site tekrar açıldığında resmin hala orada olduğunu doğrulayın.

---

## Teknik Detaylar (Meraklısı İçin)

*   **Nereye Kaydediliyor?**
    Next.js uygulaması içinde `src/app/api/admin/upload/route.ts` dosyası, resimleri `process.cwd() + '/public/uploads'` klasörüne kaydeder. Docker içinde `process.cwd()` `/app` olduğu için tam yol `/app/public/uploads` olur.

*   **Neden Kayboluyor?**
    Docker container'lar "ephemeral" (geçici) dosya sistemine sahiptir. Volume mount etmezseniz, container öldüğünde içindeki `/app/public/uploads` klasörü de ölür. Volume mount ettiğimizde, bu klasörü sunucunun fiziksel diskinde güvenli bir yere bağlıyoruz.