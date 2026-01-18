import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

interface EczaneData {
  ad: string;
  adres: string;
  telefon: string;
  ilce: string;
}

// POST - Nöbetçi eczaneleri dış kaynaktan çek ve veritabanına kaydet
export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Farklı kaynaklardan veri çekmeyi dene
    let eczaneler: EczaneData[] = [];

    // 1. Önce nosyapi'yi dene (API key gerekli)
    if (process.env.NOSYAPI_KEY) {
      eczaneler = await fetchFromNosyApi();
    }

    // 2. nosyapi yoksa collectapi'yi dene
    if (eczaneler.length === 0 && process.env.COLLECTAPI_KEY) {
      eczaneler = await fetchFromCollectApi();
    }

    // 3. Hiçbiri yoksa web scraping yap
    if (eczaneler.length === 0) {
      eczaneler = await scrapeFromWeb();
    }

    if (eczaneler.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Veri kaynakları kullanılamıyor. Lütfen API key ekleyin veya manuel giriş yapın.' },
        { status: 400 }
      );
    }

    // Bugünün tarihini al
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Bugünkü eski kayıtları sil
    await prisma.nobetciEczane.deleteMany({
      where: {
        tarih: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Yeni verileri ekle
    const created = await prisma.nobetciEczane.createMany({
      data: eczaneler.map((e) => ({
        ad: e.ad,
        adres: e.adres,
        telefon: e.telefon || null,
        il: 'Eskisehir',
        ilce: e.ilce || null,
        tarih: today,
        aktif: true,
      })),
    });

    return NextResponse.json({
      success: true,
      message: `${created.count} eczane başarıyla güncellendi`,
      count: created.count,
    });
  } catch (error) {
    console.error('Eczane sync hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Senkronizasyon başarısız' },
      { status: 500 }
    );
  }
}

// NosyApi'den veri çek
async function fetchFromNosyApi(): Promise<EczaneData[]> {
  try {
    const apiKey = process.env.NOSYAPI_KEY;
    if (!apiKey) return [];

    const response = await fetch(
      'https://www.nosyapi.com/apiv2/pharmacy?city=eskisehir',
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();

    if (data.status === 'success' && Array.isArray(data.data)) {
      return data.data.map((e: { name: string; address: string; phone: string; district: string }) => ({
        ad: e.name,
        adres: e.address,
        telefon: e.phone,
        ilce: e.district,
      }));
    }

    return [];
  } catch {
    return [];
  }
}

// CollectApi'den veri çek
async function fetchFromCollectApi(): Promise<EczaneData[]> {
  try {
    const apiKey = process.env.COLLECTAPI_KEY;
    if (!apiKey) return [];

    const response = await fetch(
      'https://api.collectapi.com/health/dutyPharmacy?il=Eskişehir',
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `apikey ${apiKey}`,
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();

    if (data.success && Array.isArray(data.result)) {
      return data.result.map((e: { name: string; address: string; phone: string; dist: string }) => ({
        ad: e.name,
        adres: e.address,
        telefon: e.phone,
        ilce: e.dist,
      }));
    }

    return [];
  } catch {
    return [];
  }
}

// Web scraping (yedek yöntem)
async function scrapeFromWeb(): Promise<EczaneData[]> {
  try {
    // Eskişehir Eczacı Odası sitesinden scraping dene
    const response = await fetch('https://www.eskisehireo.org.tr/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    if (!response.ok) return [];

    const html = await response.text();

    // Basit regex ile eczane verilerini parse etmeye çalış
    // Not: Site yapısına göre güncellenmeli
    const eczaneler: EczaneData[] = [];

    // JSON-LD formatında veri ara
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (jsonLdMatch) {
      for (const match of jsonLdMatch) {
        try {
          const jsonStr = match.replace(/<script type="application\/ld\+json">/i, '').replace(/<\/script>/i, '');
          const jsonData = JSON.parse(jsonStr);

          if (jsonData['@type'] === 'Pharmacy' || jsonData['@type'] === 'LocalBusiness') {
            eczaneler.push({
              ad: jsonData.name || '',
              adres: jsonData.address?.streetAddress || jsonData.address || '',
              telefon: jsonData.telephone || '',
              ilce: jsonData.address?.addressLocality || '',
            });
          }
        } catch {
          // JSON parse hatası, devam et
        }
      }
    }

    // Tablo formatında veri ara
    const tableMatch = html.match(/<table[^>]*class="[^"]*eczane[^"]*"[^>]*>([\s\S]*?)<\/table>/gi);
    if (tableMatch && eczaneler.length === 0) {
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      const rows = tableMatch[0].matchAll(rowRegex);

      for (const row of rows) {
        const cells = row[1].match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
        if (cells && cells.length >= 2) {
          const cleanText = (str: string) => str.replace(/<[^>]*>/g, '').trim();
          eczaneler.push({
            ad: cleanText(cells[0]),
            adres: cells[1] ? cleanText(cells[1]) : '',
            telefon: cells[2] ? cleanText(cells[2]) : '',
            ilce: cells[3] ? cleanText(cells[3]) : '',
          });
        }
      }
    }

    return eczaneler;
  } catch {
    return [];
  }
}
