import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Unsplash'tan ücretsiz, çalışan resim URL'leri
const IMAGES = {
  gundem: [
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=450&fit=crop', // Şehir manzarası
    'https://images.unsplash.com/photo-1577415124269-fc1140a69e91?w=800&h=450&fit=crop', // Meclis
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=450&fit=crop', // Gazete
  ],
  ekonomi: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop', // Borsa
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=450&fit=crop', // Para
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop', // İş toplantısı
  ],
  spor: [
    'https://images.unsplash.com/photo-1461896836934- voices08139a?w=800&h=450&fit=crop', // Futbol
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=450&fit=crop', // Futbol topu
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=450&fit=crop', // Koşu
  ],
  dunya: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop', // Dünya
    'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=800&h=450&fit=crop', // Uluslararası
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=450&fit=crop', // New York
  ],
  teknoloji: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop', // Devre
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=450&fit=crop', // Laptop
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop', // Robot
  ],
  saglik: [
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=450&fit=crop', // Hastane
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop', // Doktor
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&h=450&fit=crop', // Steteskop
  ],
  kulturSanat: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop', // Müze
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=450&fit=crop', // Sanat
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=450&fit=crop', // Konser
  ],
  yasam: [
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=450&fit=crop', // Ev
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop', // Yoga
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=450&fit=crop', // Yemek
  ],
  avatars: [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', // Erkek 1
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', // Kadın 1
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', // Erkek 2
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', // Kadın 2
  ],
};

