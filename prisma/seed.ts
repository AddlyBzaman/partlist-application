import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed data for SNR18_KAI table
  const snr18KaiData = [
    {
      code: '101001-100900',
      namaBahan: 'MAGNET MI RE',
      spesifikasi: '1 PEM 0.90',
      keterangan: 'PRIMARY-1',
      pakaiPerPc: 0.0200,
      unit: 'KBS',
      hargaIdr: 10.92,
      beaMasukPersen: 0,
      freight: 0.22,
    }
  ]

  console.log('Start seeding SNR18_KAI table...')

  for (const data of snr18KaiData) {
    await prisma.sNR18_KAI.create({
      data: {
        ...data,
        // Convert decimal values to proper format
        pakaiPerPc: data.pakaiPerPc ? Number(data.pakaiPerPc) : null,
        hargaIdr: data.hargaIdr ? Number(data.hargaIdr) : null,
        beaMasukPersen: data.beaMasukPersen ? Number(data.beaMasukPersen) : null,
        freight: data.freight ? Number(data.freight) : null,
      }
    })
  }

  console.log('SNR18_KAI seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })