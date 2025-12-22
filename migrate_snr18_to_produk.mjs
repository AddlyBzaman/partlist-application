import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateSnr18ToProduk() {
  try {
    console.log('Starting migration from snr18_kai to produk...');

    // 1. Get all data from snr18_kai
    const snr18Data = await prisma.sNR18_KAI.findMany();
    console.log(`Found ${snr18Data.length} records in snr18_kai`);

    // 2. Create produk records and relations
    for (const snr18 of snr18Data) {
      // Check if produk already exists
      const existingProduk = await prisma.produk.findFirst({
        where: {
          namaproduk: snr18.namaBahan
        }
      });

      if (!existingProduk) {
        // Create produk record
        const newProduk = await prisma.produk.create({
          data: {
            namaproduk: snr18.namaBahan,
            rated: snr18.spesifikasi || '',
            produk1: snr18.keterangan || '',
            produk2: '',
            produk3: '',
            stokproduk: 'tersedia',
            createdby: 'migration',
            createdat: new Date(),
            updatedat: new Date()
          }
        });

        console.log(`Created produk: ${newProduk.namaproduk} (ID: ${newProduk.id})`);

        // Create relation with snr18_kai
        await prisma.produkSnr18Kai.create({
          data: {
            produkId: newProduk.id,
            snr18KaiId: snr18.id,
            quantity: snr18.pakaiPerPc || 1,
            createdAt: new Date()
          }
        });

        console.log(`Created relation: produk ${newProduk.id} -> snr18_kai ${snr18.id}`);
      } else {
        console.log(`Produk already exists: ${existingProduk.namaproduk}`);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateSnr18ToProduk();
