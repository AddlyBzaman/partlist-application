-- Migrasi data dari snr18_kai ke tabel produk dan buat relasi

-- 1. Insert data dari snr18_kai ke tabel produk
INSERT INTO produk (namaproduk, rated, produk1, produk2, produk3, stokproduk, createdby, createdat, updatedat)
SELECT 
    namaBahan as namaproduk,
    COALESCE(spesifikasi, '') as rated,
    COALESCE(keterangan, '') as produk1,
    '' as produk2,
    '' as produk3,
    'tersedia' as stokproduk,
    'migration' as createdby,
    COALESCE(createdAt, NOW()) as createdat,
    NOW() as updatedat
FROM snr18_kai
WHERE namaBahan IS NOT NULL 
AND namaBahan != ''
AND NOT EXISTS (
    SELECT 1 FROM produk p WHERE p.namaproduk = snr18_kai.namaBahan
);

-- 2. Buat relasi antara produk baru dengan snr18_kai
INSERT INTO produkSnr18Kai (produkId, snr18KaiId, quantity, createdAt)
SELECT 
    p.id as produkId,
    s.id as snr18KaiId,
    COALESCE(s.pakaiPerPc, 1) as quantity,
    NOW() as createdAt
FROM produk p
JOIN snr18_kai s ON p.namaproduk = s.namaBahan
WHERE p.createdby = 'migration'
AND NOT EXISTS (
    SELECT 1 FROM produkSnr18Kai psk 
    WHERE psk.produkId = p.id AND psk.snr18KaiId = s.id
);

-- 3. Tampilkan hasil migrasi
SELECT 
    'Produk created' as type,
    COUNT(*) as count
FROM produk 
WHERE createdby = 'migration'

UNION ALL

SELECT 
    'Relations created' as type,
    COUNT(*) as count
FROM produkSnr18Kai psk
JOIN produk p ON psk.produkId = p.id
WHERE p.createdby = 'migration';