async function main() {
  console.log('🌱 Veritabanı seed işlemi başlıyor...');

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@habersitesi.com' },
    update: {},
    create: {
      email: 'admin@habersitesi.com',
      sifre: adminPassword,
      ad: 'Sistem Yöneticisi',
      aktif: true,
    },
  });
  console.log('✅ Admin oluşturuldu:', admin.email);

  // Kategoriler
  const kategoriData = [
    { ad: 'Gündem', slug: 'gundem', sira: 1, aciklama: 'Türkiye ve güncel haberler', resim: IMAGES.gundem[0] },
    { ad: 'Ekonomi', slug: 'ekonomi', sira: 2, aciklama: 'Ekonomi, finans ve piyasa haberleri', resim: IMAGES.ekonomi[0] },
    { ad: 'Spor', slug: 'spor', sira: 3, aciklama: 'Spor haberleri ve sonuçları', resim: IMAGES.spor[0] },
    { ad: 'Dünya', slug: 'dunya', sira: 4, aciklama: 'Dünyadan son dakika haberler', resim: IMAGES.dunya[0] },
    { ad: 'Teknoloji', slug: 'teknoloji', sira: 5, aciklama: 'Teknoloji ve bilim haberleri', resim: IMAGES.teknoloji[0] },
    { ad: 'Sağlık', slug: 'saglik', sira: 6, aciklama: 'Sağlık ve yaşam haberleri', resim: IMAGES.saglik[0] },
    { ad: 'Kültür-Sanat', slug: 'kultur-sanat', sira: 7, aciklama: 'Kültür, sanat ve magazin', resim: IMAGES.kulturSanat[0] },
    { ad: 'Yaşam', slug: 'yasam', sira: 8, aciklama: 'Yaşam, moda ve seyahat', resim: IMAGES.yasam[0] },
  ];

  const kategoriler: Record<string, { id: number }> = {};
  for (const kat of kategoriData) {
    const created = await prisma.kategori.upsert({
      where: { slug: kat.slug },
      update: { resim: kat.resim, aciklama: kat.aciklama },
      create: kat,
    });
    kategoriler[kat.slug] = { id: created.id };
  }
  console.log('✅ Kategoriler oluşturuldu');

  // Yazarlar
  const yazarData = [
    { ad: 'Ahmet Yılmaz', slug: 'ahmet-yilmaz', email: 'ahmet@habersitesi.com', biyografi: 'Kıdemli politika muhabiri. 15 yıllık gazetecilik deneyimi.', avatar: IMAGES.avatars[0], twitter: 'ahmetyilmaz' },
    { ad: 'Elif Demir', slug: 'elif-demir', email: 'elif@habersitesi.com', biyografi: 'Ekonomi editörü. Finans ve piyasalar uzmanı.', avatar: IMAGES.avatars[1], twitter: 'elifdemir' },
    { ad: 'Mehmet Kaya', slug: 'mehmet-kaya', email: 'mehmet@habersitesi.com', biyografi: 'Spor muhabiri. Futbol ve basketbol alanında uzman.', avatar: IMAGES.avatars[2], twitter: 'mehmetkaya' },
    { ad: 'Ayşe Öztürk', slug: 'ayse-ozturk', email: 'ayse@habersitesi.com', biyografi: 'Teknoloji editörü. Yapay zeka ve inovasyon konularında yazıyor.', avatar: IMAGES.avatars[3], twitter: 'ayseozturk' },
    { ad: 'Haber Merkezi', slug: 'haber-merkezi', email: 'haber@habersitesi.com', biyografi: 'Haber Sitesi editör ekibi', avatar: null, twitter: null },
  ];

  const yazarlar: Record<string, { id: number }> = {};
  for (const y of yazarData) {
    const created = await prisma.yazar.upsert({
      where: { slug: y.slug },
      update: { avatar: y.avatar, biyografi: y.biyografi },
      create: y,
    });
    yazarlar[y.slug] = { id: created.id };
  }
  console.log('✅ Yazarlar oluşturuldu');

  // Etiketler
  const etiketData = [
    'son dakika', 'gündem', 'ekonomi', 'dolar', 'euro', 'altın', 'borsa', 
    'futbol', 'basketbol', 'süper lig', 'şampiyonlar ligi',
    'teknoloji', 'yapay zeka', 'iphone', 'samsung', 
    'sağlık', 'covid', 'aşı', 'hastane',
    'dünya', 'abd', 'avrupa', 'rusya', 'çin',
    'kültür', 'sinema', 'müzik', 'tiyatro'
  ];

  const etiketler: Record<string, { id: number }> = {};
  for (const e of etiketData) {
    const slug = e.toLowerCase().replace(/\s+/g, '-').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ç/g, 'c').replace(/ğ/g, 'g');
    const created = await prisma.etiket.upsert({
      where: { slug },
      update: {},
      create: { ad: e, slug },
    });
    etiketler[slug] = { id: created.id };
  }
  console.log('✅ Etiketler oluşturuldu');

  // Haberler - Kapsamlı örnek haberler
  const haberData = [
    // GÜNDEM HABERLERİ
    {
      baslik: 'Cumhurbaşkanı Yeni Ekonomi Paketini Açıkladı',
      slug: 'cumhurbaskani-yeni-ekonomi-paketini-acikladi',
      spot: 'Yeni ekonomik tedbirler kapsamında vergi indirimleri ve yatırım teşvikleri ön plana çıkıyor.',
      icerik: `<p>Cumhurbaşkanlığı Külliyesi'nde düzenlenen basın toplantısında açıklanan yeni ekonomi paketi, iş dünyasından olumlu tepkiler aldı.</p>
      <h2>Paketin Öne Çıkan Maddeleri</h2>
      <ul>
        <li>KDV oranlarında genel indirim</li>
        <li>İhracatçılara ek teşvikler</li>
        <li>KOBİ'lere düşük faizli kredi imkanı</li>
        <li>Enerji maliyetlerinde sübvansiyon</li>
      </ul>
      <p>Ekonomi uzmanları, paketin enflasyonla mücadelede önemli bir adım olduğunu belirtti.</p>
      <blockquote>"Bu paket, ekonomimizi güçlendirecek önemli adımlar içeriyor" - Ekonomi Bakanı</blockquote>`,
      resim: IMAGES.gundem[1],
      kategoriSlug: 'gundem',
      yazarSlug: 'ahmet-yilmaz',
      manset: true,
      sonDakika: true,
      etiketSlugs: ['son-dakika', 'gundem', 'ekonomi'],
    },
    {
      baslik: 'TBMM\'de Tarihi Oylama: Yeni Yasa Kabul Edildi',
      slug: 'tbmmde-tarihi-oylama-yeni-yasa-kabul-edildi',
      spot: 'Meclis genel kurulunda yapılan oylamada yeni düzenleme büyük çoğunlukla kabul edildi.',
      icerik: `<p>Türkiye Büyük Millet Meclisi'nde uzun süredir tartışılan yasa teklifi, bugün yapılan oylamada kabul edildi.</p>
      <p>Oylama sonuçlarına göre 350 kabul, 180 ret oyu kullanan milletvekilleri, yasanın kabulünü sağladı.</p>
      <h3>Yasanın Getirdikleri</h3>
      <p>Yeni düzenleme ile birlikte vatandaşların günlük hayatını etkileyecek önemli değişiklikler yürürlüğe girecek.</p>`,
      resim: IMAGES.gundem[2],
      kategoriSlug: 'gundem',
      yazarSlug: 'ahmet-yilmaz',
      manset: false,
      sonDakika: false,
      etiketSlugs: ['gundem'],
    },

    // EKONOMİ HABERLERİ
    {
      baslik: 'Dolar ve Euro\'da Son Durum: Piyasalar Hareketli',
      slug: 'dolar-ve-euroda-son-durum-piyasalar-hareketli',
      spot: 'Döviz piyasalarında yaşanan hareketlilik yatırımcıların dikkatini çekiyor.',
      icerik: `<p>Döviz piyasalarında bugün önemli hareketler yaşandı. Dolar ve euro, gün içinde dalgalı bir seyir izledi.</p>
      <h2>Günün Kapanış Fiyatları</h2>
      <table>
        <tr><td><strong>Dolar</strong></td><td>32.45 TL</td></tr>
        <tr><td><strong>Euro</strong></td><td>35.20 TL</td></tr>
        <tr><td><strong>Sterlin</strong></td><td>41.30 TL</td></tr>
      </table>
      <p>Ekonomistler, merkez bankasının faiz kararının piyasaları etkilediğini belirtti.</p>`,
      resim: IMAGES.ekonomi[1],
      kategoriSlug: 'ekonomi',
      yazarSlug: 'elif-demir',
      manset: true,
      sonDakika: false,
      etiketSlugs: ['ekonomi', 'dolar', 'euro'],
    },
    {
      baslik: 'Borsa İstanbul Rekor Kırdı: BIST 100 Tarihi Zirvede',
      slug: 'borsa-istanbul-rekor-kirdi-bist-100-tarihi-zirvede',
      spot: 'BIST 100 endeksi, yabancı yatırımcı girişleriyle birlikte tüm zamanların en yüksek seviyesine ulaştı.',
      icerik: `<p>Borsa İstanbul'da işlemler, bugün tarihi bir rekorla sonuçlandı. BIST 100 endeksi, gün sonunda 10.500 puan seviyesini aşarak yeni bir zirve yaptı.</p>
      <p>Analistler, yabancı yatırımcıların Türk piyasalarına olan ilgisinin arttığını vurguladı.</p>
      <h3>En Çok Yükselen Hisseler</h3>
      <ul>
        <li>XYZ Holding: %8.5</li>
        <li>ABC Bank: %6.2</li>
        <li>Tech A.Ş.: %5.8</li>
      </ul>`,
      resim: IMAGES.ekonomi[0],
      kategoriSlug: 'ekonomi',
      yazarSlug: 'elif-demir',
      manset: false,
      sonDakika: true,
      etiketSlugs: ['ekonomi', 'borsa'],
    },

    // SPOR HABERLERİ
    {
      baslik: 'Süper Lig\'de Heyecan Dorukta: Şampiyon Kim Olacak?',
      slug: 'super-ligde-heyecan-dorukta-sampiyon-kim-olacak',
      spot: 'Ligin son haftalarına girilirken şampiyonluk yarışı kızışıyor.',
      icerik: `<p>Süper Lig'de şampiyonluk yarışı son haftalara girerken büyük heyecan yaşanıyor.</p>
      <h2>Puan Durumu</h2>
      <p>Lider takım 75 puanla zirvede yer alırken, ikinci sıradaki rakibi 73 puanla takip ediyor.</p>
      <p>Teknik direktörler, her maçın final niteliğinde olduğunu vurguladı.</p>
      <blockquote>"Artık her maç bir final. Taraftarlarımızın desteğiyle şampiyonluğu kazanacağız." - Teknik Direktör</blockquote>`,
      resim: IMAGES.spor[0],
      kategoriSlug: 'spor',
      yazarSlug: 'mehmet-kaya',
      manset: true,
      sonDakika: false,
      etiketSlugs: ['futbol', 'super-lig'],
    },
    {
      baslik: 'Milli Takım Avrupa Şampiyonası\'na Hazırlanıyor',
      slug: 'milli-takim-avrupa-sampiyonasina-hazirlaniyor',
      spot: 'A Milli Futbol Takımı, yaklaşan turnuva için hazırlıklarını sürdürüyor.',
      icerik: `<p>A Milli Futbol Takımı, Avrupa Şampiyonası hazırlıkları kapsamında kamp çalışmalarına başladı.</p>
      <p>Teknik direktör, kadro seçimlerini önümüzdeki hafta açıklayacağını belirtti.</p>
      <h3>Turnuva Öncesi Hazırlık Maçları</h3>
      <ul>
        <li>15 Mart: Almanya - Türkiye</li>
        <li>20 Mart: Türkiye - İtalya</li>
      </ul>`,
      resim: IMAGES.spor[1],
      kategoriSlug: 'spor',
      yazarSlug: 'mehmet-kaya',
      manset: false,
      sonDakika: false,
      etiketSlugs: ['futbol'],
    },

    // TEKNOLOJİ HABERLERİ
    {
      baslik: 'Yapay Zeka Devriminde Yeni Dönem: GPT-5 Duyuruldu',
      slug: 'yapay-zeka-devriminde-yeni-donem-gpt-5-duyuruldu',
      spot: 'OpenAI\'nin yeni yapay zeka modeli, sektörde büyük ses getirdi.',
      icerik: `<p>OpenAI, uzun süredir beklenen GPT-5 modelini bugün resmi olarak duyurdu. Yeni model, önceki sürümlere göre çok daha gelişmiş yeteneklere sahip.</p>
      <h2>GPT-5'in Yenilikleri</h2>
      <ul>
        <li>Daha doğal dil anlama kapasitesi</li>
        <li>Görsel ve metin birlikte işleme</li>
        <li>Gerçek zamanlı internet erişimi</li>
        <li>Gelişmiş mantık yürütme</li>
      </ul>
      <p>Teknoloji uzmanları, bu gelişmenin birçok sektörü dönüştüreceğini öngörüyor.</p>`,
      resim: IMAGES.teknoloji[2],
      kategoriSlug: 'teknoloji',
      yazarSlug: 'ayse-ozturk',
      manset: true,
      sonDakika: true,
      etiketSlugs: ['teknoloji', 'yapay-zeka'],
    },
    {
      baslik: 'Apple Yeni iPhone 17\'yi Tanıttı: İşte Tüm Özellikler',
      slug: 'apple-yeni-iphone-17yi-tanitti-iste-tum-ozellikler',
      spot: 'Apple\'ın yeni amiral gemisi telefonu, şaşırtıcı özelliklerle geliyor.',
      icerik: `<p>Apple, California'da düzenlediği etkinlikte iPhone 17 serisini tanıttı. Yeni telefon, önceki modellere göre birçok yenilik içeriyor.</p>
      <h2>Öne Çıkan Özellikler</h2>
      <ul>
        <li>A19 Bionic çip</li>
        <li>48MP ana kamera</li>
        <li>Titanium gövde</li>
        <li>48 saat pil ömrü</li>
      </ul>
      <p>Türkiye satış fiyatı henüz açıklanmadı.</p>`,
      resim: IMAGES.teknoloji[1],
      kategoriSlug: 'teknoloji',
      yazarSlug: 'ayse-ozturk',
      manset: false,
      sonDakika: false,
      etiketSlugs: ['teknoloji', 'iphone'],
    },

    // SAĞLIK HABERLERİ
    {
      baslik: 'Grip Salgını Uyarısı: Uzmanlardan Önemli Açıklama',
      slug: 'grip-salgini-uyarisi-uzmanlardan-onemli-aciklama',
      spot: 'Sağlık Bakanlığı, artan grip vakaları nedeniyle vatandaşları uyardı.',
      icerik: `<p>Kış aylarının gelmesiyle birlikte grip vakaları artış gösterdi. Sağlık Bakanlığı, vatandaşları tedbirli olmaya çağırdı.</p>
      <h2>Korunma Yöntemleri</h2>
      <ul>
        <li>Düzenli el yıkama</li>
        <li>Kapalı alanlarda maske kullanımı</li>
        <li>Grip aşısı yaptırma</li>
        <li>Bol sıvı tüketimi</li>
      </ul>
      <p>Hastanelerde grip poliklinikleri 24 saat hizmet veriyor.</p>`,
      resim: IMAGES.saglik[0],
      kategoriSlug: 'saglik',
      yazarSlug: 'haber-merkezi',
      manset: false,
      sonDakika: false,
      etiketSlugs: ['saglik'],
    },

    // DÜNYA HABERLERİ
    {
      baslik: 'AB Zirvesi\'nde Kritik Kararlar: Türkiye Gündemde',
      slug: 'ab-zirvesinde-kritik-kararlar-turkiye-gundemde',
      spot: 'Brüksel\'de toplanan AB liderleri, Türkiye ile ilişkileri ele aldı.',
      icerik: `<p>Avrupa Birliği liderleri, Brüksel'de gerçekleştirilen zirvede önemli kararlar aldı.</p>
      <p>Toplantıda Türkiye ile ilişkilerin geleceği de ele alındı. AB yetkilileri, diyaloğun sürdürülmesi gerektiğini vurguladı.</p>
      <h3>Alınan Kararlar</h3>
      <ul>
        <li>Göç politikasında ortak strateji</li>
        <li>Enerji güvenliği tedbirleri</li>
        <li>Ekonomik işbirliği anlaşmaları</li>
      </ul>`,
      resim: IMAGES.dunya[1],
      kategoriSlug: 'dunya',
      yazarSlug: 'haber-merkezi',
      manset: false,
      sonDakika: false,
      etiketSlugs: ['dunya', 'avrupa'],
    },

    // KÜLTÜR-SANAT HABERLERİ
    {
      baslik: 'İstanbul Film Festivali Başlıyor: Bu Yılın Öne Çıkan Filmleri',
      slug: 'istanbul-film-festivali-basliyor-bu-yilin-one-cikan-filmleri',
      spot: '43. İstanbul Film Festivali, yerli ve yabancı birçok filmi sinemaseverlerle buluşturacak.',
      icerik: `<p>İstanbul Film Festivali, bu yıl 43. kez kapılarını açıyor. Festival, 15 gün boyunca 200'den fazla filmi izleyicilerle buluşturacak.</p>
      <h2>Festivalin Öne Çıkan Filmleri</h2>
      <ul>
        <li>"Kayıp Rüyalar" - Türkiye</li>
        <li>"The Silent Echo" - ABD</li>
        <li>"Paris Bir Gece" - Fransa</li>
      </ul>
      <p>Biletler online satışa sunuldu.</p>`,
      resim: IMAGES.kulturSanat[0],
      kategoriSlug: 'kultur-sanat',
      yazarSlug: 'haber-merkezi',
      manset: false,
      sonDakika: false,
      etiketSlugs: ['kultur', 'sinema'],
    },

    // YAŞAM HABERLERİ
    {
      baslik: '2026 Yılının Seyahat Trendleri: En Popüler Destinasyonlar',
      slug: '2026-yilinin-seyahat-trendleri-en-populer-destinasyonlar',
      spot: 'Seyahat uzmanları, yeni yılın en çok tercih edilecek tatil noktalarını açıkladı.',
      icerik: `<p>Seyahat sektörü uzmanları, 2026 yılında en çok tercih edilecek destinasyonları belirledi.</p>
      <h2>En Popüler Destinasyonlar</h2>
      <ol>
        <li>Kapadokya, Türkiye</li>
        <li>Bali, Endonezya</li>
        <li>Santorini, Yunanistan</li>
        <li>Tokyo, Japonya</li>
        <li>İzlanda</li>
      </ol>
      <p>Uzmanlar, sürdürülebilir turizmin de ön plana çıkacağını belirtiyor.</p>`,
      resim: IMAGES.yasam[0],
      kategoriSlug: 'yasam',
      yazarSlug: 'haber-merkezi',
      manset: false,
      sonDakika: false,
      etiketSlugs: [],
    },
  ];

  for (const haber of haberData) {
    const kategoriId = kategoriler[haber.kategoriSlug]?.id;
    const yazarId = yazarlar[haber.yazarSlug]?.id;

    if (!kategoriId) {
      console.warn(`Kategori bulunamadı: ${haber.kategoriSlug}`);
      continue;
    }

    const createdHaber = await prisma.haber.upsert({
      where: { slug: haber.slug },
      update: {
        resim: haber.resim,
        manset: haber.manset,
        sonDakika: haber.sonDakika,
      },
      create: {
        baslik: haber.baslik,
        slug: haber.slug,
        spot: haber.spot,
        icerik: haber.icerik,
        resim: haber.resim,
        resimAlt: haber.baslik,
        durum: 'yayinda',
        manset: haber.manset,
        sonDakika: haber.sonDakika,
        kategoriId,
        yazarId,
        seoBaslik: haber.baslik,
        seoAciklama: haber.spot,
        yayinTarihi: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Son 7 gün içinde rastgele
      },
    });

    // Etiketleri ekle
    if (haber.etiketSlugs && haber.etiketSlugs.length > 0) {
      for (const etiketSlug of haber.etiketSlugs) {
        const etiketId = etiketler[etiketSlug]?.id;
        if (etiketId) {
          await prisma.haberEtiket.upsert({
            where: {
              haberId_etiketId: {
                haberId: createdHaber.id,
                etiketId,
              },
            },
            update: {},
            create: {
              haberId: createdHaber.id,
              etiketId,
            },
          });
        }
      }
    }
  }
  console.log('✅ Haberler oluşturuldu');

  // Site ayarları
  await prisma.siteAyarlari.upsert({
    where: { id: 1 },
    update: {},
    create: {
      siteAdi: 'Haber Sitesi',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      siteAciklama: 'Türkiye\'nin en güncel haber portalı. Son dakika haberleri, gündem, ekonomi, spor ve daha fazlası.',
      footerText: '© 2026 Haber Sitesi. Tüm hakları saklıdır.',
      sosyalFacebook: 'https://facebook.com/habersitesi',
      sosyalTwitter: 'https://twitter.com/habersitesi',
      sosyalInstagram: 'https://instagram.com/habersitesi',
      sosyalYoutube: 'https://youtube.com/habersitesi',
    },
  });
  console.log('✅ Site ayarları oluşturuldu');

  console.log('🎉 Seed işlemi tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
