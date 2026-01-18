import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface EczaneData {
  ad: string;
  adres: string;
  telefon: string;
  ilce: string;
}

// GET active eczaneler for today - otomatik güncelleme ile
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Bugünkü eczaneleri kontrol et
    let eczaneler = await prisma.nobetciEczane.findMany({
      where: {
        aktif: true,
        tarih: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { ad: 'asc' },
    });

    // Eğer bugün için veri yoksa, otomatik olarak çekmeyi dene
    if (eczaneler.length === 0) {
      const yeniEczaneler = await fetchEczanelerOtomatik();

      if (yeniEczaneler.length > 0) {
        // Veritabanına kaydet
        await prisma.nobetciEczane.createMany({
          data: yeniEczaneler.map((e) => ({
            ad: e.ad,
            adres: e.adres,
            telefon: e.telefon || null,
            il: 'Eskisehir',
            ilce: e.ilce || null,
            tarih: today,
            aktif: true,
          })),
        });

        // Yeni kaydedilen verileri getir
        eczaneler = await prisma.nobetciEczane.findMany({
          where: {
            aktif: true,
            tarih: {
              gte: today,
              lt: tomorrow,
            },
          },
          orderBy: { ad: 'asc' },
        });
      }
    }

    return NextResponse.json(eczaneler);
  } catch (error) {
    console.error('Eczane API hatası:', error);
    return NextResponse.json([]);
  }
}

// Otomatik eczane verisi çekme
async function fetchEczanelerOtomatik(): Promise<EczaneData[]> {
  // 1. CollectAPI dene
  if (process.env.COLLECTAPI_KEY) {
    const eczaneler = await fetchFromCollectApi();
    if (eczaneler.length > 0) return eczaneler;
  }

  // 2. NosyAPI dene
  if (process.env.NOSYAPI_KEY) {
    const eczaneler = await fetchFromNosyApi();
    if (eczaneler.length > 0) return eczaneler;
  }

  // 3. Web scraping dene
  const eczaneler = await scrapeFromWeb();
  return eczaneler;
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
        cache: 'no-store',
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
        cache: 'no-store',
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

// Web scraping
async function scrapeFromWeb(): Promise<EczaneData[]> {
  try {
    // Eskişehir Eczacı Odası sitesinden scraping
    const response = await fetch('https://www.eskisehireo.org.tr/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
    });

    if (!response.ok) return [];

    const html = await response.text();
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

    return eczaneler;
  } catch {
    return [];
  }
}
