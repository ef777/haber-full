import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixImageUrls() {
  console.log('🔄 Resim URL\'leri güncelleniyor...')

  try {
    // Haber tablosundaki resim URL'lerini güncelle
    const haberlerResult = await prisma.$executeRaw`
      UPDATE "Haber"
      SET "resim" = REPLACE("resim", 'lystra.xyz', 'eskisehirolay.com.tr')
      WHERE "resim" LIKE '%lystra.xyz%'
    `
    console.log(`✅ ${haberlerResult} haber resmi güncellendi`)

    // SiteAyarlari tablosundaki URL'leri güncelle
    const ayarlarResult = await prisma.$executeRaw`
      UPDATE "SiteAyarlari"
      SET "siteUrl" = REPLACE("siteUrl", 'lystra.xyz', 'eskisehirolay.com.tr'),
          "logoUrl" = REPLACE("logoUrl", 'lystra.xyz', 'eskisehirolay.com.tr'),
          "logoAltUrl" = REPLACE("logoAltUrl", 'lystra.xyz', 'eskisehirolay.com.tr'),
          "faviconUrl" = REPLACE("faviconUrl", 'lystra.xyz', 'eskisehirolay.com.tr')
      WHERE "siteUrl" LIKE '%lystra.xyz%'
         OR "logoUrl" LIKE '%lystra.xyz%'
         OR "logoAltUrl" LIKE '%lystra.xyz%'
         OR "faviconUrl" LIKE '%lystra.xyz%'
    `
    console.log(`✅ ${ayarlarResult} site ayarı güncellendi`)

    // Kategori tablosundaki resim URL'lerini güncelle (varsa)
    const kategoriResult = await prisma.$executeRaw`
      UPDATE "Kategori"
      SET "resim" = REPLACE("resim", 'lystra.xyz', 'eskisehirolay.com.tr')
      WHERE "resim" LIKE '%lystra.xyz%'
    `
    console.log(`✅ ${kategoriResult} kategori resmi güncellendi`)

    // Yazar tablosundaki avatar URL'lerini güncelle (varsa)
    const yazarResult = await prisma.$executeRaw`
      UPDATE "Yazar"
      SET "avatar" = REPLACE("avatar", 'lystra.xyz', 'eskisehirolay.com.tr')
      WHERE "avatar" LIKE '%lystra.xyz%'
    `
    console.log(`✅ ${yazarResult} yazar avatarı güncellendi`)

    console.log('🎉 Tüm URL\'ler başarıyla güncellendi!')
  } catch (error) {
    console.error('❌ Hata oluştu:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixImageUrls()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
