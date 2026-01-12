import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Künye - Haber Portali',
  description: 'Haber Portali yayın ekibi, iletişim bilgileri, adres ve künye detayları.',
  robots: {
    index: true,
    follow: true,
  }
};

export default function KunyePage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto bg-[#161616] border border-[#262626] rounded-lg p-8 shadow-2xl">
        <h1 className="text-3xl font-black text-white mb-8 border-b border-[#262626] pb-4">
          Künye
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Sol Kolon: Yonetim */}
          <div>
            <h2 className="text-xl font-bold text-red-500 mb-4 uppercase tracking-wider">Yönetim</h2>
            
            <div className="mb-6">
              <h3 className="text-white font-bold mb-1">İmtiyaz Sahibi</h3>
              <p className="text-gray-400">Lystra Software Medya A.Ş. Adına</p>
              <p className="text-gray-300 font-medium">Ahmet Yılmaz</p>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-bold mb-1">Genel Yayın Yönetmeni</h3>
              <p className="text-gray-300 font-medium">Mehmet Demir</p>
              <p className="text-sm text-gray-500">mehmet.demir@haberportali.com</p>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-bold mb-1">Sorumlu Yazı İşleri Müdürü</h3>
              <p className="text-gray-300 font-medium">Ayşe Kaya</p>
              <p className="text-sm text-gray-500">ayse.kaya@haberportali.com</p>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-bold mb-1">Hukuk Danışmanı</h3>
              <p className="text-gray-300 font-medium">Av. Caner Öztürk</p>
            </div>
          </div>

          {/* Sag Kolon: Iletisim */}
          <div>
            <h2 className="text-xl font-bold text-red-500 mb-4 uppercase tracking-wider">İletişim</h2>
            
            <div className="mb-6">
              <h3 className="text-white font-bold mb-1">Adres</h3>
              <p className="text-gray-400 leading-relaxed">
                Hoşnudiye Mah. İsmet İnönü-1 Cad. No:123<br />
                Tepebaşı / ESKİŞEHİR
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-bold mb-1">Telefon</h3>
              <p className="text-gray-400">+90 (222) 123 45 67</p>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-bold mb-1">E-posta</h3>
              <p className="text-gray-400">info@haberportali.com</p>
              <p className="text-gray-400">reklam@haberportali.com</p>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-bold mb-1">UETS Adresi</h3>
              <p className="text-gray-400">12345-67890-12345</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#262626]">
          <h2 className="text-xl font-bold text-red-500 mb-4 uppercase tracking-wider">Yazılım ve Altyapı</h2>
          <div className="flex items-center gap-4 bg-[#0a0a0a] p-4 rounded-lg border border-[#333]">
             <div>
                <p className="text-white font-bold">Lystra Software</p>
                <p className="text-sm text-gray-500">Haber Yazılım Sistemleri v3.0</p>
                <a href="https://lystrasoftware.xyz" target="_blank" className="text-xs text-blue-500 hover:text-blue-400 mt-1 block">www.lystrasoftware.xyz</a>
             </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-gray-500 text-center leading-relaxed">
          <p>
            Sitemizde yayınlanan haberlerin tüm hakları Lystra Software Medya A.Ş.'ye aittir. Kaynak gösterilmeden kullanılamaz.
            Sitemizdeki harici linkler ayrı bir sayfada açılır. Yayınlanan yazı ve yorumlardan yazarları sorumludur.
            Sitemiz Basın Meslek İlkelerine uymaya söz vermiştir.
          </p>
        </div>
      </div>
    </div>
  );
}
