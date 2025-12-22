-- Drop tabel relasi produk

-- Drop tabel produkSnr18Kai
DROP TABLE IF EXISTS "produkSnr18Kai" CASCADE;

-- Drop tabel produkBahan  
DROP TABLE IF EXISTS "produkBahan" CASCADE;

-- Tampilkan konfirmasi
SELECT 
    'produkSnr18Kai dropped' as status,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'produkSnr18Kai') 
         THEN 'FAILED' 
         ELSE 'SUCCESS' 
    END as result

UNION ALL

SELECT 
    'produkBahan dropped' as status,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'produkBahan') 
         THEN 'FAILED' 
         ELSE 'SUCCESS' 
    END as result;
