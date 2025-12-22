-- CreateTable
CREATE TABLE "snr18_kai" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "namaBahan" VARCHAR(255) NOT NULL,
    "spesifikasi" TEXT,
    "keterangan" TEXT,
    "pakaiPerPc" DECIMAL(12, 4),
    "unit" VARCHAR(20) NOT NULL,
    "hargaIdr" DECIMAL(18, 2),
    "hargaUsd" DECIMAL(18, 2),
    "hargaJpy" DECIMAL(18, 2),
    "beaMasukPersen" DECIMAL(5, 2),
    "freight" DECIMAL(18, 2),
    "totalUsd" DECIMAL(18, 2),
    "pembelianTerakhir" TIMESTAMP(3),
    "keteranganAkhir" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "snr18_kai_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "snr18_kai_code_idx" ON "snr18_kai"("code");
